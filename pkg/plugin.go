package main

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
)

func newDatasource() datasource.ServeOpts {

	handler := &InfinityDatasource{
		im: datasource.NewInstanceManager(newDataSourceInstance),
	}
	router := mux.NewRouter()
	router.HandleFunc("/proxy", handler.proxyHandler)
	return datasource.ServeOpts{
		QueryDataHandler:    handler,
		CheckHealthHandler:  handler,
		CallResourceHandler: httpadapter.New(router),
	}
}

// InfinityDatasource is an example datasource used to scaffold
type InfinityDatasource struct {
	im instancemgmt.InstanceManager
}

// CheckHealth handles health checks sent from Grafana to the plugin.
func (ds *InfinityDatasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Settings saved",
	}, nil
}

// QueryData handles multiple queries and returns multiple responses.
func (ds *InfinityDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()
	for _, q := range req.Queries {
		res := ds.query(ctx, q)
		response.Responses[q.RefID] = res
	}
	return response, nil
}

func (ds *InfinityDatasource) query(ctx context.Context, query backend.DataQuery) (response backend.DataResponse) {
	var qm infinity.Query
	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return response
	}
	frame := data.NewFrame("response")
	response.Frames = append(response.Frames, frame)
	return response
}

type instanceSettings struct {
	client *infinity.Client
}

func (is *instanceSettings) Dispose() {}

func newDataSourceInstance(setting backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	settings, err := infinity.LoadSettings(setting)
	if err != nil {
		return nil, err
	}
	client, err := infinity.NewClient(settings)
	if err != nil {
		return nil, err
	}
	return &instanceSettings{
		client: client,
	}, nil
}

func getInstance(im instancemgmt.InstanceManager, ctx backend.PluginContext) (*instanceSettings, error) {
	instance, err := im.Get(ctx)
	if err != nil {
		return nil, err
	}
	return instance.(*instanceSettings), nil
}

func getInstanceFromRequest(im instancemgmt.InstanceManager, req *http.Request) (*instanceSettings, error) {
	ctx := httpadapter.PluginConfigFromContext(req.Context())
	return getInstance(im, ctx)
}
