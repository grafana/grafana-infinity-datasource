package infinity

import (
	"context"
	"fmt"
	"github.com/grafana/grafana-azure-sdk-go/v2/azcredentials"
	"github.com/grafana/grafana-azure-sdk-go/v2/azhttpclient"
	"github.com/grafana/grafana-azure-sdk-go/v2/azsettings"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data/utils/maputil"
	"net/http"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
)

func ApplyAzureAuth(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) (*http.Client, error) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "ApplyAzureAuth")
	defer span.End()

	if !IsAzureAuthConfigured(settings) {
		return httpClient, nil
	}

	credentialsObj, err := maputil.GetMapOptional(settings.RawData, "azureCredentials")
	if err != nil {
		return nil, err
	} else if credentialsObj == nil {
		return httpClient, nil
	}

	azSettings, err := azsettings.ReadFromEnv()
	if err != nil {
		return nil, err
	}

	// set authType if not set
	// this can happen if the user manually provisions the datasource without setting the authType
	if credentialsObj["authType"] == nil || credentialsObj["authType"] == "" {
		credentialsObj["authType"] = azcredentials.AzureAuthClientSecret
	}

	// set azureCloud if not set
	// this can happen if the user manually provisions the datasource without setting the azureCloud
	if credentialsObj["azureCloud"] == nil || credentialsObj["azureCloud"] == "" {
		credentialsObj["azureCloud"] = azSettings.GetDefaultCloud()
	}

	azCredentials, err := azcredentials.FromDatasourceData(settings.RawData, settings.RawSecureData)
	if err != nil {
		return nil, err
	}

	authOpts := azhttpclient.NewAuthOptions(azSettings)

	// set scopes
	if scopes, ok := credentialsObj["scopes"].([]any); ok {
		stringScopes, err := toStringSlice(scopes)
		if err != nil {
			return nil, err
		}

		authOpts.Scopes(stringScopes)
	}

	httpClient.Transport = azhttpclient.AzureMiddleware(authOpts, azCredentials).
		CreateMiddleware(httpclient.Options{}, httpClient.Transport)

	return httpClient, nil
}

func IsAzureAuthConfigured(settings models.InfinitySettings) bool {
	return settings.AuthenticationMethod == models.AuthenticationMethodAzure
}

func toStringSlice(arr []any) ([]string, error) {
	result := make([]string, len(arr))
	for i, v := range arr {
		if s, ok := v.(string); ok {
			result[i] = s
		} else {
			return nil, fmt.Errorf("expected string, got %T", v)
		}
	}
	return result, nil
}
