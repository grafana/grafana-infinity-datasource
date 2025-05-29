package pluginhost

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// CheckHealth handles health checks sent from Grafana to the plugin.
func (ds *DataSource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	logger := backend.Logger.FromContext(ctx)
	healthCheckResult, err := CheckHealth(ctx, ds.client, req)
	if err != nil {
		logger.Debug("received error while performing health check", "err", err.Error())
		return healthCheckError("", err.Error(), "")
	}
	return healthCheckResult, nil
}

func CheckHealth(ctx context.Context, client *infinity.Client, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	logger := backend.Logger.FromContext(ctx)
	if client == nil {
		return healthCheckError("", models.ErrFailedToGetPluginInstance.Error(), "")
	}
	args := []interface{}{}
	args = append(args, "AuthenticationMethod", client.Settings.AuthenticationMethod)
	if len(client.Settings.AllowedHosts) > 0 {
		args = append(args, "AllowedHosts_0", client.Settings.AllowedHosts[0])
	}
	if client.Settings.OAuth2Settings.OAuth2Type != "" {
		args = append(args, "OAuth2Type", client.Settings.OAuth2Settings.OAuth2Type)
	}
	logger.Debug("performing CheckHealth in infinity datasource", args...)
	if err := client.Settings.Validate(); err != nil {
		if errors.Is(err, models.ErrInvalidConfigHostNotAllowed) {
			return healthCheckError(err.Error(), err.Error(), "")
		}
		return healthCheckError(err.Error(), errors.Join(models.ErrInvalidConfig, err).Error(), "")
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
			if errors.Is(err, models.ErrUnsuccessfulHTTPResponseStatus) {
				if unwrappedErr := errors.Unwrap(err); unwrappedErr != nil {
					return healthCheckError(unwrappedErr.Error(), err.Error(), "")
				}
			}
			if errors.Is(err, models.ErrInvalidConfigHostNotAllowed) {
				if unwrappedErr := errors.Unwrap(err); unwrappedErr != nil {
					return healthCheckError(unwrappedErr.Error(), err.Error(), "")
				}
			}
			if strings.Contains(err.Error(), "no such host") {
				return healthCheckError("Network error: no such host", err.Error(), "")
			}
			if strings.Contains(err.Error(), "network unreachable") {
				return healthCheckError("Network error: network unreachable", err.Error(), "")
			}
			if strings.Contains(err.Error(), "context deadline exceeded") {
				return healthCheckError("Network error: timeout", err.Error(), "")
			}
			if strings.Contains(err.Error(), "connection timed out") {
				return healthCheckError("Network error: timeout", err.Error(), "")
			}
			if strings.Contains(err.Error(), "socks connect") && (strings.Contains(err.Error(), "network unreachable") || strings.Contains(err.Error(), "host unreachable")) {
				return healthCheckError("Network error: error connecting through PDC", err.Error(), "https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/")
			}
			return healthCheckError("", err.Error(), "")
		}
		if statusCode != http.StatusOK {
			msg := fmt.Sprintf("%s : %d", models.ErrUnsuccessfulHTTPResponseStatus, statusCode)
			return healthCheckError("", msg, "")
		}
		if statusCode == http.StatusOK {
			return healthCheckSuccess("")
		}
	}
	return healthCheckSuccess("")
}

func healthCheckSuccess(msg string) (*backend.CheckHealthResult, error) {
	if msg == "" {
		msg = "Health check successful"
	}
	return &backend.CheckHealthResult{Status: backend.HealthStatusOk, Message: msg}, nil
}

func healthCheckError(msg string, verboseMessage string, errorLink string) (*backend.CheckHealthResult, error) {
	outMsg := "Health check failed"
	if msg != "" {
		outMsg += ". " + msg
	}
	jsonDetails := map[string]string{}
	if verboseMessage != "" {
		jsonDetails["verboseMessage"] = verboseMessage
	}
	if errorLink != "" {
		jsonDetails["errorLink"] = errorLink
	}
	jsonDetailsBytes, err := json.Marshal(jsonDetails)
	if err != nil {
		return &backend.CheckHealthResult{Status: backend.HealthStatusError, Message: outMsg}, nil
	}
	return &backend.CheckHealthResult{Status: backend.HealthStatusError, Message: outMsg, JSONDetails: jsonDetailsBytes}, nil
}
