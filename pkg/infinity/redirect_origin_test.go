package infinity_test

import (
	"context"
	"net/http"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/require"
)

func TestRedirectBaseOrigin(t *testing.T) {
	for _, tt := range []struct {
		name, base, target string
		wantErr            bool
	}{
		{"same origin", "https://example.test/api", "https://example.test/other", false},
		{"default port", "https://example.test:443", "https://example.test/other", false},
		{"host case", "https://EXAMPLE.test", "https://example.test/other", false},
		{"different host", "https://example.test", "https://other.test/", true},
		{"host suffix", "https://example.test", "https://example.test.other/", true},
		{"different scheme", "https://example.test", "http://example.test/", true},
		{"different port", "https://example.test", "https://example.test:8443/", true},
		{"IPv6 same origin", "http://[::1]:8080/api", "http://[::1]:8080/other", false},
		{"IPv6 different port", "http://[::1]:8080", "http://[::1]:8081/", true},
	} {
		t.Run(tt.name, func(t *testing.T) {
			client, err := infinity.NewClient(context.Background(), models.InfinitySettings{URL: tt.base})
			require.NoError(t, err)
			defer client.HttpClient.CloseIdleConnections()
			req, err := http.NewRequest(http.MethodGet, tt.target, nil)
			require.NoError(t, err)
			require.NotNil(t, client.HttpClient.CheckRedirect)
			err = client.HttpClient.CheckRedirect(req, nil)
			if tt.wantErr {
				require.ErrorIs(t, err, models.ErrQueryURLNotAllowedByBaseURL)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
