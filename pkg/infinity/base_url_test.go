package infinity_test

import (
	"context"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/require"
)

func TestGetQueryURLBaseURLExpansionAndScheme(t *testing.T) {
	tests := []struct {
		name          string
		baseURL       string
		queryURL      string
		fields        map[string]string
		excludeSecret bool
		want          string
		wantErr       error
	}{
		{
			name:    "relative URL with tenant macro in base host",
			baseURL: "https://${__qs.tenant}.example.com/api", queryURL: "/users",
			fields: map[string]string{"tenant": "acme"},
			want:   "https://acme.example.com/api/users?tenant=acme",
		},
		{
			name:    "expanded absolute URL with tenant macro in base host",
			baseURL: "https://${__qs.tenant}.example.com", queryURL: "https://acme.example.com/users",
			fields: map[string]string{"tenant": "acme"},
			want:   "https://acme.example.com/users?tenant=acme",
		},
		{
			name:    "tenant macro in both URLs",
			baseURL: "https://${__qs.tenant}.example.com", queryURL: "https://${__qs.tenant}.example.com/users",
			fields: map[string]string{"tenant": "acme"},
			want:   "https://acme.example.com/users?tenant=acme",
		},
		{
			name:    "redacted tenant macro",
			baseURL: "https://${__qs.tenant}.example.com", queryURL: "/users",
			fields: map[string]string{"tenant": "acme"}, excludeSecret: true,
			want: "https://xxxxxxxx.example.com/users?tenant=xxxxxxxx",
		},
		{
			name: "relative URL with bare localhost", baseURL: "localhost", queryURL: "/x",
			want: "http://localhost/x",
		},
		{
			name: "bare localhost query URL", baseURL: "localhost", queryURL: "localhost/x",
			want: "http://localhost/x",
		},
		{
			name: "absolute localhost query URL", baseURL: "localhost", queryURL: "http://localhost/x",
			want: "http://localhost/x",
		},
		{
			name: "bare localhost with port", baseURL: "localhost:3000", queryURL: "/x",
			want: "http://localhost:3000/x",
		},
		{
			name: "base path concatenation preserves slashes", baseURL: "https://api.example.com/api/", queryURL: "/users",
			want: "https://api.example.com/api//users",
		},
		{
			name: "bare hostname retains HTTPS", baseURL: "api.example.com", queryURL: "/x",
			want: "https://api.example.com/x",
		},
		{
			name: "userinfo cannot escape expanded base", baseURL: "https://${__qs.tenant}.example.com",
			queryURL: "https://acme.example.com@other.example/x", fields: map[string]string{"tenant": "acme"},
			wantErr: models.ErrQueryURLNotAllowedByBaseURL,
		},
		{
			name: "suffix cannot escape expanded base", baseURL: "https://${__qs.tenant}.example.com",
			queryURL: ".other.example/x", fields: map[string]string{"tenant": "acme"},
			wantErr: models.ErrQueryURLNotAllowedByBaseURL,
		},
		{
			name: "userinfo cannot escape bare localhost", baseURL: "localhost", queryURL: "@other.example/x",
			wantErr: models.ErrQueryURLNotAllowedByBaseURL,
		},
		{
			name: "suffix cannot escape bare localhost", baseURL: "localhost", queryURL: ".other.example/x",
			wantErr: models.ErrQueryURLNotAllowedByBaseURL,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			settings := models.InfinitySettings{URL: tt.baseURL, SecureQueryFields: tt.fields}
			got, err := infinity.GetQueryURL(context.Background(), nil, settings, models.Query{URL: tt.queryURL}, !tt.excludeSecret)
			if tt.wantErr != nil {
				require.ErrorIs(t, err, tt.wantErr)
				return
			}
			require.NoError(t, err)
			require.Equal(t, tt.want, got)
		})
	}
}
