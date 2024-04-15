package infinity

import (
	"context"
	"fmt"
	"net/http"
	"strings"

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
		azSettings, err := azsettings.ReadFromEnv()
		if err != nil {
			return nil, err
		}

		var credentials azcredentials.AzureCredentials

		switch settings.MicrosoftSettings.AuthType {
		case models.MicrosoftAuthTypeClientSecret:

			if strings.TrimSpace(settings.MicrosoftSettings.TenantID) == "" {
				return nil, fmt.Errorf("Tenant ID %w ", models.MicrosoftRequiredForClientSecretErrHelp)
			}

			if strings.TrimSpace(settings.MicrosoftSettings.ClientID) == "" {
				return nil, fmt.Errorf("Client ID %w ", models.MicrosoftRequiredForClientSecretErrHelp)
			}

			if strings.TrimSpace(settings.MicrosoftSettings.ClientSecret) == "" {
				return nil, fmt.Errorf("Client secret %w ", models.MicrosoftRequiredForClientSecretErrHelp)
			}

			credentials = &azcredentials.AzureClientSecretCredentials{
				AzureCloud:   string(settings.MicrosoftSettings.Cloud),
				TenantId:     settings.MicrosoftSettings.TenantID,
				ClientId:     settings.MicrosoftSettings.ClientID,
				ClientSecret: settings.MicrosoftSettings.ClientSecret,
			}
		case models.MicrosoftAuthTypeManagedIdentity:
			if !azSettings.ManagedIdentityEnabled {
				return nil, fmt.Errorf("Managed Identity %w ", models.MicrosoftDisabledAuthErrHelp)
			}

			credentials = &azcredentials.AzureManagedIdentityCredentials{
				// ClientId is optional for managed identity, because it can be inferred from the environment
				// https://github.com/grafana/grafana-azure-sdk-go/blob/21e2891b4190eb7c255c8cd275836def8200faf8/aztokenprovider/retriever_msi.go#L20-L30
				ClientId: settings.MicrosoftSettings.ClientID,
			}
		case models.MicrosoftAuthTypeWorkloadIdentity:
			if !azSettings.WorkloadIdentityEnabled {
				return nil, fmt.Errorf("Workload Identity %w ", models.MicrosoftDisabledAuthErrHelp)
			}

			credentials = &azcredentials.AzureWorkloadIdentityCredentials{}
		case models.MicrosoftAuthTypeCurrentUserIdentity:
			if !azSettings.UserIdentityEnabled {
				return nil, fmt.Errorf("User Identity %w ", models.MicrosoftDisabledAuthErrHelp)
			}

			credentials = &azcredentials.AadCurrentUserCredentials{}
		default:
			panic(fmt.Errorf("invalid auth type '%s'", settings.MicrosoftSettings.AuthType))
		}

		authOpts := azhttpclient.NewAuthOptions(azSettings)
		authOpts.Scopes(settings.MicrosoftSettings.Scopes)

		httpClient.Transport = azhttpclient.AzureMiddleware(authOpts, credentials).
			CreateMiddleware(httpclient.Options{}, httpClient.Transport)
	}
	return httpClient, nil
}

func IsAzureAuthConfigured(settings models.InfinitySettings) bool {
	return settings.AuthenticationMethod == models.AuthenticationMethodMicrosoft
}
