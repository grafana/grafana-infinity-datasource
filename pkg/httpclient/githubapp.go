package httpclient

import (
	"bytes"
	"crypto/rsa"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"golang.org/x/oauth2"
)

const githubDefaultAPIURL = "https://api.github.com"

type githubAppAuthTransport struct {
	base        http.RoundTripper
	tokenSource oauth2.TokenSource
}

func (t *githubAppAuthTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	newReq := req.Clone(req.Context())
	if newReq.Header == nil {
		newReq.Header = make(http.Header)
	}
	token, err := t.tokenSource.Token()
	if err != nil {
		return nil, err
	}
	newReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token.AccessToken))
	return t.base.RoundTrip(newReq)
}

type githubAppTokenSource struct {
	httpClient  *http.Client
	settings    models.GitHubSettings
	privateKey  *rsa.PrivateKey
	mu          sync.Mutex
	cachedToken *oauth2.Token
}

func newGitHubAppTokenSource(httpClient *http.Client, settings models.GitHubSettings) (*githubAppTokenSource, error) {
	key, err := jwt.ParseRSAPrivateKeyFromPEM([]byte(strings.ReplaceAll(settings.AppPrivateKeyPEM, "\\n", "\n")))
	if err != nil {
		return nil, err
	}
	return &githubAppTokenSource{
		httpClient: httpClient,
		settings:   settings,
		privateKey: key,
	}, nil
}

func (s *githubAppTokenSource) Token() (*oauth2.Token, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.cachedToken != nil && s.cachedToken.AccessToken != "" && s.cachedToken.Expiry.After(time.Now().Add(1*time.Minute)) {
		return s.cachedToken, nil
	}
	token, err := s.fetchToken()
	if err != nil {
		return nil, err
	}
	s.cachedToken = token
	return token, nil
}

func (s *githubAppTokenSource) fetchToken() (*oauth2.Token, error) {
	appToken, err := s.createAppJWT()
	if err != nil {
		return nil, err
	}
	apiURL := strings.TrimSpace(s.settings.APIURL)
	if apiURL == "" {
		apiURL = githubDefaultAPIURL
	}
	endpoint := fmt.Sprintf("%s/app/installations/%s/access_tokens", strings.TrimRight(apiURL, "/"), strings.TrimSpace(s.settings.InstallationID))
	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewBufferString("{}"))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", appToken))
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")
	req.Header.Set("Content-Type", "application/json")
	res, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode < http.StatusOK || res.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("github app token request failed with status %d", res.StatusCode)
	}
	var tokenResponse struct {
		Token     string `json:"token"`
		ExpiresAt string `json:"expires_at"`
	}
	if err := json.NewDecoder(res.Body).Decode(&tokenResponse); err != nil {
		return nil, err
	}
	expiry, err := time.Parse(time.RFC3339, tokenResponse.ExpiresAt)
	if err != nil {
		return nil, err
	}
	return &oauth2.Token{
		AccessToken: tokenResponse.Token,
		TokenType:   "Bearer",
		Expiry:      expiry,
	}, nil
}

func (s *githubAppTokenSource) createAppJWT() (string, error) {
	now := time.Now().UTC()
	claims := jwt.RegisteredClaims{
		Issuer:    strings.TrimSpace(s.settings.AppID),
		IssuedAt:  jwt.NewNumericDate(now.Add(-60 * time.Second)),
		ExpiresAt: jwt.NewNumericDate(now.Add(9 * time.Minute)),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	return token.SignedString(s.privateKey)
}
