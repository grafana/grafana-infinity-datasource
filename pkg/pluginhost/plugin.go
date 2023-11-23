package pluginhost

import (
	"context"
	"net/http"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
)

type PluginHost struct {
	im instancemgmt.InstanceManager
}

func NewDatasource() datasource.ServeOpts {
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

func newDataSourceInstance(ctx context.Context, setting backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	settings, err := models.LoadSettings(setting)
	if err != nil {
		return nil, err
	}
	client, err := infinity.NewClient(ctx, settings)
	if err != nil {
		return nil, err
	}
	return &instanceSettings{
		client: client,
	}, nil
}

func getInstance(ctx context.Context, im instancemgmt.InstanceManager, pCtx backend.PluginContext) (*instanceSettings, error) {
	instance, err := im.Get(ctx, pCtx)
	if err != nil {
		return nil, err
	}
	return instance.(*instanceSettings), nil
}

func getInstanceFromRequest(ctx context.Context, im instancemgmt.InstanceManager, req *http.Request) (*instanceSettings, error) {
	pCtx := httpadapter.PluginConfigFromContext(req.Context())
	return getInstance(ctx, im, pCtx)
}
