package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/yesoreyeram/grafana-framer/jsonFramer"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
)

type CustomMeta struct {
	Query                  models.Query  `json:"query"`
	Data                   interface{}   `json:"data"`
	ResponseCodeFromServer int           `json:"responseCodeFromServer"`
	Duration               time.Duration `json:"duration"`
	Error                  string        `json:"error"`
}

type key string

const contextKeyInstanceID key = "InstanceID"
const contextKeyInstanceUID key = "InstanceUID"
const contextKeyInstanceName key = "InstanceName"

// QueryData handles multiple queries and returns multiple responses.
func (ds *PluginHost) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()
	client, err := getInstance(ds.im, req.PluginContext)
	if err != nil {
		backend.Logger.Error("error getting infinity instance", "error", err.Error())
		return response, err
	}
	if req.PluginContext.DataSourceInstanceSettings != nil {
		ctx = context.WithValue(ctx, contextKeyInstanceID, req.PluginContext.DataSourceInstanceSettings.ID)
		ctx = context.WithValue(ctx, contextKeyInstanceUID, req.PluginContext.DataSourceInstanceSettings.UID)
		ctx = context.WithValue(ctx, contextKeyInstanceName, req.PluginContext.DataSourceInstanceSettings.Name)
	}
	for _, q := range req.Queries {
		res := QueryData(ctx, q, *client.client, req.Headers)
		response.Responses[q.RefID] = res
	}
	return response, nil
}

func QueryData(ctx context.Context, backendQuery backend.DataQuery, infClient infinity.Client, requestHeaders map[string]string) (response backend.DataResponse) {
	//region Loading Query
	query, err := models.LoadQuery(backendQuery)
	if err != nil {
		backend.Logger.Error("error un-marshaling the query", "error", err.Error())
		response.Error = err
		return response
	}
	//endregion
	//region Validating Query
	if infClient.Settings.AuthenticationMethod != models.AuthenticationMethodNone && infClient.Settings.AuthenticationMethod != "" && len(infClient.Settings.AllowedHosts) < 1 && query.Source == "url" {
		response.Error = errors.New("Datasource is missing allowed hosts/URLs. Configure it in the datasource settings page.")
		return response
	}
	//endregion
	//region Tracking Query
	var instanceID string
	if ctx.Value(contextKeyInstanceUID) != nil {
		instanceID = fmt.Sprintf("%v", ctx.Value(contextKeyInstanceID))
	}
	var instanceUID string
	if ctx.Value(contextKeyInstanceUID) != nil {
		instanceUID = ctx.Value(contextKeyInstanceUID).(string)
	}
	var instanceName string
	if ctx.Value(contextKeyInstanceUID) != nil {
		instanceName = ctx.Value(contextKeyInstanceName).(string)
	}
	PromRequestsTotal.With(prometheus.Labels{
		"instanceID":   instanceID,
		"instanceUID":  instanceUID,
		"instanceName": instanceName,
		"type":         query.Type,
		"source":       query.Source,
		"format":       query.Format,
		"authType":     strings.Trim(infClient.Settings.AuthenticationMethod+" "+infClient.Settings.OAuth2Settings.OAuth2Type, " "),
	}).Inc()
	//endregion
	//region Frame Builder
	frame := getDummyFrame(query)
	if query.Source == "url" {
		frame, err = getFrameForURLSources(query, infClient, requestHeaders)
		if err != nil {
			response.Frames = append(response.Frames, frame)
			response.Error = err
			return response
		}
	}
	if query.Source == "inline" {
		frame, err = getFrameForInlineSources(query)
		if err != nil {
			response.Frames = append(response.Frames, frame)
			response.Error = err
			return response
		}
	}
	response.Frames = append(response.Frames, frame)
	//endregion
	return response
}

func getFrameForURLSources(query models.Query, infClient infinity.Client, requestHeaders map[string]string) (*data.Frame, error) {
	frame := getDummyFrame(query)
	urlResponseObject, statusCode, duration, err := infClient.GetResults(query, requestHeaders)
	if query.Type == models.QueryTypeJSONBackend {
		responseString, err := json.Marshal(urlResponseObject)
		if err != nil {
			backend.Logger.Error("error json parsing root data", "error", err.Error())
			return frame, fmt.Errorf("error parsing json root data")
		}
		newFrame, err := jsonFramer.JsonStringToFrame(string(responseString), jsonFramer.JSONFramerOptions{
			FrameName:    query.RefID,
			RootSelector: query.RootSelector,
			Columns:      []jsonFramer.ColumnSelector{},
		})
		frame.Meta = &data.FrameMeta{
			Custom: &CustomMeta{
				Query: query,
			},
		}
		if err != nil {
			backend.Logger.Error("error getting response for query", "error", err.Error())
			frame.Meta.Custom = &CustomMeta{
				Query: query,
				Error: err.Error(),
			}
			return frame, err
		}
		if newFrame != nil {
			frame.Fields = append(frame.Fields, newFrame.Fields...)
		}
		return frame, err
	}
	frame.Meta.ExecutedQueryString = infClient.GetExecutedURL(query)
	frame.Meta.Custom = &CustomMeta{
		Query:                  query,
		Data:                   urlResponseObject,
		ResponseCodeFromServer: statusCode,
		Duration:               duration,
	}
	if err != nil {
		backend.Logger.Error("error getting response for query", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{
			Data:                   urlResponseObject,
			ResponseCodeFromServer: statusCode,
			Duration:               duration,
			Query:                  query,
			Error:                  err.Error(),
		}
		return frame, err
	}
	return frame, nil
}

func getFrameForInlineSources(query models.Query) (*data.Frame, error) {
	frame := getDummyFrame(query)
	if query.Type == models.QueryTypeJSONBackend {
		newFrame, err := jsonFramer.JsonStringToFrame(query.Data, jsonFramer.JSONFramerOptions{
			FrameName:    query.RefID,
			RootSelector: query.RootSelector,
			Columns:      []jsonFramer.ColumnSelector{},
		})
		if err != nil {
			backend.Logger.Error("error building frame", "error", err.Error())
			frame.Meta.Custom = &CustomMeta{
				Query: query,
				Error: err.Error(),
			}
			return newFrame, err
		}
		if newFrame != nil {
			frame.Fields = append(frame.Fields, newFrame.Fields...)
		}
	}
	return frame, nil
}

func getDummyFrame(query models.Query) *data.Frame {
	frameName := query.RefID
	if frameName == "" {
		frameName = "response"
	}
	frame := data.NewFrame(frameName)
	frame.Meta = &data.FrameMeta{
		ExecutedQueryString: "This feature is not available for this type of query yet",
		Custom: &CustomMeta{
			Query:                  query,
			Data:                   query.Data,
			ResponseCodeFromServer: 0,
			Error:                  "",
		},
	}
	return frame
}
