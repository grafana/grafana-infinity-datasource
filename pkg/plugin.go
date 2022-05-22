package main

import (
	"net/http"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
)

type PluginHost struct {
	im instancemgmt.InstanceManager
}

func newDatasource() datasource.ServeOpts {
	host := &PluginHost{
		im: datasource.NewInstanceManager(newDataSourceInstance),
	}
	return datasource.ServeOpts{
		QueryDataHandler:    host,
		CheckHealthHandler:  host,
		CallResourceHandler: httpadapter.New(host.getRouter()),
	}
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
	client, err := infinity.NewClientWithCounters(settings, counters)
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
