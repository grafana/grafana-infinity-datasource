package httpclient

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
)

const (
	// stsGrantType is the OAuth 2.0 Token Exchange grant type (RFC 8693).
	stsGrantType = "urn:ietf:params:oauth:grant-type:token-exchange"
	// STSRequestedTokenTypeAccessToken requests an OAuth2 access token from the STS endpoint.
	STSRequestedTokenTypeAccessToken = "urn:ietf:params:oauth:token-type:access_token"
	// defaultTokenTTLSeconds is the fallback token lifetime when the STS response does not
	// include an expires_in field or returns zero.
	defaultTokenTTLSeconds = 3600
)

// stsTokenResponse is the JSON body returned by an RFC 8693 token exchange endpoint.
type stsTokenResponse struct {
	AccessToken     string `json:"access_token"`
	TokenType       string `json:"token_type"`
	ExpiresIn       int    `json:"expires_in"` // seconds
	IssuedTokenType string `json:"issued_token_type"`
}

// stsCachedToken holds an exchanged access token and its expiry time.
type stsCachedToken struct {
	accessToken string
	expiry      time.Time
}

// isValid reports whether the cached token is still usable (with a 30-second safety margin).
func (c *stsCachedToken) isValid() bool {
	return time.Now().Before(c.expiry.Add(-30 * time.Second))
}

// stsTokenExchangeTransport implements RFC 8693 (OAuth 2.0 Token Exchange) as an
// http.RoundTripper. It enables the following workflow:
//
//  1. Grafana is authenticated with an external OAuth provider (Okta, Azure AD, GitHub, etc.).
//  2. The user's bearer token is forwarded to the Infinity plugin via the oauthPassThru /
//     ForwardOauthIdentity mechanism and is present as "Authorization: Bearer <token>" on
//     every outgoing HTTP request built by GetRequest().
//  3. This transport intercepts each request, reads the Authorization header, and submits
//     the token to the configured STS endpoint as the subject_token of an RFC 8693 exchange.
//  4. The STS (e.g., Google STS for Workload Identity Federation) validates the external
//     identity and returns a short-lived access token for the target service.
//  5. The Authorization header on the outgoing request is replaced with the STS-issued token.
//
// Exchanged tokens are cached per (subject_token, expiry) to avoid redundant STS calls
// on every HTTP request within a datasource query.
type stsTokenExchangeTransport struct {
	base               http.RoundTripper
	tokenURL           string
	audience           string
	scopes             []string
	subjectTokenType   string
	requestedTokenType string
	mu                 sync.Mutex
	// cache maps subject token value → exchanged token (with expiry).
	// Each Grafana user session produces a different subject token, so this is a
	// per-user-token cache, not a global cache.
	cache map[string]*stsCachedToken
}

// RoundTrip intercepts the outgoing request, performs the RFC 8693 token exchange,
// and replaces the Authorization header with the STS-issued access token.
func (t *stsTokenExchangeTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	authHeader := req.Header.Get("Authorization")
	if authHeader == "" {
		// No forwarded Grafana token on this request — pass through unchanged.
		return t.base.RoundTrip(req)
	}
	subjectToken := strings.TrimPrefix(authHeader, "Bearer ")
	subjectToken = strings.TrimPrefix(subjectToken, "bearer ")
	subjectToken = strings.TrimSpace(subjectToken)
	if subjectToken == "" {
		return t.base.RoundTrip(req)
	}

	accessToken, err := t.getAccessToken(req.Context(), subjectToken)
	if err != nil {
		return nil, err
	}

	// Clone the request so we do not mutate the caller's original.
	newReq := req.Clone(req.Context())
	newReq.Header.Set("Authorization", "Bearer "+accessToken)
	return t.base.RoundTrip(newReq)
}

// getAccessToken returns a cached STS-issued access token for the given subject token,
// performing a fresh RFC 8693 exchange if the cached value is absent or expired.
func (t *stsTokenExchangeTransport) getAccessToken(ctx context.Context, subjectToken string) (string, error) {
	t.mu.Lock()
	if ct, ok := t.cache[subjectToken]; ok && ct.isValid() {
		token := ct.accessToken
		t.mu.Unlock()
		return token, nil
	}
	t.mu.Unlock()

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
	t.cache[subjectToken] = &stsCachedToken{accessToken: tokenResp.AccessToken, expiry: expiry}
	t.mu.Unlock()

	return tokenResp.AccessToken, nil
}

// exchangeToken performs a single RFC 8693 token exchange HTTP POST against the configured
// STS endpoint and returns the parsed response.
func (t *stsTokenExchangeTransport) exchangeToken(ctx context.Context, subjectToken string) (*stsTokenResponse, error) {
	requestedTokenType := t.requestedTokenType
	if requestedTokenType == "" {
		requestedTokenType = STSRequestedTokenTypeAccessToken
	}
	values := url.Values{
		"grant_type":           {stsGrantType},
		"subject_token":        {subjectToken},
		"subject_token_type":   {t.subjectTokenType},
		"requested_token_type": {requestedTokenType},
	}
	if t.audience != "" {
		values.Set("audience", t.audience)
	}
	if len(t.scopes) > 0 {
		values.Set("scope", strings.Join(t.scopes, " "))
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, t.tokenURL, strings.NewReader(values.Encode()))
	if err != nil {
		return nil, fmt.Errorf("sts token exchange: building request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := t.base.RoundTrip(httpReq)
	if err != nil {
		return nil, fmt.Errorf("sts token exchange: HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("sts token exchange: reading response body: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("sts token exchange: unexpected status %d: %s", resp.StatusCode, string(body))
	}

	var tokenResp stsTokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return nil, fmt.Errorf("sts token exchange: parsing response JSON: %w", err)
	}
	if tokenResp.AccessToken == "" {
		return nil, fmt.Errorf("sts token exchange: empty access_token in response")
	}
	return &tokenResp, nil
}

func isOAuthSTSTokenExchangeConfigured(settings models.InfinitySettings) bool {
	return settings.AuthenticationMethod == models.AuthenticationMethodOAuth &&
		settings.OAuth2Settings.OAuth2Type == models.AuthOAuthSTSTokenExchange
}

// applyOAuthSTSTokenExchange wraps the provided HTTP client with an RFC 8693
// (OAuth 2.0 Token Exchange) RoundTripper. It enables the following cross-provider
// token exchange scenario:
//
//   - Grafana is configured with an external IdP (Okta, Azure AD auth, GitHub auth).
//   - The Grafana user's bearer token is forwarded to the Infinity plugin via the
//     ForwardOauthIdentity / oauthPassThru mechanism, and is placed by
//     ApplyForwardedOAuthIdentity() on every outgoing HTTP request as
//     "Authorization: Bearer <idp_token>".
//   - This transport intercepts the request, extracts that token as the subject_token,
//     and exchanges it with the configured STS endpoint (e.g., Google STS, Azure STS).
//   - The STS validates the external identity and issues a short-lived access token for
//     the target service (e.g., a Google Cloud API, a Kubernetes API).
//   - The Authorization header is replaced with the STS-issued token before the request
//     reaches the target API.
//
// This enables per-user, per-request token exchange without long-lived credentials:
// each Grafana user's identity flows end-to-end from the IdP to the target service.
//
// Requirements:
//   - oauth2.token_url must be set to the STS token exchange endpoint.
//   - oauth2.subject_token_type must describe the forwarded IdP token type.
//   - The datasource must also have ForwardOauthIdentity = true (or auth_method = "oauthPassThru")
//     so that Grafana injects the user's bearer token into outgoing plugin requests.
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
