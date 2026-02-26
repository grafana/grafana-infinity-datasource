package httpclient

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	hc "github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"golang.org/x/oauth2"
)

const (
	OAuth2AccessTokenReplacer  = "${__oauth2.access_token}"
	OAuth2RefreshTokenReplacer = "${__oauth2.refresh_token}"
	OAuth2TokenTypeReplacer    = "${__oauth2.token_type}"
)

// tokenHeadersTransport wraps an http.RoundTripper to add custom headers to requests.
// This allows users to configure headers like Accept, Content-Type, etc. for OAuth2 servers that strictly validate headers
type tokenHeadersTransport struct {
	base    http.RoundTripper
	headers map[string]string
}

func (t *tokenHeadersTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	newReq := req.Clone(req.Context())
	// Apply custom headers only if they're not already set
	for key, value := range t.headers {
		if newReq.Header.Get(key) == "" {
			newReq.Header.Set(key, value)
		}
	}
	return t.base.RoundTrip(newReq)
}

// getOAuthTokenClient returns an HTTP client with custom header middleware
// for OAuth2 token endpoint requests
func getOAuthTokenClient(baseClient *http.Client, headers map[string]string) *http.Client {
	if len(headers) == 0 {
		return baseClient
	}
	return &http.Client{
		Transport: &tokenHeadersTransport{base: baseClient.Transport, headers: headers},
		Timeout:   baseClient.Timeout,
	}
}

type oauth2CustomTokenTransport struct {
	Settings      models.InfinitySettings
	Transport     http.RoundTripper
	AuthHeader    string
	TokenTemplate string
	TokenSource   oauth2.TokenSource
}

func (t *oauth2CustomTokenTransport) Base(ctx context.Context) http.RoundTripper {
	baseClient, err := getBaseHTTPClient(ctx, t.Settings)
	if err != nil {
		return hc.NewHTTPTransport()
	}
	return baseClient.Transport
}

func (t *oauth2CustomTokenTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	authHeader := t.AuthHeader
	if strings.TrimSpace(authHeader) == "" {
		authHeader = "Authorization"
	}
	tokenTemplate := t.TokenTemplate
	if strings.TrimSpace(tokenTemplate) == "" {
		tokenTemplate = fmt.Sprintf("Bearer %s", OAuth2AccessTokenReplacer)
	}
	newReq := req.Clone(req.Context())
	if newReq.Header == nil {
		newReq.Header = make(http.Header)
	}
	token, err := t.TokenSource.Token()
	if err != nil {
		return nil, err
	}
	tokenValue := strings.ReplaceAll(tokenTemplate, OAuth2AccessTokenReplacer, token.AccessToken)
	tokenValue = strings.ReplaceAll(tokenValue, OAuth2RefreshTokenReplacer, token.RefreshToken)
	tokenValue = strings.ReplaceAll(tokenValue, OAuth2TokenTypeReplacer, token.TokenType)
	newReq.Header.Set(authHeader, tokenValue)
	return t.Base(newReq.Context()).RoundTrip(newReq)
}

func getCustomOAuth2Transport(settings models.InfinitySettings, httpClient *http.Client) http.RoundTripper {
	if settings.OAuth2Settings.AuthHeader != "" || settings.OAuth2Settings.TokenTemplate != "" {
		oauth2Transport, ok := httpClient.Transport.(*oauth2.Transport)
		if !ok {
			return httpClient.Transport
		}
		return &oauth2CustomTokenTransport{
			Settings:      settings,
			Transport:     httpClient.Transport,
			TokenSource:   oauth2Transport.Source,
			TokenTemplate: settings.OAuth2Settings.TokenTemplate,
			AuthHeader:    settings.OAuth2Settings.AuthHeader,
		}
	}
	return httpClient.Transport
}
