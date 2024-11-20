package testsuite_test

import (
	"context"
	"net/http"
	"strings"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/experimental"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// newTestClient creates a new mock infinity client for query testing
func newTestClient(response string) *infinity.Client {
	return &infinity.Client{
		Settings: models.InfinitySettings{
			URL:                  "http://localhost:3000",
			AuthenticationMethod: models.AuthenticationMethodNone,
		},
		HttpClient: &http.Client{},
		IsMock:     true,
	}
}

func TestRemoteSources(t *testing.T) {
	t.Run("should execute default query without error", func(t *testing.T) {
		query, err := models.LoadQuery(context.Background(), backend.DataQuery{}, backend.PluginContext{})
		require.Nil(t, err)
		client := newTestClient("")
		frame, err := infinity.GetFrameForURLSources(context.Background(), query, *client, map[string]string{}, &backend.PluginContext{})
		require.Nil(t, err)
		require.NotNil(t, frame)
	})
}

func TestInlineSources(t *testing.T) {
	tests := []struct {
		name            string
		queryJSON       string
		timeRange       backend.TimeRange
		wantErr         error
		skipGoldenCheck bool
		test            func(t *testing.T, frame *data.Frame)
	}{
		{
			name: "should execute default query without error",
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				t.Run("should have custom meta data correctly", func(t *testing.T) {
					require.NotNil(t, frame.Meta.Custom)
					require.Equal(t, "This feature is not available for this type of query yet", frame.Meta.ExecutedQueryString)
				})
			},
		},
		{
			name: "should return inline uql correctly",
			queryJSON: `{
				"refId":					"q1",
				"type": 					"uql",
				"source":					"inline",
				"format":					"table",
				"data":						"[1,2,3]",
				"uql":						"parse-json | count"
			}`,
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				t.Run("should have frame name correctly", func(t *testing.T) {
					require.Equal(t, "q1", frame.Name)
				})
				t.Run("should have custom meta data correctly", func(t *testing.T) {
					require.NotNil(t, frame.Meta.Custom)
					customMeta := frame.Meta.Custom.(*infinity.CustomMeta)
					require.NotNil(t, customMeta)
					require.Equal(t, models.QueryTypeUQL, customMeta.Query.Type)
					require.Equal(t, "inline", customMeta.Query.Source)
					require.Equal(t, "table", customMeta.Query.Format)
					require.Equal(t, "[1,2,3]", customMeta.Query.Data)
					require.Equal(t, "parse-json | count", customMeta.Query.UQL)
					require.Equal(t, "[1,2,3]", customMeta.Data)
					require.Equal(t, "", customMeta.Error)
				})
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			require.NotEmpty(t, tt.name)
			queryJSON := tt.queryJSON
			if queryJSON == "" {
				queryJSON = "{}"
			}
			bq := backend.DataQuery{JSON: []byte(queryJSON), TimeRange: tt.timeRange}
			query, err := models.LoadQuery(context.Background(), bq, backend.PluginContext{})
			require.Nil(t, err)
			frame, err := infinity.GetFrameForInlineSources(context.TODO(), query)
			if tt.wantErr != nil {
				require.NotNil(t, err)
				assert.Equal(t, tt.wantErr, err)
				return
			}
			require.Nil(t, err)
			if !tt.skipGoldenCheck {
				require.NotNil(t, frame)
				response := &backend.DataResponse{Frames: data.Frames{frame}}
				experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestInlineSources/", "inline/"), response, false)
			}
			if tt.test != nil {
				tt.test(t, frame)
			}
		})
	}
}
