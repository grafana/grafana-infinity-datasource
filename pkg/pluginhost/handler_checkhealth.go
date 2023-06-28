package pluginhost

import (
	"context"
	"fmt"
	"net/http"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
)

// CheckHealth handles health checks sent from Grafana to the plugin.
func (ds *PluginHost) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	healthCheckResult, err := CheckHealth(ctx, ds, req)
	if err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: err.Error(),
		}, nil
	}
	return healthCheckResult, nil
}

func CheckHealth(ctx context.Context, ds *PluginHost, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	client, err := getInstance(ctx, ds.im, req.PluginContext)
	if err != nil || client == nil || client.client == nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: "failed to get plugin instance",
		}, nil
	}
	args := []interface{}{}
	args = append(args, "AuthenticationMethod", client.client.Settings.AuthenticationMethod)
	if len(client.client.Settings.AllowedHosts) > 0 {
		args = append(args, "AllowedHosts_0", client.client.Settings.AllowedHosts[0])
	}
	if client.client.Settings.OAuth2Settings.OAuth2Type != "" {
		args = append(args, "OAuth2Type", client.client.Settings.OAuth2Settings.OAuth2Type)
	}
	backend.Logger.Info("performing CheckHealth in infinity datasource", args...)
	if err = client.client.Settings.Validate(); err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: fmt.Sprintf("invalid settings. %s", err.Error()),
		}, nil
	}
	if client.client.Settings.CustomHealthCheckEnabled && client.client.Settings.CustomHealthCheckUrl != "" {
		_, statusCode, _, err := client.client.GetResults(ctx, models.Query{
			Type:   models.QueryTypeUQL,
			Source: "url",
			URL:    client.client.Settings.CustomHealthCheckUrl,
			URLOptions: models.URLOptions{
				Method: http.MethodGet,
			},
		}, req.Headers)
		if err != nil {
			return &backend.CheckHealthResult{
				Status:  backend.HealthStatusError,
				Message: fmt.Sprintf("health check failed with url %s. error received: %s", client.client.Settings.CustomHealthCheckUrl, err.Error()),
			}, nil
		}
		if statusCode != http.StatusOK {
			return &backend.CheckHealthResult{
				Status:  backend.HealthStatusError,
				Message: fmt.Sprintf("health check failed with url %s. http status code received: %d", client.client.Settings.CustomHealthCheckUrl, statusCode),
			}, nil
		}
		if statusCode == http.StatusOK {
			return &backend.CheckHealthResult{
				Status:  backend.HealthStatusOk,
				Message: fmt.Sprintf("health check successful with url %s. http status code received: %d", client.client.Settings.CustomHealthCheckUrl, statusCode),
			}, nil
		}
	}
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "OK",
	}, nil
}
