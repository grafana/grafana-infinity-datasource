package pluginhost

import (
	"context"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
)

var (
	_ backend.QueryDataHandler      = (*DataSource)(nil)
	_ backend.CheckHealthHandler    = (*DataSource)(nil)
	_ backend.CallResourceHandler   = (*DataSource)(nil)
	_ instancemgmt.InstanceDisposer = (*DataSource)(nil)
)

type DataSource struct {
	client *infinity.Client
}

func NewDataSourceInstance(ctx context.Context, setting backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	settings, err := models.LoadSettings(ctx, setting)
	if err != nil {
		return nil, err
	}

	client, err := infinity.NewClient(ctx, settings)
	if err != nil {
		return nil, err
	}
	return &DataSource{
		client: client,
	}, nil
}
