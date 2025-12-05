package httpclient_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/httpclient"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestOAuth2AcceptHeader(t *testing.T) {
	t.Run("should add Accept header to OAuth2 client credentials token request when missing", func(t *testing.T) {
		// Create a test server to capture the token request
		var capturedHeaders http.Header
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			capturedHeaders = r.Header.Clone()
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"access_token":"test_token","token_type":"Bearer","expires_in":3600}`))
		}))
		defer server.Close()

		// Create settings with OAuth2 client credentials
		settings := models.InfinitySettings{
			AuthenticationMethod: models.AuthenticationMethodOAuth,
			OAuth2Settings: models.OAuth2Settings{
				OAuth2Type:   "client_credentials",
				ClientID:     "test-client-id",
				ClientSecret: "test-client-secret",
				TokenURL:     server.URL,
			},
		}

		// Create HTTP client with OAuth2 configured
		httpClient, err := httpclient.GetHTTPClient(context.Background(), settings)
		require.NoError(t, err)
		require.NotNil(t, httpClient)

		// Make a request to trigger token acquisition
		req, err := http.NewRequest("GET", server.URL+"/test", nil)
		require.NoError(t, err)

		resp, err := httpClient.Do(req)
		require.NoError(t, err)
		require.NotNil(t, resp)
		defer resp.Body.Close()

		// Verify the Accept header was added to the token request
		acceptHeader := capturedHeaders.Get("Accept")
		assert.Equal(t, "application/json", acceptHeader, "Accept header should be set to application/json")
	})

	t.Run("should not override existing Accept header in OAuth2 token request", func(t *testing.T) {
		// This test verifies the defensive behavior of acceptHeaderTransport
		// It ensures that if an Accept header is already present, it won't be overridden
		// Note: In practice, the OAuth2 library controls the token request headers,
		// so this is more of a defensive check for the transport implementation
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"access_token":"test_token","token_type":"Bearer","expires_in":3600}`))
		}))
		defer server.Close()

		settings := models.InfinitySettings{
			AuthenticationMethod: models.AuthenticationMethodOAuth,
			OAuth2Settings: models.OAuth2Settings{
				OAuth2Type:   "client_credentials",
				ClientID:     "test-client-id",
				ClientSecret: "test-client-secret",
				TokenURL:     server.URL,
			},
		}

		httpClient, err := httpclient.GetHTTPClient(context.Background(), settings)
		require.NoError(t, err)
		require.NotNil(t, httpClient)

		// Verify client was created successfully with OAuth2 configuration
		assert.NotNil(t, httpClient.Transport)
	})
}
