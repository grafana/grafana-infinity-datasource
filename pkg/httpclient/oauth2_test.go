package httpclient_test

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/httpclient"
	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-infinity-datasource/pkg/pluginhost"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestOAuth2TokenHeaders(t *testing.T) {
	tests := []struct {
		name         string
		tokenHeaders map[string]string
		wantHeaders  map[string]string
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
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a test server to capture the token request
			var capturedTokenHeaders http.Header
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.URL.Path == "/token" {
					capturedTokenHeaders = r.Header.Clone()
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusOK)
					_, _ = w.Write([]byte(`{"access_token":"test_token","token_type":"Bearer","expires_in":3600}`))
					return
				}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				_, _ = w.Write([]byte(`{"foo":"bar"}`))
			}))
			defer server.Close()

			// Create settings with OAuth2 client credentials
			settings := models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodOAuth,
				OAuth2Settings: models.OAuth2Settings{
					OAuth2Type:   "client_credentials",
					ClientID:     "test-client-id",
					ClientSecret: "test-client-secret",
					TokenURL:     server.URL + "/token",
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

			resp, err := httpClient.Do(req)
			require.NoError(t, err)
			require.NotNil(t, resp)
			defer resp.Body.Close()
			_, _ = io.ReadAll(resp.Body)

			// Verify the captured headers from token request
			for key, expectedValue := range tt.wantHeaders {
				actualValue := capturedTokenHeaders.Get(key)
				assert.Equal(t, expectedValue, actualValue, "Header %s should be %s but got %s", key, expectedValue, actualValue)
			}
		})
	}
}

// TestTokenHeadersIsolation verifies that token headers are only sent to the token endpoint
// and custom headers are only sent to API endpoints (not mixed).
// This is a security requirement: token headers may contain sensitive authentication data
// that should never be leaked to downstream API endpoints.
func TestTokenHeadersIsolation(t *testing.T) {
	tests := []struct {
		name          string
		oauth2Type    string
		tokenHeaders  map[string]string
		customHeaders map[string]string // custom headers sent to API endpoint
		wantOnToken   map[string]string // headers expected on token endpoint
		wantOnAPI     map[string]string // headers expected on API endpoint
	}{
		{
			name:       "client_credentials: token headers should only go to token endpoint",
			oauth2Type: "client_credentials",
			tokenHeaders: map[string]string{
				"X-Token-Secret":   "secret-token-value",
				"X-Token-Metadata": "metadata-value",
			},
			customHeaders: map[string]string{
				"X-Custom-Only": "custom-api-value",
			},
			wantOnToken: map[string]string{
				"X-Token-Secret":   "secret-token-value",
				"X-Token-Metadata": "metadata-value",
				"X-Custom-Only":    "", // custom headers must NOT leak to token endpoint
			},
			wantOnAPI: map[string]string{
				"X-Token-Secret":   "", // must NOT be present on API
				"X-Token-Metadata": "", // must NOT be present on API
				"X-Custom-Only":    "custom-api-value",
			},
		},
		{
			name:       "client_credentials: custom headers should only go to API endpoint",
			oauth2Type: "client_credentials",
			tokenHeaders: map[string]string{
				"X-Token-Only": "secret-token-value",
			},
			customHeaders: map[string]string{
				"X-Custom-Only": "custom-api-value",
			},
			wantOnToken: map[string]string{
				"X-Token-Only":  "secret-token-value",
				"X-Custom-Only": "", // custom headers must NOT leak to token endpoint
			},
			wantOnAPI: map[string]string{
				"X-Token-Only":  "",                 // token headers must NOT leak to API
				"X-Custom-Only": "custom-api-value", // custom headers must be present
			},
		},
		{
			name:         "client_credentials: no token headers configured should work normally",
			oauth2Type:   "client_credentials",
			tokenHeaders: map[string]string{},
			customHeaders: map[string]string{
				"X-Custom-Only": "custom-api-value",
			},
			wantOnToken: map[string]string{
				"X-Custom-Only": "", // custom headers must NOT leak to token endpoint
			},
			wantOnAPI: map[string]string{
				"X-Custom-Only": "custom-api-value",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var capturedTokenHeaders http.Header
			var capturedAPIHeaders http.Header

			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.URL.Path == "/token" {
					capturedTokenHeaders = r.Header.Clone()
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusOK)
					_, _ = w.Write([]byte(`{"access_token":"test_token","token_type":"Bearer","expires_in":3600}`))
					return
				}
				capturedAPIHeaders = r.Header.Clone()
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				_, _ = w.Write([]byte(`{"result":"success"}`))
			}))
			defer server.Close()

			settings := models.InfinitySettings{
				AllowedHosts:         []string{server.URL},
				AuthenticationMethod: models.AuthenticationMethodOAuth,
				CustomHeaders:        tt.customHeaders,
				OAuth2Settings: models.OAuth2Settings{
					OAuth2Type:   tt.oauth2Type,
					ClientID:     "test-client-id",
					ClientSecret: "test-client-secret",
					TokenURL:     server.URL + "/token",
					TokenHeaders: tt.tokenHeaders,
				},
			}

			client, err := infinity.NewClient(t.Context(), settings)
			require.Nil(t, err)

			query, err := models.LoadQuery(
				t.Context(),
				backend.DataQuery{JSON: []byte(fmt.Sprintf(`{"url":"%s/api","type":"json","source":"url"}`, server.URL))},
				backend.PluginConfigFromContext(t.Context()),
				settings,
			)
			require.Nil(t, err)

			res := pluginhost.QueryDataQuery(t.Context(), backend.PluginConfigFromContext(t.Context()), query, *client, map[string]string{})
			require.NotNil(t, res)
			require.Nil(t, res.Error, "QueryData should not return error")
			require.NotNil(t, capturedTokenHeaders, "token endpoint should have been called")
			require.NotNil(t, capturedAPIHeaders, "API endpoint should have been called")

			// Verify token endpoint received correct headers
			for header, expectedValue := range tt.wantOnToken {
				actualValue := capturedTokenHeaders.Get(header)
				if expectedValue == "" {
					assert.Empty(t, actualValue, "token endpoint should NOT have header %s", header)
				} else {
					assert.Equal(t, expectedValue, actualValue, "token endpoint header %s mismatch", header)
				}
			}

			// Verify API endpoint received correct headers
			for header, expectedValue := range tt.wantOnAPI {
				actualValue := capturedAPIHeaders.Get(header)
				if expectedValue == "" {
					assert.Empty(t, actualValue, "API endpoint should NOT have header %s", header)
				} else {
					assert.Equal(t, expectedValue, actualValue, "API endpoint header %s mismatch", header)
				}
			}

			// Verify successful response parsing
			value, _ := res.Frames[0].Fields[0].ConcreteAt(0)
			assert.Equal(t, "success", value)
		})
	}
}
