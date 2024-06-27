package infinity_test

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func ptr[T any](value T) *T {
	return &value
}

func Test_GetFrameForURLSources(t *testing.T) {
	tests := []struct {
		name            string
		settings        models.InfinitySettings
		query           models.Query
		requestHeaders  map[string]string
		httpHandlerFunc func(http.ResponseWriter, *http.Request)
		want            []*data.Field
	}{
		{
			"pagination with nextLink",
			models.InfinitySettings{},
			models.Query{
				PageParamNextLinkFieldExtractionPath: "$lookup($, \"@odata.nextLink\")",
				PageMaxPages:                         5,
				PageMode:                             models.PaginationModeNextLink,
				Parser:                               models.InfinityParserBackend,
				RootSelector:                         "$.data",
				Type:                                 models.QueryTypeJSON,
			},
			nil,
			func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "application/json")

				resp := map[string]any{}

				switch r.URL.Path {
				case "/2/":
					resp["data"] = map[string]string{"A": "ValueA2", "B": "ValueB2", "C": "ValueC2"}
				default:
					resp["data"] = map[string]string{"A": "ValueA1", "B": "ValueB1", "C": "ValueC1"}
					resp["@odata.nextLink"] = fmt.Sprintf("http://%s/2/", r.Host)
				}

				assert.NoError(t, json.NewEncoder(w).Encode(resp))
			},
			[]*data.Field{
				data.NewField("A", nil, []*string{ptr("ValueA1"), ptr("ValueA2")}),
				data.NewField("B", nil, []*string{ptr("ValueB1"), ptr("ValueB2")}),
				data.NewField("C", nil, []*string{ptr("ValueC1"), ptr("ValueC2")}),
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(tt.httpHandlerFunc))
			tt.settings.AllowedHosts = []string{server.URL}
			tt.query.URL = server.URL

			client := infinity.Client{
				Settings:   tt.settings,
				HttpClient: server.Client(),
			}

			u, err := infinity.GetFrameForURLSources(context.TODO(), tt.query, client, tt.requestHeaders)
			require.NoError(t, err)
			assert.Equal(t, tt.want, u.Fields)
		})
	}
}
