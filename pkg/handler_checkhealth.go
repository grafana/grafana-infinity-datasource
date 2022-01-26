package main

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// CheckHealth handles health checks sent from Grafana to the plugin.
func (ds *PluginHost) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Settings saved",
	}, nil
}
