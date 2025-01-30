package infinity

import (
	"context"
	"net/http"
	"strings"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/require"
)

func TestGetQueryReqHeader(t *testing.T) {
	tests := []struct {
		name           string
		requestHeaders map[string]string
		headerName     string
		expected       string
	}{
		{
			name: "Authorization header exact match",
			requestHeaders: map[string]string{
				HeaderKeyAuthorization: "Bearer token",
			},
			headerName: HeaderKeyAuthorization,
			expected:   "Bearer token",
		},
		{
			name: "Authorization header case insensitive match",
			requestHeaders: map[string]string{
				strings.ToLower(HeaderKeyAuthorization): "Bearer token",
			},
			headerName: HeaderKeyAuthorization,
			expected:   "Bearer token",
		},
		{
			name: "X-Id-Token header exact match",
			requestHeaders: map[string]string{
				HeaderKeyIdToken: "some-id-token",
			},
			headerName: HeaderKeyIdToken,
			expected:   "some-id-token",
		},
		{
			name: "X-Id-Token header case insensitive match",
			requestHeaders: map[string]string{
				strings.ToLower(HeaderKeyIdToken): "some-id-token",
			},
			headerName: HeaderKeyIdToken,
			expected:   "some-id-token",
		},
		{
			name: "X-Id-Token header case with ID capitalization",
			requestHeaders: map[string]string{
				"X-ID-Token": "some-id-token",
			},
			headerName: HeaderKeyIdToken,
			expected:   "some-id-token",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := getQueryReqHeader(tt.requestHeaders, tt.headerName)
			if got != tt.expected {
				t.Errorf("getQueryReqHeader() = %v, expected %v", got, tt.expected)
			}
		})
	}
}

func TestApplyGrafanaHeaders(t *testing.T) {
	tests := []struct {
		name     string
		settings models.InfinitySettings
		pCtx     *backend.PluginContext
		want     map[string]string
	}{
		{
			name: "should interpolate grafana headers correctly when set in settings",
			settings: models.InfinitySettings{
				CustomHeaders: map[string]string{
					"X-Grafana-User":           "${__user.login}",
					"X-Grafana-UserID":         "${__user.login}",
					"X-Grafana-UserEmail":      "${__user.email}",
					"X-Grafana-UserName":       "${__user.name}",
					"X-Grafana-UserRole":       "${__user.role}",
					"X-Grafana-OrgID":          "${__org.id}",
					"X-Grafana-PluginID":       "${__plugin.id}",
					"X-Grafana-PluginVersion":  "${__plugin.version}",
					"X-Grafana-DatasourceUID":  "${__ds.uid}",
					"X-Grafana-DatasourceName": "${__ds.name}",
					"X-Grafana-DatasourceID":   "${__ds.id}",
					"X-Misc-Value":             "${__user.login}@${__plugin.id}",
				},
			},
			pCtx: &backend.PluginContext{
				OrgID:         12345,
				PluginID:      "my-plugin-id",
				PluginVersion: "0.0.0-preview.1",
				DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{
					ID:   123,
					UID:  "my-ds-uid",
					Name: "my-ds-name",
				},
				User: &backend.User{
					Email: "testuser@localhost",
					Login: "testuser",
					Name:  "Test User",
					Role:  "Admin",
				},
			},
			want: map[string]string{
				"X-Grafana-User":           "testuser",
				"X-Grafana-UserID":         "testuser",
				"X-Grafana-UserEmail":      "testuser@localhost",
				"X-Grafana-UserName":       "Test User",
				"X-Grafana-UserRole":       "${__user.role}",
				"X-Grafana-OrgID":          "12345",
				"X-Grafana-PluginID":       "my-plugin-id",
				"X-Grafana-PluginVersion":  "0.0.0-preview.1",
				"X-Grafana-DatasourceUID":  "my-ds-uid",
				"X-Grafana-DatasourceName": "my-ds-name",
				"X-Grafana-DatasourceID":   "123",
				"X-Misc-Value":             "testuser@my-plugin-id",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "http://example.com", nil)
			got := ApplyHeadersFromSettings(context.TODO(), tt.pCtx, map[string]string{}, tt.settings, req, true)
			require.Equal(t, len(tt.want), len(got.Header))
			for k, v := range tt.want {
				require.Equal(t, v, got.Header.Get(k))
			}
		})
	}
}
