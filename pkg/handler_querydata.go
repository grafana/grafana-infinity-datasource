package main

import (
	"context"
	"encoding/json"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
)

// QueryData handles multiple queries and returns multiple responses.
func (ds *PluginHost) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()
	client, err := getInstance(ds.im, req.PluginContext)
	if err != nil {
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
	customMeta := map[string]interface{}{}
	customMeta["query"] = query
	if query.Source == "url" {
		response, err := infClient.GetResults(query, requestHeaders)
		frame.Meta.ExecutedQueryString = query.URL
		customMeta["data"] = response
		if err != nil {
			customMeta["error"] = err
		}
	}
	if query.Source == "inline" {
		customMeta["data"] = query.Data
	}
	frame.Meta.Custom = customMeta
	response.Frames = append(response.Frames, frame)
	return response
}
