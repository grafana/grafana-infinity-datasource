package mock_test

import (
	"strings"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/experimental"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/mock"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
)

var updateGoldenFiles bool = false

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
					require.Equal(t, querySrv.QueryTypeUQL, customMeta.Query.Type)
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
			query, err := querySrv.LoadQuery(bq)
			require.Nil(t, err)
			frame, err := infinity.GetFrameForInlineSources(query)
			if tt.wantErr != nil {
				require.NotNil(t, err)
				assert.Equal(t, tt.wantErr, err)
				return
			}
			require.Nil(t, err)
			if !tt.skipGoldenCheck {
				require.NotNil(t, frame)
				response := &backend.DataResponse{Frames: data.Frames{frame}}
				experimental.CheckGoldenJSONResponse(t, "testdata", strings.ReplaceAll(t.Name(), "TestInlineSources/", "inline/"), response, updateGoldenFiles)
			}
			if tt.test != nil {
				tt.test(t, frame)
			}
		})
	}
}

func TestRemoteSources(t *testing.T) {
	tests := []struct {
		name            string
		queryJSON       string
		client          *infinity.Client
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
					require.Equal(t, "###############\n## URL\n###############\n\nhttps://jsonplaceholder.typicode.com/users\n\n###############\n## Curl Command\n###############\n\ncurl -X 'GET' -H 'Accept: application/json;q=0.9,text/plain' 'https://jsonplaceholder.typicode.com/users'", frame.Meta.ExecutedQueryString)
				})
			},
		},
		{
			name: "json query",
			queryJSON: `{
				"refId":					"q1",
				"type": 					"json",
				"source":					"url",
				"format":					"table",
				"url":						"http://foo"
			}`,
			client: mock.New("[1,2,3]"),
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				require.Equal(t, "###############\n## URL\n###############\n\nhttp://foo\n\n###############\n## Curl Command\n###############\n\ncurl -X 'GET' -H 'Accept: application/json;q=0.9,text/plain' 'http://foo'", frame.Meta.ExecutedQueryString)
				t.Run("should have frame name correctly", func(t *testing.T) {
					require.Equal(t, "q1", frame.Name)
				})
				t.Run("should have custom meta data correctly", func(t *testing.T) {
					require.NotNil(t, frame.Meta.Custom)
					customMeta := frame.Meta.Custom.(*infinity.CustomMeta)
					require.NotNil(t, customMeta)
					require.Equal(t, querySrv.QueryTypeJSON, customMeta.Query.Type)
					require.Equal(t, "url", customMeta.Query.Source)
					require.Equal(t, "table", customMeta.Query.Format)
					require.Equal(t, "http://foo", customMeta.Query.URL)
					require.Equal(t, []interface{}([]interface{}{float64(1), float64(2), float64(3)}), customMeta.Data)
					require.Equal(t, "", customMeta.Error)
				})
			},
		},
		{
			name: "csv query",
			queryJSON: `{
				"refId":					"q1",
				"type": 					"csv",
				"source":					"url",
				"format":					"table",
				"url":						"http://bar"
			}`,
			client: mock.New("a,b\na1,b1"),
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				require.Equal(t, "###############\n## URL\n###############\n\nhttp://bar\n\n###############\n## Curl Command\n###############\n\ncurl -X 'GET' -H 'Accept: text/csv; charset=utf-8' 'http://bar'", frame.Meta.ExecutedQueryString)
				t.Run("should have frame name correctly", func(t *testing.T) {
					require.Equal(t, "q1", frame.Name)
				})
				t.Run("should have custom meta data correctly", func(t *testing.T) {
					require.NotNil(t, frame.Meta.Custom)
					customMeta := frame.Meta.Custom.(*infinity.CustomMeta)
					require.NotNil(t, customMeta)
					require.Equal(t, querySrv.QueryTypeCSV, customMeta.Query.Type)
					require.Equal(t, "url", customMeta.Query.Source)
					require.Equal(t, "table", customMeta.Query.Format)
					require.Equal(t, "http://bar", customMeta.Query.URL)
					require.Equal(t, "a,b\na1,b1", customMeta.Data)
					require.Equal(t, "", customMeta.Error)
				})
			},
		},
		{
			name: "uql query",
			queryJSON: `{
				"refId":					"q1",
				"type": 					"uql",
				"source":					"url",
				"format":					"table",
				"url":						"http://foo",
				"uql":						"parse-json | count"
			}`,
			client: mock.New("[1,2,3]"),
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				require.Equal(t, "###############\n## URL\n###############\n\nhttp://foo\n\n###############\n## Curl Command\n###############\n\ncurl -X 'GET' 'http://foo'\n\n###############\n## UQL\n###############\n\nparse-json | count", frame.Meta.ExecutedQueryString)
				t.Run("should have frame name correctly", func(t *testing.T) {
					require.Equal(t, "q1", frame.Name)
				})
				t.Run("should have custom meta data correctly", func(t *testing.T) {
					require.NotNil(t, frame.Meta.Custom)
					customMeta := frame.Meta.Custom.(*infinity.CustomMeta)
					require.NotNil(t, customMeta)
					require.Equal(t, querySrv.QueryTypeUQL, customMeta.Query.Type)
					require.Equal(t, "url", customMeta.Query.Source)
					require.Equal(t, "table", customMeta.Query.Format)
					require.Equal(t, "http://foo", customMeta.Query.URL)
					require.Equal(t, "parse-json | count", customMeta.Query.UQL)
					require.Equal(t, "[1,2,3]", customMeta.Data)
					require.Equal(t, "", customMeta.Error)
				})
			},
		},
		{
			name: "groq query",
			queryJSON: `{
				"refId":					"q1",
				"type": 					"groq",
				"source":					"url",
				"format":					"table",
				"url":						"http://foo",
				"groq":						"*{1,2,3}"
			}`,
			client: mock.New("[1,2,3]"),
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				require.Equal(t, "###############\n## URL\n###############\n\nhttp://foo\n\n###############\n## Curl Command\n###############\n\ncurl -X 'GET' 'http://foo'\n###############\n## GROQ\n###############\n\n*{1,2,3}\n", frame.Meta.ExecutedQueryString)
				t.Run("should have frame name correctly", func(t *testing.T) {
					require.Equal(t, "q1", frame.Name)
				})
				t.Run("should have custom meta data correctly", func(t *testing.T) {
					require.NotNil(t, frame.Meta.Custom)
					customMeta := frame.Meta.Custom.(*infinity.CustomMeta)
					require.NotNil(t, customMeta)
					require.Equal(t, querySrv.QueryTypeGROQ, customMeta.Query.Type)
					require.Equal(t, "url", customMeta.Query.Source)
					require.Equal(t, "table", customMeta.Query.Format)
					require.Equal(t, "http://foo", customMeta.Query.URL)
					require.Equal(t, "*{1,2,3}", customMeta.Query.GROQ)
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
			query, err := querySrv.LoadQuery(bq)
			require.Nil(t, err)
			client := tt.client
			if client == nil {
				client = mock.New("")
			}
			frame, err := infinity.GetFrameForURLSources(query, *client, map[string]string{})
			if tt.wantErr != nil {
				require.NotNil(t, err)
				assert.Equal(t, tt.wantErr, err)
				return
			}
			require.Nil(t, err)
			if !tt.skipGoldenCheck {
				require.NotNil(t, frame)
				response := &backend.DataResponse{Frames: data.Frames{frame}}
				experimental.CheckGoldenJSONResponse(t, "testdata", strings.ReplaceAll(t.Name(), "TestRemoteSources/", "remote/"), response, updateGoldenFiles)
			}
			if tt.test != nil {
				tt.test(t, frame)
			}
		})
	}
}
