package httpclient

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"golang.org/x/sync/singleflight"
)

const (
	stsGrantType           = "urn:ietf:params:oauth:grant-type:token-exchange"
	stsDefaultTokenType    = "urn:ietf:params:oauth:token-type:access_token"
	defaultTokenTTLSeconds = 3600
	maxCacheSize           = 256
)

type stsTokenResponse struct {
	AccessToken     string `json:"access_token"`
	TokenType       string `json:"token_type"`
	ExpiresIn       int    `json:"expires_in"`
	IssuedTokenType string `json:"issued_token_type"`
}

type stsCachedToken struct {
	accessToken string
	expiry      time.Time
}

func (c *stsCachedToken) isValid() bool {
	return time.Now().Before(c.expiry.Add(-30 * time.Second))
}

// stsTokenExchangeTransport implements RFC 8693 (OAuth 2.0 Token Exchange).
// It intercepts outgoing requests carrying a Grafana-forwarded bearer token,
// exchanges it at the configured STS endpoint for a short-lived access token,
// and replaces the Authorization header before forwarding the request.
// Exchanged tokens are cached per subject token to avoid redundant STS calls.
type stsTokenExchangeTransport struct {
	base             http.RoundTripper
	tokenURL         string
	audience         string
	scopes           []string
	subjectTokenType string
	sg               singleflight.Group
	mu               sync.RWMutex
	cache            map[string]*stsCachedToken
}

func (t *stsTokenExchangeTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	authHeader := req.Header.Get("Authorization")
	if authHeader == "" {
		return t.base.RoundTrip(req)
	}
	subjectToken := strings.TrimSpace(strings.TrimPrefix(strings.TrimPrefix(authHeader, "Bearer "), "bearer "))
	if subjectToken == "" {
		return t.base.RoundTrip(req)
	}
	accessToken, err := t.getAccessToken(req.Context(), subjectToken)
	if err != nil {
		return nil, err
	}
	newReq := req.Clone(req.Context())
	newReq.Header.Set("Authorization", "Bearer "+accessToken)
	return t.base.RoundTrip(newReq)
}

func tokenCacheKey(subjectToken string) string {
	h := sha256.Sum256([]byte(subjectToken))
	return fmt.Sprintf("%x", h)
}

func (t *stsTokenExchangeTransport) getAccessToken(ctx context.Context, subjectToken string) (string, error) {
	key := tokenCacheKey(subjectToken)
	t.mu.RLock()
	if ct, ok := t.cache[key]; ok && ct.isValid() {
		token := ct.accessToken
		t.mu.RUnlock()
		return token, nil
	}
	t.mu.RUnlock()
	v, err, _ := t.sg.Do(key, func() (interface{}, error) {
		t.mu.RLock()
		if ct, ok := t.cache[key]; ok && ct.isValid() {
			token := ct.accessToken
			t.mu.RUnlock()
			return token, nil
		}
		t.mu.RUnlock()
		tokenResp, err := t.exchangeToken(ctx, subjectToken)
		if err != nil {
			return "", err
		}
		expiry := time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)
		if tokenResp.ExpiresIn <= 0 {
			expiry = time.Now().Add(defaultTokenTTLSeconds * time.Second)
		}
		t.mu.Lock()
		if t.cache == nil {
			t.cache = make(map[string]*stsCachedToken)
		}
		if len(t.cache) >= maxCacheSize {
			for k, v := range t.cache {
				if !v.isValid() {
					delete(t.cache, k)
				}
			}
			if len(t.cache) >= maxCacheSize {
				t.cache = make(map[string]*stsCachedToken)
			}
		}
		t.cache[key] = &stsCachedToken{accessToken: tokenResp.AccessToken, expiry: expiry}
		t.mu.Unlock()
		return tokenResp.AccessToken, nil
	})
	if err != nil {
		return "", err
	}
	return v.(string), nil
}

func (t *stsTokenExchangeTransport) exchangeToken(ctx context.Context, subjectToken string) (*stsTokenResponse, error) {
	values := url.Values{
		"grant_type":           {stsGrantType},
		"subject_token":        {subjectToken},
		"subject_token_type":   {t.subjectTokenType},
		"requested_token_type": {stsDefaultTokenType},
	}
	if t.audience != "" {
		values.Set("audience", t.audience)
	}
	if len(t.scopes) > 0 {
		values.Set("scope", strings.Join(t.scopes, " "))
	}
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, t.tokenURL, strings.NewReader(values.Encode()))
	if err != nil {
		return nil, backend.PluginError(fmt.Errorf("sts token exchange: building request: %w", err))
	}
	httpReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := t.base.RoundTrip(httpReq)
	if err != nil {
		return nil, backend.DownstreamError(fmt.Errorf("sts token exchange: %w", err))
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, backend.DownstreamError(fmt.Errorf("sts token exchange: reading response: %w", err))
	}
	if resp.StatusCode != http.StatusOK {
		return nil, backend.DownstreamError(fmt.Errorf("sts token exchange: unexpected status %d: %s", resp.StatusCode, string(body)))
	}
	var tokenResp stsTokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return nil, backend.DownstreamError(fmt.Errorf("sts token exchange: invalid response: %w", err))
	}
	if tokenResp.AccessToken == "" {
		return nil, backend.DownstreamError(fmt.Errorf("sts token exchange: empty access_token in response"))
	}
	return &tokenResp, nil
}

func isOAuthSTSTokenExchangeConfigured(settings models.InfinitySettings) bool {
	return settings.AuthenticationMethod == models.AuthenticationMethodOAuth &&
		settings.OAuth2Settings.OAuth2Type == models.AuthOAuthSTSTokenExchange
}

// applyOAuthSTSTokenExchange wraps the HTTP client with an RFC 8693 token exchange transport.
// The Grafana-forwarded user bearer token is exchanged at the configured STS endpoint for
// a short-lived access token before each request to the target API.
func applyOAuthSTSTokenExchange(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) (*http.Client, error) {
	_, span := tracing.DefaultTracer().Start(ctx, "ApplyOAuthSTSTokenExchange")
	defer span.End()
	if !isOAuthSTSTokenExchangeConfigured(settings) {
		return httpClient, nil
	}
	transport := &stsTokenExchangeTransport{
		base:             httpClient.Transport,
		tokenURL:         settings.OAuth2Settings.TokenURL,
		audience:         settings.OAuth2Settings.Audience,
		scopes:           settings.OAuth2Settings.Scopes,
		subjectTokenType: settings.OAuth2Settings.SubjectTokenType,
	}
	return &http.Client{
		Transport: transport,
		Timeout:   httpClient.Timeout,
	}, nil
}
