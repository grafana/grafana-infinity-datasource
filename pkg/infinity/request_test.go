package infinity

import (
	"net/http"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/require"
)

func TestApplyGrafanaHeaders(t *testing.T) {
	tests := []struct {
		name     string
		settings models.InfinitySettings
		pCtx     *backend.PluginContext
		want     map[string]string
	}{
		{
			name: "should add user header when enabled",
			settings: models.InfinitySettings{
				SendUserHeader: true,
			},
			pCtx: &backend.PluginContext{
				User: &backend.User{
					Login: "testuser",
				},
			},
			want: map[string]string{
				"X-Grafana-User": "testuser",
			},
		},
		{
			name: "should add datasource id header when enabled",
			settings: models.InfinitySettings{
				SendDatasourceIDHeader: true,
			},
			pCtx: &backend.PluginContext{
				DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{
					ID: 123,
				},
			},
			want: map[string]string{
				"X-Grafana-Datasource-UID": "123",
			},
		},
		{
			name: "should add both headers when both enabled",
			settings: models.InfinitySettings{
				SendUserHeader:         true,
				SendDatasourceIDHeader: true,
			},
			pCtx: &backend.PluginContext{
				User: &backend.User{
					Login: "testuser",
				},
				DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{
					ID: 123,
				},
			},
			want: map[string]string{
				"X-Grafana-User":           "testuser",
				"X-Grafana-Datasource-UID": "123",
			},
		},
		{
			name: "should not add headers when disabled",
			settings: models.InfinitySettings{
				SendUserHeader:         false,
				SendDatasourceIDHeader: false,
			},
			pCtx: &backend.PluginContext{
				User: &backend.User{
					Login: "testuser",
				},
				DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{
					ID: 123,
				},
			},
			want: map[string]string{},
		},
		{
			name: "should handle nil plugin context",
			settings: models.InfinitySettings{
				SendUserHeader:         true,
				SendDatasourceIDHeader: true,
			},
			pCtx: nil,
			want: map[string]string{},
		},
		{
			name: "should handle nil user when user header enabled",
			settings: models.InfinitySettings{
				SendUserHeader: true,
			},
			pCtx: &backend.PluginContext{
				User: nil,
				DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{
					ID: 123,
				},
			},
			want: map[string]string{},
		},
		{
			name: "should handle nil datasource settings when datasource header enabled",
			settings: models.InfinitySettings{
				SendDatasourceIDHeader: true,
			},
			pCtx: &backend.PluginContext{
				User:                       &backend.User{Login: "testuser"},
				DataSourceInstanceSettings: nil,
			},
			want: map[string]string{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "http://example.com", nil)
			got := ApplyGrafanaHeaders(tt.settings, req, tt.pCtx)

			// Verify each expected header
			for k, v := range tt.want {
				require.Equal(t, v, got.Header.Get(k))
			}

			// Verify no unexpected headers
			require.Equal(t, len(tt.want), len(got.Header))
		})
	}
}
