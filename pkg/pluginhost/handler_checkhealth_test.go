package pluginhost

import (
	"fmt"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCheckHealth(t *testing.T) {
	tests := []struct {
		name   string
		config backend.DataSourceInstanceSettings
		want   *backend.CheckHealthResult
	}{
		{
			name: "default settings should pass the health check",
			config: backend.DataSourceInstanceSettings{
				JSONData:                []byte(`{}`),
				DecryptedSecureJSONData: map[string]string{},
			},
			want: &backend.CheckHealthResult{
				Status:      backend.HealthStatusOk,
				Message:     "Health check successful",
				JSONDetails: nil,
			},
		},
		{
			name: "should fail when auth configured without allowed hosts",
			config: backend.DataSourceInstanceSettings{
				BasicAuthUser: "foo",
				JSONData: []byte(`{
					"auth_method": "basicAuth"
				}`),
				DecryptedSecureJSONData: map[string]string{
					"basicAuthPassword": "bar",
				},
			},
			want: &backend.CheckHealthResult{
				Status:      backend.HealthStatusError,
				Message:     "Health check failed. requested URL not allowed. To allow this URL, update the data source config in the Security tab, Allowed hosts section",
				JSONDetails: []byte(fmt.Sprintf(`{"verboseMessage":"%s"}`, models.ErrInvalidConfigHostNotAllowed.Error())),
			},
		},
		{
			name: "should fail when basic auth configured without password",
			config: backend.DataSourceInstanceSettings{
				BasicAuthUser: "foo",
				JSONData: []byte(`{
					"auth_method": "basicAuth",
					"allowedHosts": ["https://foo.com"]
				}`),
				DecryptedSecureJSONData: map[string]string{},
			},
			want: &backend.CheckHealthResult{
				Status:      backend.HealthStatusError,
				Message:     "Health check failed. invalid or empty password detected",
				JSONDetails: []byte(fmt.Sprintf(`{"verboseMessage":"%s\n%s"}`, models.ErrInvalidConfig.Error(), models.ErrInvalidConfigPassword.Error())),
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			settings, err := models.LoadSettings(t.Context(), tt.config)
			require.Nil(t, err)
			client, err := infinity.NewClient(t.Context(), settings)
			require.Nil(t, err)
			got, err := CheckHealth(t.Context(), client, &backend.CheckHealthRequest{})
			require.Nil(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}
