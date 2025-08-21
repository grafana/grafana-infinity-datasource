package httpclient

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"golang.org/x/oauth2"
)

const (
	OAuth2AccessTokenReplacer  = "${__oauth2.access_token}"
	OAuth2RefreshTokenReplacer = "${__oauth2.refresh_token}"
	OAuth2TokenTypeReplacer    = "${__oauth2.token_type}"
)

type oauth2CustomTokenTransport struct {
	Transport     http.RoundTripper
	AuthHeader    string
	TokenTemplate string
	TokenSource   oauth2.TokenSource
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
	return t.Transport.RoundTrip(newReq)
}

func getCustomOAuth2Transport(settings models.InfinitySettings, httpClient *http.Client) http.RoundTripper {
	if settings.OAuth2Settings.AuthHeader != "" || settings.OAuth2Settings.TokenTemplate != "" {
		oauth2Transport, ok := httpClient.Transport.(*oauth2.Transport)
		if !ok {
			return httpClient.Transport
		}
		return &oauth2CustomTokenTransport{
			Transport:     httpClient.Transport,
			TokenSource:   oauth2Transport.Source,
			TokenTemplate: settings.OAuth2Settings.TokenTemplate,
			AuthHeader:    settings.OAuth2Settings.AuthHeader,
		}
	}
	return httpClient.Transport
}
