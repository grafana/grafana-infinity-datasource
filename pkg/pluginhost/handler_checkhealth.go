package pluginhost

import (
	"context"
	"fmt"
	"net/http"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// CheckHealth handles health checks sent from Grafana to the plugin.
func (ds *PluginHost) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	logger := backend.Logger.FromContext(ctx)
	healthCheckResult, err := CheckHealth(ctx, ds, req)
	if err != nil {
		logger.Error("received error while performing health check", "err", err.Error())
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: err.Error(),
		}, nil
	}
	return healthCheckResult, nil
}

func CheckHealth(ctx context.Context, ds *PluginHost, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	logger := backend.Logger.FromContext(ctx)
	client, err := getInstance(ctx, ds.im, req.PluginContext)
	if err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: fmt.Sprintf("error loading datasource settings. %s", err.Error()),
		}, nil
	}
	if client == nil || client.client == nil {
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
	logger.Info("performing CheckHealth in infinity datasource", args...)
	if err = client.client.Settings.Validate(); err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: fmt.Sprintf("invalid settings. %s", err.Error()),
		}, nil
	}
	if client.client.Settings.AuthenticationMethod == models.AuthenticationMethodAzureBlob {
		return checkHealthAzureBlobStorage(ctx, client)
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

func healthCheckError(msg string) (*backend.CheckHealthResult, error) {
	return &backend.CheckHealthResult{Status: backend.HealthStatusError, Message: msg}, nil
}
