package main

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
	settingsSrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/settings"
)

type key string

// QueryData handles multiple queries and returns multiple responses.
func (ds *PluginHost) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {

	response := backend.NewQueryDataResponse()
	client, err := getInstance(ds.im, req.PluginContext)
	if err != nil {
		backend.Logger.Error("error getting infinity instance", "error", err.Error())
		return response, err
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
	//region Frame Builder
	frame := infinity.GetDummyFrame(query)
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
	response.Frames = append(response.Frames, frame)
	if infClient.Settings.AuthenticationMethod != settingsSrv.AuthenticationMethodNone && infClient.Settings.AuthenticationMethod != "" && len(infClient.Settings.AllowedHosts) < 1 && query.Source == "url" {
		frame.AppendNotices(data.Notice{
			Text: "Datasource is missing allowed hosts/URLs. Configure it in the datasource settings page for enhanced security.",
		})
	}
	//endregion
	return response
}
