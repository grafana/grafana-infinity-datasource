package infinity

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func (ds *InfinityDatasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	_, err := ds.getDatasourceInstance(ctx, req.PluginContext)
	if err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: err.Error(),
		}, nil
	}
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: PluginHealthCheckMessageOK,
	}, nil
}
