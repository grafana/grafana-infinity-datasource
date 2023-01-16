package pluginhost

import (
	"context"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// CheckHealth handles health checks sent from Grafana to the plugin.
func (ds *PluginHost) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	client, err := getInstance(ds.im, req.PluginContext)
	if err != nil || client == nil || client.client == nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: "failed to get plugin instance",
		}, nil
	}
	if err = client.client.Settings.Validate(); err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: fmt.Sprintf("invalid settings. %s", err.Error()),
		}, nil
	}
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "OK",
	}, nil
}
