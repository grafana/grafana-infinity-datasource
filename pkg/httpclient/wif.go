package httpclient

import (
	"context"
	"net/http"
	"strings"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func isOAuthExternalAccountConfigured(settings models.InfinitySettings) bool {
	return settings.AuthenticationMethod == models.AuthenticationMethodOAuth &&
		settings.OAuth2Settings.OAuth2Type == models.AuthOAuthExternalAccount
}

// applyOAuthExternalAccount wraps the provided HTTP client with OAuth2 external account
// token exchange (RFC 8693). It accepts an external_account credentials JSON stored as a
// secure field and exchanges it for short-lived access tokens via the STS token exchange
// endpoint declared inside the credentials JSON.
//
// The external_account format supports a wide range of external identity providers as the
// upstream token source:
//
//   - Google Workload Identity Federation with any OIDC/SAML provider
//   - AWS EC2/ECS instance credentials (credential_source.environment_id == "aws1")
//   - GitHub Actions OIDC via URL credential source
//   - Azure AD federated identity via URL credential source
//   - Any OIDC/SAML provider that can produce a token accessible via URL or file
//
// The shape of the credentials JSON determines which external identity provider is used;
// the Infinity plugin does not need to know the provider type in advance.
func applyOAuthExternalAccount(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) (*http.Client, error) {
	_, span := tracing.DefaultTracer().Start(ctx, "ApplyOAuthExternalAccount")
	defer span.End()
	if !isOAuthExternalAccountConfigured(settings) {
		return httpClient, nil
	}
	credJSON := []byte(strings.TrimSpace(settings.OAuth2Settings.CredentialsJSON))
	// Inject the base transport so that token exchange requests also respect TLS/proxy settings.
	tokenCtx := context.WithValue(context.Background(), oauth2.HTTPClient, httpClient)
	// Use ExternalAccount type to enforce that only external_account credentials are accepted,
	// rejecting service account keys and other credential types for security.
	creds, err := google.CredentialsFromJSONWithType(tokenCtx, credJSON, google.ExternalAccount, settings.OAuth2Settings.Scopes...)
	if err != nil {
		return nil, err
	}
	return &http.Client{
		Transport: &oauth2.Transport{
			Source: oauth2.ReuseTokenSource(nil, creds.TokenSource),
			Base:   httpClient.Transport,
		},
		Timeout: httpClient.Timeout,
	}, nil
}
