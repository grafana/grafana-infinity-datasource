package main

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
)

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
		res := QueryData(ctx, q, *client.client, req.Headers, req.PluginContext)
		response.Responses[q.RefID] = res
	}
	return response, nil
}

func QueryData(ctx context.Context, backendQuery backend.DataQuery, infClient infinity.Client, requestHeaders map[string]string, pluginContext backend.PluginContext) (response backend.DataResponse) {
	//region Loading Query
	query, err := querySrv.LoadQuery(backendQuery, pluginContext)
	if err != nil {
		backend.Logger.Error("error un-marshaling the query", "error", err.Error())
		response.Error = err
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
		"type":         string(query.Type),
		"source":       query.Source,
		"format":       query.Format,
		"authType":     strings.Trim(infClient.Settings.AuthenticationMethod+" "+infClient.Settings.OAuth2Settings.OAuth2Type, " "),
	}).Inc()
	//endregion
	//region Frame Builder
	frame := infinity.GetDummyFrame(query)
	switch query.Type {
	case querySrv.QueryTypeGoogleSheets:
		sheetId := query.Spreadsheet
		sheetName := query.SheetName
		sheetRange := query.SheetRange
		if sheetName != "" {
			sheetRange = sheetName + "!" + sheetRange
		}
		if sheetId == "" {
			response.Error = errors.New("invalid sheet ID")
			return response
		}
		query.URL = fmt.Sprintf("https://sheets.googleapis.com/v4/spreadsheets/%s?includeGridData=true&ranges=%s", sheetId, sheetRange)
		frame, err = infinity.GetFrameForURLSources(query, infClient, requestHeaders)
		if err != nil {
			response.Frames = append(response.Frames, frame)
			response.Error = err
			return response
		}
	default:
		if query.Source == "url" {
			frame, err = infinity.GetFrameForURLSources(query, infClient, requestHeaders)
			if err != nil {
				response.Frames = append(response.Frames, frame)
				response.Error = err
				return response
			}
		}
		if query.Source == "inline" {
			frame, err = infinity.GetFrameForInlineSources(query)
			if err != nil {
				response.Frames = append(response.Frames, frame)
				response.Error = err
				return response
			}
		}
	}
	// if infClient.Settings.AuthenticationMethod != settingsSrv.AuthenticationMethodNone && infClient.Settings.AuthenticationMethod != "" && len(infClient.Settings.AllowedHosts) < 1 && query.Source == "url" {
	// 	if frame != nil && frame.Meta != nil {
	// 		frame.AppendNotices(data.Notice{
	// 			Text: "Datasource is missing allowed hosts/URLs. Configure it in the datasource settings page for enhanced security.",
	// 		})
	// 	}
	// }
	response.Frames = append(response.Frames, frame)
	//endregion
	return response
}
