package main

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/tidwall/gjson"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/framer"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
)

type CustomMeta struct {
	Query                  infinity.Query `json:"query"`
	Data                   interface{}    `json:"data"`
	ResponseCodeFromServer int            `json:"responseCodeFromServer"`
	Duration               time.Duration  `json:"duration"`
	Error                  string         `json:"error"`
}

// QueryData handles multiple queries and returns multiple responses.
func (ds *PluginHost) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()
	client, err := getInstance(ds.im, req.PluginContext)
	if err != nil {
		backend.Logger.Error("error getting infinity instance", "error", err.Error())
		return response, err
	}
	for _, q := range req.Queries {
		res := QueryData(ctx, q, *client.client, req.Headers)
		response.Responses[q.RefID] = res
	}
	return response, nil
}

func QueryData(ctx context.Context, backendQuery backend.DataQuery, infClient infinity.Client, requestHeaders map[string]string) (response backend.DataResponse) {
	var query infinity.Query
	response.Error = json.Unmarshal(backendQuery.JSON, &query)
	if response.Error != nil {
		backend.Logger.Error("error un-marshaling the query", "error", response.Error.Error())
		return response
	}

	query, err := InterpolateInfinityQuery(query, backendQuery.TimeRange)
	if err != nil {
		backend.Logger.Error("error applying macros", "error", err.Error())
		response.Error = err
		return response
	}

	frameName := query.RefID
	if frameName == "" {
		frameName = "response"
	}
	frame := data.NewFrame(frameName)
	frame.Meta = &data.FrameMeta{
		ExecutedQueryString: "This feature is not available for this type of query yet",
	}
	customMeta := &CustomMeta{
		Query:                  query,
		Data:                   nil,
		ResponseCodeFromServer: 0,
		Error:                  "",
	}
	if query.Source == "url" {
		urlResponseObject, statusCode, duration, err := infClient.GetResults(query, requestHeaders)
		if query.Type == infinity.QueryTypeJSONBackend {
			if query.RootSelector != "" {
				responseString, err := json.Marshal(urlResponseObject)
				if err != nil {
					backend.Logger.Error("error json parsing root data", "error", err.Error())
					response.Error = fmt.Errorf("error parsing json root data")
					return response
				}
				if !gjson.Valid(string(responseString)) {
					backend.Logger.Error("error json parsing root data")
					response.Error = fmt.Errorf("error parsing json root data")
					return response
				}
				r := gjson.Get(string(responseString), query.RootSelector)
				var out interface{}
				err = json.Unmarshal([]byte(r.String()), &out)
				if err != nil {
					backend.Logger.Error("error json parsing root data", "error", err.Error())
					response.Error = fmt.Errorf("error parsing json root data")
					return response
				}
				urlResponseObject = out
			}
			newFrame, err := framer.ToDataFrame(query.RefID, urlResponseObject, framer.FramerOptions{}, "")
			if err != nil {
				backend.Logger.Error("error getting response for query", "error", err.Error())
				customMeta.Error = err.Error()
			}
			if newFrame != nil {
				for _, ff := range newFrame.Fields {
					frame.Fields = append(frame.Fields, ff)
				}
			}
		}
		frame.Meta.ExecutedQueryString = infClient.GetExecutedURL(query)
		customMeta.Data = urlResponseObject
		customMeta.ResponseCodeFromServer = statusCode
		customMeta.Duration = duration
		if err != nil {
			backend.Logger.Error("error getting response for query", "error", err.Error())
			customMeta.Error = err.Error()
		}
	}
	if query.Source == "inline" {
		customMeta.Data = query.Data
		if query.Type == infinity.QueryTypeJSONBackend {
			data := query.Data
			if query.RootSelector != "" {
				if !gjson.Valid(data) {
					backend.Logger.Error("error json parsing root data")
					response.Error = fmt.Errorf("error parsing json root data")
					return response
				}
				r := gjson.Get(data, query.RootSelector)
				data = r.String()
			}
			var out interface{}
			err := json.Unmarshal([]byte(data), &out)
			if err != nil {
				backend.Logger.Error("error json parsing", "error", err.Error())
				customMeta.Error = fmt.Errorf("error parsing json %s", err.Error()).Error()
			}
			newFrame, err := framer.ToDataFrame(query.RefID, out, framer.FramerOptions{}, "")
			if err != nil {
				backend.Logger.Error("error building frame", "error", err.Error())
				customMeta.Error = err.Error()
			}
			if newFrame != nil {
				for _, ff := range newFrame.Fields {
					frame.Fields = append(frame.Fields, ff)
				}
			}
		}
	}
	frame.Meta.Custom = customMeta
	response.Frames = append(response.Frames, frame)
	return response
}
