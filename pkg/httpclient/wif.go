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

func isGoogleWIFConfigured(settings models.InfinitySettings) bool {
	return settings.AuthenticationMethod == models.AuthenticationMethodGoogleWIF
}

// applyGoogleWIF wraps the provided HTTP client with Google Workload Identity Federation
// authentication. It accepts an external_account credentials JSON (the WIF credentials)
// stored as a secure field and exchanges them for short-lived Google access tokens via
// the Google STS token exchange endpoint (RFC 8693).
func applyGoogleWIF(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) (*http.Client, error) {
	_, span := tracing.DefaultTracer().Start(ctx, "ApplyGoogleWIF")
	defer span.End()
	if !isGoogleWIFConfigured(settings) {
		return httpClient, nil
	}
	credJSON := []byte(strings.TrimSpace(settings.GoogleWIFSettings.Credentials))
	// Inject the base transport so that WIF token exchange requests also respect TLS/proxy settings.
	tokenCtx := context.WithValue(context.Background(), oauth2.HTTPClient, httpClient)
	// Use ExternalAccount credential type to safely accept only WIF credentials.
	creds, err := google.CredentialsFromJSONWithType(tokenCtx, credJSON, google.ExternalAccount, settings.GoogleWIFSettings.Scopes...)
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
