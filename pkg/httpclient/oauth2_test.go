package httpclient_test

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/httpclient"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestOAuth2TokenHeaders(t *testing.T) {
	tests := []struct {
		name           string
		tokenHeaders   map[string]string
		existingHeader string
		existingValue  string
		wantHeaders    map[string]string
	}{
		{
			name: "should apply custom Accept header to token request",
			tokenHeaders: map[string]string{
				"Accept": "application/json",
			},
			wantHeaders: map[string]string{
				"Accept": "application/json",
			},
		},
		{
			name: "should apply multiple custom headers to token request",
			tokenHeaders: map[string]string{
				"Accept":       "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
				"X-Custom":     "custom-value",
			},
			wantHeaders: map[string]string{
				"Accept":       "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
				"X-Custom":     "custom-value",
			},
		},
		{
			name:         "should not apply custom headers when empty",
			tokenHeaders: map[string]string{},
			wantHeaders:  map[string]string{},
		},
		{
			name: "should not override existing header",
			tokenHeaders: map[string]string{
				"Accept": "application/json",
			},
			existingHeader: "Accept",
			existingValue:  "text/plain",
			wantHeaders: map[string]string{
				"Accept": "text/plain",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
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
					TokenHeaders: tt.tokenHeaders,
				},
			}

			// Create HTTP client with OAuth2 configured
			httpClient, err := httpclient.GetHTTPClient(t.Context(), settings)
			require.NoError(t, err)
			require.NotNil(t, httpClient)

			// Make a request to trigger token acquisition
			req, err := http.NewRequest("GET", server.URL+"/test", nil)
			require.NoError(t, err)

			// Set existing header if specified
			if tt.existingHeader != "" {
				req.Header.Set(tt.existingHeader, tt.existingValue)
			}

			resp, err := httpClient.Do(req)
			require.NoError(t, err)
			require.NotNil(t, resp)
			defer resp.Body.Close()
			_, _ = io.ReadAll(resp.Body)

			// Verify the captured headers from token request
			for key, expectedValue := range tt.wantHeaders {
				actualValue := capturedHeaders.Get(key)
				assert.Equal(t, expectedValue, actualValue, "Header %s should be %s but got %s", key, expectedValue, actualValue)
			}

			// Verify that headers not in tokenHeaders are not present (unless they're OAuth2 default headers)
			if len(tt.tokenHeaders) == 0 {
				for key := range tt.wantHeaders {
					actualValue := capturedHeaders.Get(key)
					assert.Empty(t, actualValue, "Header %s should not be set when tokenHeaders is empty", key)
				}
			}
		})
	}
}
