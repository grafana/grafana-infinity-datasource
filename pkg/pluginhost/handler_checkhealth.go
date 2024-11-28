package pluginhost

import (
	"context"
	"fmt"
	"net/http"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// CheckHealth handles health checks sent from Grafana to the plugin.
func (ds *DataSource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	logger := backend.Logger.FromContext(ctx)
	healthCheckResult, err := CheckHealth(ctx, ds.client, req)
	if err != nil {
		logger.Error("received error while performing health check", "err", err.Error())
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: err.Error(),
		}, nil
	}
	return healthCheckResult, nil
}

func CheckHealth(ctx context.Context, client *infinity.Client, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	logger := backend.Logger.FromContext(ctx)
	if client == nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: "failed to get plugin instance",
		}, nil
	}
	args := []interface{}{}
	args = append(args, "AuthenticationMethod", client.Settings.AuthenticationMethod)
	if len(client.Settings.AllowedHosts) > 0 {
		args = append(args, "AllowedHosts_0", client.Settings.AllowedHosts[0])
	}
	if client.Settings.OAuth2Settings.OAuth2Type != "" {
		args = append(args, "OAuth2Type", client.Settings.OAuth2Settings.OAuth2Type)
	}
	logger.Info("performing CheckHealth in infinity datasource", args...)
	if err := client.Settings.Validate(); err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: fmt.Sprintf("invalid settings. %s", err.Error()),
		}, nil
	}
	if client.Settings.AuthenticationMethod == models.AuthenticationMethodAzureBlob {
		return checkHealthAzureBlobStorage(ctx, client)
	}
	if client.Settings.CustomHealthCheckEnabled && client.Settings.CustomHealthCheckUrl != "" {
		_, statusCode, _, err := client.GetResults(ctx, &backend.PluginContext{}, models.Query{
			Type:   models.QueryTypeUQL,
			Source: "url",
			URL:    client.Settings.CustomHealthCheckUrl,
			URLOptions: models.URLOptions{
				Method: http.MethodGet,
			},
		}, req.Headers)
		if err != nil {
			return &backend.CheckHealthResult{
				Status:  backend.HealthStatusError,
				Message: fmt.Sprintf("health check failed with url %s. error received: %s", client.Settings.CustomHealthCheckUrl, err.Error()),
			}, nil
		}
		if statusCode != http.StatusOK {
			return &backend.CheckHealthResult{
				Status:  backend.HealthStatusError,
				Message: fmt.Sprintf("health check failed with url %s. http status code received: %d", client.Settings.CustomHealthCheckUrl, statusCode),
			}, nil
		}
		if statusCode == http.StatusOK {
			return &backend.CheckHealthResult{
				Status:  backend.HealthStatusOk,
				Message: fmt.Sprintf("health check successful with url %s. http status code received: %d", client.Settings.CustomHealthCheckUrl, statusCode),
			}, nil
		}
	}
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "OK",
	}, nil
}

func healthCheckError(msg string) (*backend.CheckHealthResult, error) {
	return &backend.CheckHealthResult{Status: backend.HealthStatusError, Message: msg}, nil
}
