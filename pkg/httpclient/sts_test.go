package httpclient_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/httpclient"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

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

func TestGetHTTPClient_STSTokenExchange_NotConfigured(t *testing.T) {
	settings := models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodNone,
		TimeoutInSeconds:     60,
	}
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}

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

func TestSTSTokenExchange_PassThrough(t *testing.T) {
	stsServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Errorf("STS server should not have been called")
	}))
	defer stsServer.Close()

	targetServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Empty(t, r.Header.Get("Authorization"))
		w.WriteHeader(http.StatusOK)
	}))
	defer targetServer.Close()

	settings := makeSTSSettings(stsServer.URL, "audience", "urn:ietf:params:oauth:token-type:id_token", nil)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)

	req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, targetServer.URL, nil)
	require.NoError(t, err)
	resp, err := client.Do(req)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestSTSTokenExchange_ExchangesToken(t *testing.T) {
	const forwardedToken = "okta-user-access-token"
	const exchangedToken = "google-access-token-from-sts"
	const audience = "//iam.googleapis.com/projects/123/locations/global/workloadIdentityPools/my-pool/providers/my-provider"

	var stsRequests []map[string]string
	stsServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.NoError(t, r.ParseForm())
		stsRequests = append(stsRequests, map[string]string{
			"grant_type":           r.FormValue("grant_type"),
			"subject_token":        r.FormValue("subject_token"),
			"subject_token_type":   r.FormValue("subject_token_type"),
			"requested_token_type": r.FormValue("requested_token_type"),
			"audience":             r.FormValue("audience"),
			"scope":                r.FormValue("scope"),
		})
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"access_token":      exchangedToken,
			"token_type":        "Bearer",
			"expires_in":        3600,
			"issued_token_type": "urn:ietf:params:oauth:token-type:access_token",
		})
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

	require.Len(t, stsRequests, 1)
	assert.Equal(t, "urn:ietf:params:oauth:grant-type:token-exchange", stsRequests[0]["grant_type"])
	assert.Equal(t, forwardedToken, stsRequests[0]["subject_token"])
	assert.Equal(t, "urn:ietf:params:oauth:token-type:id_token", stsRequests[0]["subject_token_type"])
	assert.Equal(t, "urn:ietf:params:oauth:token-type:access_token", stsRequests[0]["requested_token_type"])
	assert.Equal(t, audience, stsRequests[0]["audience"])
	assert.Equal(t, "https://www.googleapis.com/auth/cloud-platform", stsRequests[0]["scope"])
	assert.Equal(t, "Bearer "+exchangedToken, receivedAuthHeader)
}

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

	for i := 0; i < 3; i++ {
		req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, targetServer.URL, nil)
		require.NoError(t, err)
		req.Header.Set("Authorization", "Bearer "+forwardedToken)
		resp, err := client.Do(req)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
	}

	assert.Equal(t, 1, stsCallCount, "STS endpoint should be called once; subsequent requests should use the cached token")
}

func TestSTSTokenExchange_DifferentUsersGetDifferentTokens(t *testing.T) {
	tokenMap := map[string]string{
		"user-a-token": "google-token-for-user-a",
		"user-b-token": "google-token-for-user-b",
	}
	stsServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = r.ParseForm()
		exchanged, ok := tokenMap[r.FormValue("subject_token")]
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"access_token": exchanged,
			"expires_in":   3600,
		})
	}))
	defer stsServer.Close()

	settings := makeSTSSettings(stsServer.URL, "", "urn:ietf:params:oauth:token-type:access_token", nil)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)

	for subject, expected := range tokenMap {
		subject, expected := subject, expected
		targetServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			assert.Equal(t, "Bearer "+expected, r.Header.Get("Authorization"))
			w.WriteHeader(http.StatusOK)
		}))
		defer targetServer.Close()

		req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, targetServer.URL, nil)
		require.NoError(t, err)
		req.Header.Set("Authorization", "Bearer "+subject)
		resp, err := client.Do(req)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
	}
}

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

func TestSTSTokenExchange_ZeroExpiresInDefaultsToOneHour(t *testing.T) {
	callCount := 0
	stsServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		callCount++
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"access_token": "default-ttl-token",
			"expires_in":   0,
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

	for i := 0; i < 2; i++ {
		req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, targetServer.URL, nil)
		require.NoError(t, err)
		req.Header.Set("Authorization", "Bearer my-token")
		resp, err := client.Do(req)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
	}

	assert.Equal(t, 1, callCount, "STS should be called once; token with ExpiresIn=0 should use 1-hour default TTL")
}
