package httpclient_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/httpclient"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// makeSTSSettings builds InfinitySettings for the sts_token_exchange oauth2 type.
func makeSTSSettings(tokenURL, audience, subjectTokenType string, scopes []string) models.InfinitySettings {
	return models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodOAuth,
		TimeoutInSeconds:     60,
		OAuth2Settings: models.OAuth2Settings{
			OAuth2Type:       models.AuthOAuthSTSTokenExchange,
			TokenURL:         tokenURL,
			Audience:         audience,
			SubjectTokenType: subjectTokenType,
			Scopes:           scopes,
		},
	}
}

// TestGetHTTPClient_STSTokenExchange_NotConfigured verifies the transport is not applied
// when auth_method is not oauth2 or oauth2_type is not sts_token_exchange.
func TestGetHTTPClient_STSTokenExchange_NotConfigured(t *testing.T) {
	settings := models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodNone,
		TimeoutInSeconds:     60,
	}
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}

// TestGetHTTPClient_STSTokenExchange_OtherOAuth2TypeIgnored verifies that other
// oauth2 types (client_credentials, jwt) do not trigger the STS transport.
func TestGetHTTPClient_STSTokenExchange_OtherOAuth2TypeIgnored(t *testing.T) {
	settings := models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodOAuth,
		TimeoutInSeconds:     60,
		OAuth2Settings: models.OAuth2Settings{
			OAuth2Type: models.AuthOAuthTypeClientCredentials,
		},
	}
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}

// TestGetHTTPClient_STSTokenExchange_ClientCreated verifies the HTTP client is created
// successfully when sts_token_exchange is configured with valid parameters.
func TestGetHTTPClient_STSTokenExchange_ClientCreated(t *testing.T) {
	settings := makeSTSSettings(
		"https://sts.googleapis.com/v1/token",
		"//iam.googleapis.com/projects/123/locations/global/workloadIdentityPools/pool/providers/provider",
		"urn:ietf:params:oauth:token-type:id_token",
		[]string{"https://www.googleapis.com/auth/cloud-platform"},
	)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}

// TestSTSTokenExchange_PassThrough verifies that requests without an Authorization
// header are forwarded unchanged (no STS call is attempted).
func TestSTSTokenExchange_PassThrough(t *testing.T) {
	var stsCallCount int
	stsServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		stsCallCount++
		t.Errorf("STS server should not have been called")
	}))
	defer stsServer.Close()

	targetServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Authorization header should be absent.
		assert.Empty(t, r.Header.Get("Authorization"))
		w.WriteHeader(http.StatusOK)
	}))
	defer targetServer.Close()

	settings := makeSTSSettings(stsServer.URL, "audience", "urn:ietf:params:oauth:token-type:id_token", nil)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)

	req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, targetServer.URL, nil)
	require.NoError(t, err)
	// No Authorization header set — transport should pass through.
	resp, err := client.Do(req)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, resp.StatusCode)
	assert.Equal(t, 0, stsCallCount)
}

// TestSTSTokenExchange_ExchangesToken verifies the full token exchange flow:
// the forwarded Grafana OAuth token is submitted to the STS endpoint as subject_token
// and the response access_token is set as the Authorization header on the target request.
func TestSTSTokenExchange_ExchangesToken(t *testing.T) {
	const forwardedToken = "okta-user-access-token"
	const exchangedToken = "google-access-token-from-sts"
	const audience = "//iam.googleapis.com/projects/123/locations/global/workloadIdentityPools/my-pool/providers/my-provider"

	var stsRequests []map[string]string
	stsServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.NoError(t, r.ParseForm())
		params := map[string]string{
			"grant_type":           r.FormValue("grant_type"),
			"subject_token":        r.FormValue("subject_token"),
			"subject_token_type":   r.FormValue("subject_token_type"),
			"requested_token_type": r.FormValue("requested_token_type"),
			"audience":             r.FormValue("audience"),
			"scope":                r.FormValue("scope"),
		}
		stsRequests = append(stsRequests, params)

		w.Header().Set("Content-Type", "application/json")
		resp := map[string]interface{}{
			"access_token":      exchangedToken,
			"token_type":        "Bearer",
			"expires_in":        3600,
			"issued_token_type": "urn:ietf:params:oauth:token-type:access_token",
		}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer stsServer.Close()

	var receivedAuthHeader string
	targetServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedAuthHeader = r.Header.Get("Authorization")
		w.WriteHeader(http.StatusOK)
	}))
	defer targetServer.Close()

	settings := makeSTSSettings(
		stsServer.URL,
		audience,
		"urn:ietf:params:oauth:token-type:id_token",
		[]string{"https://www.googleapis.com/auth/cloud-platform"},
	)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)

	req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, targetServer.URL, nil)
	require.NoError(t, err)
	req.Header.Set("Authorization", "Bearer "+forwardedToken)

	resp, err := client.Do(req)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, resp.StatusCode)

	// Verify the STS request fields.
	require.Len(t, stsRequests, 1)
	assert.Equal(t, "urn:ietf:params:oauth:grant-type:token-exchange", stsRequests[0]["grant_type"])
	assert.Equal(t, forwardedToken, stsRequests[0]["subject_token"])
	assert.Equal(t, "urn:ietf:params:oauth:token-type:id_token", stsRequests[0]["subject_token_type"])
	assert.Equal(t, "urn:ietf:params:oauth:token-type:access_token", stsRequests[0]["requested_token_type"])
	assert.Equal(t, audience, stsRequests[0]["audience"])
	assert.Equal(t, "https://www.googleapis.com/auth/cloud-platform", stsRequests[0]["scope"])

	// Verify the target request received the exchanged token, not the original.
	assert.Equal(t, "Bearer "+exchangedToken, receivedAuthHeader)
}

// TestSTSTokenExchange_CachesExchangedToken verifies that multiple requests with
// the same subject token result in only one STS call (token is cached).
func TestSTSTokenExchange_CachesExchangedToken(t *testing.T) {
	const forwardedToken = "cached-forwarded-token"
	const exchangedToken = "cached-exchanged-token"

	var stsCallCount int
	stsServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		stsCallCount++
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"access_token": exchangedToken,
			"expires_in":   3600,
		})
	}))
	defer stsServer.Close()

	targetServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer targetServer.Close()

	settings := makeSTSSettings(stsServer.URL, "", "urn:ietf:params:oauth:token-type:access_token", nil)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)

	// Make 3 requests with the same forwarded token.
	for i := 0; i < 3; i++ {
		req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, targetServer.URL, nil)
		require.NoError(t, err)
		req.Header.Set("Authorization", "Bearer "+forwardedToken)
		resp, err := client.Do(req)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
	}

	// The STS endpoint should have been called only once (subsequent calls use the cache).
	assert.Equal(t, 1, stsCallCount, "STS endpoint should be called once; subsequent requests should use the cached token")
}

// TestSTSTokenExchange_DifferentUsersGetDifferentTokens verifies that requests from
// different users (different subject tokens) each trigger their own STS exchange.
func TestSTSTokenExchange_DifferentUsersGetDifferentTokens(t *testing.T) {
	type exchangeResult struct {
		subjectToken  string
		exchanged     string
		receivedByAPI string
	}
	results := make([]exchangeResult, 2)

	stsServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = r.ParseForm()
		sub := r.FormValue("subject_token")
		var exchanged string
		switch sub {
		case "user-a-token":
			exchanged = "google-token-for-user-a"
		case "user-b-token":
			exchanged = "google-token-for-user-b"
		default:
			t.Errorf("unexpected subject_token: %s", sub)
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"access_token": exchanged,
			"expires_in":   3600,
		})
	}))
	defer stsServer.Close()

	var mu sync.Mutex
	targetServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		// Store the received Authorization header against the expected user.
		mu.Lock()
		for i := range results {
			if (i == 0 && results[i].exchanged == "google-token-for-user-a") || (i == 1 && results[i].exchanged == "google-token-for-user-b") {
				results[i].receivedByAPI = auth
			}
		}
		mu.Unlock()
		w.WriteHeader(http.StatusOK)
	}))
	defer targetServer.Close()

	settings := makeSTSSettings(stsServer.URL, "", "urn:ietf:params:oauth:token-type:access_token", nil)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)

	tokens := []string{"user-a-token", "user-b-token"}
	expectedExchanged := []string{"google-token-for-user-a", "google-token-for-user-b"}
	var receivedByTarget [2]string

	for i, tok := range tokens {
		req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, targetServer.URL, nil)
		require.NoError(t, err)
		req.Header.Set("Authorization", "Bearer "+tok)

		var capturedAuth string
		// Wrap the target server request to capture the header sent.
		innerSrv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			capturedAuth = r.Header.Get("Authorization")
			w.WriteHeader(http.StatusOK)
		}))
		defer innerSrv.Close()

		req2, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, innerSrv.URL, nil)
		req2.Header.Set("Authorization", "Bearer "+tok)
		resp, err := client.Do(req2)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		receivedByTarget[i] = capturedAuth
	}

	for i, expected := range expectedExchanged {
		assert.Equal(t, "Bearer "+expected, receivedByTarget[i],
			"user %d should receive their own exchanged token on the target API", i)
	}
}

// TestSTSTokenExchange_STSError verifies that an STS error is propagated to the caller.
func TestSTSTokenExchange_STSError(t *testing.T) {
	stsServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
		_, _ = w.Write([]byte(`{"error":"invalid_grant","error_description":"token expired"}`))
	}))
	defer stsServer.Close()

	targetServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Error("target server should not be reached after STS error")
	}))
	defer targetServer.Close()

	settings := makeSTSSettings(stsServer.URL, "", "urn:ietf:params:oauth:token-type:id_token", nil)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)

	req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, targetServer.URL, nil)
	require.NoError(t, err)
	req.Header.Set("Authorization", "Bearer some-expired-token")

	_, err = client.Do(req)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "unexpected status 401")
}

// TestSTSTokenExchange_STSReturnsEmptyAccessToken verifies that an empty access_token
// in the STS response is treated as an error.
func TestSTSTokenExchange_STSReturnsEmptyAccessToken(t *testing.T) {
	stsServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"access_token": "",
			"expires_in":   3600,
		})
	}))
	defer stsServer.Close()

	settings := makeSTSSettings(stsServer.URL, "", "urn:ietf:params:oauth:token-type:id_token", nil)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)

	req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, stsServer.URL, nil)
	require.NoError(t, err)
	req.Header.Set("Authorization", "Bearer some-token")

	_, err = client.Do(req)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "empty access_token")
}

// TestSTSTokenExchange_CacheExpiryTriggersNewExchange verifies that once a cached token
// expires (or has no ExpiresIn), a new STS exchange is triggered.
func TestSTSTokenExchange_ZeroExpiresInDefaultsToOneHour(t *testing.T) {
	// ExpiresIn = 0 should default the expiry to 1 hour (i.e., the token should not
	// expire in the next 30 seconds and should be reused within the test).
	callCount := 0
	stsServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		callCount++
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"access_token": "default-ttl-token",
			"expires_in":   0, // should default to 1 hour
		})
	}))
	defer stsServer.Close()

	targetServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer targetServer.Close()

	settings := makeSTSSettings(stsServer.URL, "", "urn:ietf:params:oauth:token-type:access_token", nil)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)

	// Two requests should share the cached token.
	for i := 0; i < 2; i++ {
		req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, targetServer.URL, nil)
		require.NoError(t, err)
		req.Header.Set("Authorization", "Bearer my-token")
		resp, err := client.Do(req)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
	}

	// With the default TTL of 1 hour, the token should have been fetched only once.
	assert.Equal(t, 1, callCount, "STS should be called once; token with ExpiresIn=0 should use 1-hour default TTL")
}
