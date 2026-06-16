package infinity

import (
	"context"
	"net/http"
	"strings"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
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

func TestIsSensitiveHeader(t *testing.T) {
	tests := []struct {
		name      string
		headerKey string
		want      bool
	}{
		{name: "Content-Length is sensitive", headerKey: "Content-Length", want: true},
		{name: "content-length lowercase is sensitive", headerKey: "content-length", want: true},
		{name: "CONTENT-LENGTH uppercase is sensitive", headerKey: "CONTENT-LENGTH", want: true},
		{name: "Host is sensitive", headerKey: "Host", want: true},
		{name: "Transfer-Encoding is sensitive", headerKey: "Transfer-Encoding", want: true},
		{name: "Connection is sensitive", headerKey: "Connection", want: true},
		{name: "Keep-Alive is sensitive", headerKey: "Keep-Alive", want: true},
		{name: "Upgrade is sensitive", headerKey: "Upgrade", want: true},
		{name: "Proxy-Authorization is sensitive", headerKey: "Proxy-Authorization", want: true},
		{name: "Te is sensitive", headerKey: "Te", want: true},
		{name: "Trailer is sensitive", headerKey: "Trailer", want: true},
		{name: "X-Forwarded-For is sensitive", headerKey: "X-Forwarded-For", want: true},
		{name: "Expect is sensitive", headerKey: "Expect", want: true},
		{name: "Content-Length with spaces is sensitive", headerKey: "  Content-Length  ", want: true},
		{name: "Accept is not sensitive", headerKey: "Accept", want: false},
		{name: "Content-Type is not sensitive", headerKey: "Content-Type", want: false},
		{name: "Authorization is not sensitive", headerKey: "Authorization", want: false},
		{name: "X-Custom-Header is not sensitive", headerKey: "X-Custom-Header", want: false},
		{name: "empty string is not sensitive", headerKey: "", want: false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, models.IsSensitiveHeader(tt.headerKey))
		})
	}
}

func TestApplyHeadersFromSettings_BlocksSensitiveHeaders(t *testing.T) {
	tests := []struct {
		name        string
		customHeaders map[string]string
		wantPresent []string
		wantAbsent  []string
	}{
		{
			name: "blocks Content-Length from settings",
			customHeaders: map[string]string{
				"Content-Length":   "999",
				"X-Custom-Header": "allowed-value",
			},
			wantPresent: []string{"X-Custom-Header"},
			wantAbsent:  []string{"Content-Length"},
		},
		{
			name: "blocks Host from settings",
			customHeaders: map[string]string{
				"Host":          "evil.example.com",
				"X-Request-ID":  "abc123",
			},
			wantPresent: []string{"X-Request-ID"},
			wantAbsent:  []string{"Host"},
		},
		{
			name: "blocks Transfer-Encoding from settings",
			customHeaders: map[string]string{
				"Transfer-Encoding": "chunked",
			},
			wantAbsent: []string{"Transfer-Encoding"},
		},
		{
			name: "allows safe headers from settings",
			customHeaders: map[string]string{
				"X-Api-Key":    "my-key",
				"X-Request-ID": "123",
			},
			wantPresent: []string{"X-Api-Key", "X-Request-ID"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, err := http.NewRequest("GET", "http://example.com", nil)
			require.NoError(t, err)
			settings := models.InfinitySettings{CustomHeaders: tt.customHeaders}
			pCtx := &backend.PluginContext{}
			got := ApplyHeadersFromSettings(context.TODO(), pCtx, map[string]string{}, settings, req, true)
			for _, h := range tt.wantPresent {
				assert.NotEmpty(t, got.Header.Get(h), "expected header %s to be present", h)
			}
			for _, h := range tt.wantAbsent {
				assert.Empty(t, got.Header.Get(h), "expected header %s to be absent", h)
			}
		})
	}
}

func TestApplyHeadersFromQuery_BlocksSensitiveHeaders(t *testing.T) {
	tests := []struct {
		name        string
		headers     []models.URLOptionKeyValuePair
		wantPresent []string
		wantAbsent  []string
	}{
		{
			name: "blocks Content-Length from query",
			headers: []models.URLOptionKeyValuePair{
				{Key: "Content-Length", Value: "999"},
				{Key: "X-Custom", Value: "allowed"},
			},
			wantPresent: []string{"X-Custom"},
			wantAbsent:  []string{"Content-Length"},
		},
		{
			name: "blocks Host from query",
			headers: []models.URLOptionKeyValuePair{
				{Key: "Host", Value: "evil.example.com"},
			},
			wantAbsent: []string{"Host"},
		},
		{
			name: "blocks Connection from query",
			headers: []models.URLOptionKeyValuePair{
				{Key: "connection", Value: "keep-alive"},
			},
			wantAbsent: []string{"Connection"},
		},
		{
			name: "allows Accept and Content-Type from query",
			headers: []models.URLOptionKeyValuePair{
				{Key: "Accept", Value: "text/html"},
				{Key: "Content-Type", Value: "text/plain"},
			},
			wantPresent: []string{"Accept", "Content-Type"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, err := http.NewRequest("GET", "http://example.com", nil)
			require.NoError(t, err)
			query := models.Query{
				URLOptions: models.URLOptions{
					Headers: tt.headers,
				},
			}
			got := ApplyHeadersFromQuery(context.TODO(), query, models.InfinitySettings{}, req, true)
			for _, h := range tt.wantPresent {
				assert.NotEmpty(t, got.Header.Get(h), "expected header %s to be present", h)
			}
			for _, h := range tt.wantAbsent {
				assert.Empty(t, got.Header.Get(h), "expected header %s to be absent", h)
			}
		})
	}
}
