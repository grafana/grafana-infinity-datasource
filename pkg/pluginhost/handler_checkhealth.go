package pluginhost

import (
	"context"
	"encoding/json"
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
		return healthCheckErrorDetailed("", err.Error(), "")
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
			return healthCheckErrorDetailed("", err.Error(), "")
		}
		if statusCode != http.StatusOK {
			return healthCheckErrorDetailed("", fmt.Sprintf("http status code received : %d", statusCode), "")
		}
		if statusCode == http.StatusOK {
			return healthCheckSuccess("")
		}
	}
	return healthCheckSuccess("")
}
func healthCheckSuccess(msg string) (*backend.CheckHealthResult, error) {
	if msg == "" {
		msg = "health check successful"
	}
	return &backend.CheckHealthResult{Status: backend.HealthStatusOk, Message: msg}, nil
}
func healthCheckError(msg string) (*backend.CheckHealthResult, error) {
	return healthCheckErrorDetailed(msg, "", "")
}

func healthCheckErrorDetailed(msg string, verboseMessage string, errorLink string) (*backend.CheckHealthResult, error) {
	if msg == "" {
		msg = "health check failed. Check details below for more information"
	}
	jsonDetails := map[string]string{}
	if verboseMessage != "" {
		jsonDetails["verboseMessage"] = verboseMessage
	}
	if errorLink != "" {
		jsonDetails["errorLink"] = verboseMessage
	}
	jsonDetailsBytes, err := json.Marshal(jsonDetails)
	if err != nil {
		return &backend.CheckHealthResult{Status: backend.HealthStatusError, Message: msg}, nil
	}
	return &backend.CheckHealthResult{Status: backend.HealthStatusError, Message: msg, JSONDetails: jsonDetailsBytes}, nil
}
