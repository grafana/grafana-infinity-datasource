package infinity

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/grafana/grafana-azure-sdk-go/azcredentials"
	"github.com/grafana/grafana-azure-sdk-go/azhttpclient"
	"github.com/grafana/grafana-azure-sdk-go/azsettings"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
)

func ApplyAzureAuth(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) (*http.Client, error) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "ApplyAzureAuth")
	defer span.End()

	if IsAzureAuthConfigured(settings) {
		azSettings := &azsettings.AzureSettings{
			Cloud:                   string(settings.MicrosoftSettings.Cloud),
			ManagedIdentityEnabled:  true,
			WorkloadIdentityEnabled: true,
		}

		tenantID := settings.MicrosoftSettings.TenantID
		if tenantID == "" {
			tenantID = os.Getenv("AZURE_TENANT_ID")
		}

		clientID := settings.OAuth2Settings.ClientID
		if clientID == "" {
			clientID = os.Getenv("AZURE_CLIENT_ID")
		}

		var credentials azcredentials.AzureCredentials

		switch settings.MicrosoftSettings.AuthType {
		case models.MicrosoftAuthTypeClientSecret:
			clientSecret := settings.OAuth2Settings.ClientSecret
			if clientSecret == "" {
				clientSecret = os.Getenv("AZURE_CLIENT_SECRET")
			}

			credentials = &azcredentials.AzureClientSecretCredentials{
				AzureCloud:   string(settings.MicrosoftSettings.Cloud),
				TenantId:     tenantID,
				ClientId:     clientID,
				ClientSecret: clientSecret,
			}
		case models.MicrosoftAuthTypeManagedIdentity:
			azSettings.ManagedIdentityClientId = clientID

			credentials = &azcredentials.AzureManagedIdentityCredentials{
				ClientId: clientID,
			}
		case models.MicrosoftAuthTypeWorkloadIdentity:
			azSettings.WorkloadIdentitySettings = &azsettings.WorkloadIdentitySettings{
				TenantId: tenantID,
				ClientId: clientID,
			}

			credentials = &azcredentials.AzureWorkloadIdentityCredentials{}
		default:
			panic(fmt.Errorf("invalid auth type '%s'", settings.MicrosoftSettings.AuthType))
		}

		authOpts := azhttpclient.NewAuthOptions(azSettings)
		authOpts.Scopes(settings.OAuth2Settings.Scopes)

		httpClient.Transport = azhttpclient.AzureMiddleware(authOpts, credentials).
			CreateMiddleware(httpclient.Options{}, httpClient.Transport)
	}
	return httpClient, nil
}

func IsAzureAuthConfigured(settings models.InfinitySettings) bool {
	return settings.AuthenticationMethod == models.AuthenticationMethodMicrosoft
}
