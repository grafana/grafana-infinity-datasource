package main

import (
	"context"
	"encoding/json"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
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
		response, statusCode, duration, err := infClient.GetResults(query, requestHeaders)
		frame.Meta.ExecutedQueryString = infClient.GetExecutedURL(query)
		customMeta.Data = response
		customMeta.ResponseCodeFromServer = statusCode
		customMeta.Duration = duration
		if err != nil {
			backend.Logger.Error("error getting response for query", "error", err.Error())
			customMeta.Error = err.Error()
		}
	}
	if query.Source == "inline" {
		customMeta.Data = query.Data
	}
	frame.Meta.Custom = customMeta
	response.Frames = append(response.Frames, frame)
	return response
}
