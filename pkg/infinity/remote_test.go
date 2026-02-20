package infinity

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"sync/atomic"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// paginationMocker is an http.RoundTripper that returns success for the
// first successCount requests and HTTP 400 for all subsequent ones.
type paginationMocker struct {
	successCount int32
	calls        atomic.Int32
	body         string
}

func (m *paginationMocker) RoundTrip(_ *http.Request) (*http.Response, error) {
	n := m.calls.Add(1)
	if n <= m.successCount {
		return &http.Response{
			StatusCode: http.StatusOK,
			Status:     "200 OK",
			Body:       io.NopCloser(bytes.NewBufferString(m.body)),
		}, nil
	}
	return &http.Response{
		StatusCode: http.StatusBadRequest,
		Status:     "400 Bad Request",
		Body:       io.NopCloser(bytes.NewBufferString(`{"error":"no more pages"}`)),
	}, nil
}

func newPaginationClient(t *testing.T, successCount int32, body string) Client {
	t.Helper()
	client, err := NewClient(context.TODO(), models.InfinitySettings{})
	require.NoError(t, err)
	client.HttpClient.Transport = &paginationMocker{
		successCount: successCount,
		body:         body,
	}
	client.IsMock = true
	return *client
}

func TestGetPaginatedResults_BestEffort(t *testing.T) {
	jsonBody := `[{"id":1,"name":"alice"},{"id":2,"name":"bob"}]`
	pCtx := &backend.PluginContext{}
	baseQuery := models.Query{
		RefID:                  "A",
		Type:                   models.QueryTypeJSON,
		Source:                 "url",
		Parser:                 models.InfinityParserBackend,
		URL:                    "http://localhost/api/items",
		URLOptions:             models.URLOptions{Method: http.MethodGet},
		PageMode:               models.PaginationModePage,
		PageMaxPages:           3,
		PageParamPageFieldName: "page",
		PageParamPageFieldType: models.PaginationParamTypeQuery,
		PageParamPageFieldVal:  1,
		PageParamSizeFieldName: "limit",
		PageParamSizeFieldType: models.PaginationParamTypeQuery,
		PageParamSizeFieldVal:  100,
		Columns:                []models.InfinityColumn{},
		ComputedColumns:        []models.InfinityColumn{},
	}

	t.Run("page mode best effort returns data from successful pages", func(t *testing.T) {
		query := baseQuery
		query.PageBestEffort = true
		client := newPaginationClient(t, 1, jsonBody)
		frame, err := GetPaginatedResults(context.Background(), pCtx, query, client, map[string]string{})
		require.NoError(t, err)
		require.NotNil(t, frame)
		assert.Equal(t, 2, frame.Rows())
	})

	t.Run("page mode without best effort returns error on failed page", func(t *testing.T) {
		query := baseQuery
		query.PageBestEffort = false
		client := newPaginationClient(t, 1, jsonBody)
		frame, err := GetPaginatedResults(context.Background(), pCtx, query, client, map[string]string{})
		require.Error(t, err)
		assert.Nil(t, frame)
	})

	t.Run("page mode best effort with all pages succeeding returns all data", func(t *testing.T) {
		query := baseQuery
		query.PageBestEffort = true
		client := newPaginationClient(t, 3, jsonBody)
		frame, err := GetPaginatedResults(context.Background(), pCtx, query, client, map[string]string{})
		require.NoError(t, err)
		require.NotNil(t, frame)
		// 3 pages * 2 rows each = 6 rows
		assert.Equal(t, 6, frame.Rows())
	})

	t.Run("page mode best effort still fails when first page errors", func(t *testing.T) {
		query := baseQuery
		query.PageBestEffort = true
		client := newPaginationClient(t, 0, jsonBody)
		frame, err := GetPaginatedResults(context.Background(), pCtx, query, client, map[string]string{})
		require.Error(t, err)
		assert.Nil(t, frame)
	})

	t.Run("offset mode best effort returns data from successful pages", func(t *testing.T) {
		query := baseQuery
		query.PageMode = models.PaginationModeOffset
		query.PageBestEffort = true
		query.PageParamOffsetFieldName = "offset"
		query.PageParamOffsetFieldType = models.PaginationParamTypeQuery
		query.PageParamOffsetFieldVal = 0
		client := newPaginationClient(t, 1, jsonBody)
		frame, err := GetPaginatedResults(context.Background(), pCtx, query, client, map[string]string{})
		require.NoError(t, err)
		require.NotNil(t, frame)
		assert.Equal(t, 2, frame.Rows())
	})

	t.Run("offset mode without best effort returns error on failed page", func(t *testing.T) {
		query := baseQuery
		query.PageMode = models.PaginationModeOffset
		query.PageBestEffort = false
		query.PageParamOffsetFieldName = "offset"
		query.PageParamOffsetFieldType = models.PaginationParamTypeQuery
		query.PageParamOffsetFieldVal = 0
		client := newPaginationClient(t, 1, jsonBody)
		frame, err := GetPaginatedResults(context.Background(), pCtx, query, client, map[string]string{})
		require.Error(t, err)
		assert.Nil(t, frame)
	})

	t.Run("offset mode best effort still fails when first page errors", func(t *testing.T) {
		query := baseQuery
		query.PageMode = models.PaginationModeOffset
		query.PageBestEffort = true
		query.PageParamOffsetFieldName = "offset"
		query.PageParamOffsetFieldType = models.PaginationParamTypeQuery
		query.PageParamOffsetFieldVal = 0
		client := newPaginationClient(t, 0, jsonBody)
		frame, err := GetPaginatedResults(context.Background(), pCtx, query, client, map[string]string{})
		require.Error(t, err)
		assert.Nil(t, frame)
	})

	t.Run("list mode ignores the best effort flag", func(t *testing.T) {
		query := baseQuery
		query.PageMode = models.PaginationModeList
		query.PageBestEffort = true
		query.PageMaxPages = 3
		query.PageParamListFieldName = "id"
		query.PageParamListFieldType = models.PaginationParamTypeQuery
		query.PageParamListFieldValue = "a,b,c"
		client := newPaginationClient(t, 1, jsonBody)
		frame, err := GetPaginatedResults(context.Background(), pCtx, query, client, map[string]string{})
		require.Error(t, err)
		assert.Nil(t, frame)
	})
}

func TestGetPaginatedResults_BestEffort_RequestCount(t *testing.T) {
	jsonBody := `[{"id":1}]`
	pCtx := &backend.PluginContext{}
	query := models.Query{
		RefID:                  "A",
		Type:                   models.QueryTypeJSON,
		Source:                 "url",
		Parser:                 models.InfinityParserBackend,
		URL:                    "http://localhost/api/items",
		URLOptions:             models.URLOptions{Method: http.MethodGet},
		PageMode:               models.PaginationModePage,
		PageMaxPages:           5,
		PageBestEffort:       true,
		PageParamPageFieldName: "page",
		PageParamPageFieldType: models.PaginationParamTypeQuery,
		PageParamPageFieldVal:  1,
		PageParamSizeFieldName: "limit",
		PageParamSizeFieldType: models.PaginationParamTypeQuery,
		PageParamSizeFieldVal:  100,
		Columns:                []models.InfinityColumn{},
		ComputedColumns:        []models.InfinityColumn{},
	}

	t.Run("stops fetching after first failed page", func(t *testing.T) {
		mock := &paginationMocker{
			successCount: 2,
			body:         jsonBody,
		}
		client, err := NewClient(context.TODO(), models.InfinitySettings{})
		require.NoError(t, err)
		client.HttpClient.Transport = mock
		client.IsMock = true

		frame, err := GetPaginatedResults(context.Background(), pCtx, query, *client, map[string]string{})
		require.NoError(t, err)
		require.NotNil(t, frame)
		// 2 successful pages * 1 row each = 2 rows
		assert.Equal(t, 2, frame.Rows())
		// Should have made exactly 3 HTTP calls: 2 successful + 1 failed that triggered the break
		assert.Equal(t, int32(3), mock.calls.Load(),
			fmt.Sprintf("expected 3 HTTP requests (2 success + 1 fail), got %d", mock.calls.Load()))
	})
}

func TestApplyPaginationItemToQuery(t *testing.T) {
	t.Run(string(models.PaginationParamTypeQuery), func(t *testing.T) {
		tests := []struct {
			name       string
			query      models.Query
			fieldName  string
			fieldValue string
			want       models.Query
		}{
			{
				name:       "should add pagination params to query url params",
				query:      models.Query{URLOptions: models.URLOptions{Params: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}}}},
				fieldName:  "hello",
				fieldValue: "world",
				want:       models.Query{URLOptions: models.URLOptions{Params: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}, {Key: "hello", Value: "world"}}}},
			},
			{
				name:       "should not override existing pagination params to query url params",
				query:      models.Query{URLOptions: models.URLOptions{Params: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}}}},
				fieldName:  "foo",
				fieldValue: "baz",
				want:       models.Query{URLOptions: models.URLOptions{Params: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}, {Key: "foo", Value: "baz"}}}},
			},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				got := ApplyPaginationItemToQuery(tt.query, "", tt.fieldName, tt.fieldValue)
				require.Equal(t, tt.want, got)
			})
		}
	})
	t.Run(string(models.PaginationParamTypeHeader), func(t *testing.T) {
		tests := []struct {
			name       string
			query      models.Query
			fieldName  string
			fieldValue string
			want       models.Query
		}{
			{
				name:       "should add pagination params to header",
				query:      models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}}}},
				fieldName:  "hello",
				fieldValue: "world",
				want:       models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}, {Key: "hello", Value: "world"}}}},
			},
			{
				name:       "should not override existing pagination params to header",
				query:      models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}}}},
				fieldName:  "foo",
				fieldValue: "baz",
				want:       models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}, {Key: "foo", Value: "baz"}}}},
			},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeHeader, tt.fieldName, tt.fieldValue)
				require.Equal(t, tt.want, got)
			})
		}
	})
	t.Run(string(models.PaginationParamTypeBodyData), func(t *testing.T) {
		tests := []struct {
			name       string
			query      models.Query
			fieldName  string
			fieldValue string
			want       models.Query
		}{
			{
				name:       "should add pagination params to body params",
				query:      models.Query{URLOptions: models.URLOptions{BodyForm: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}}}},
				fieldName:  "hello",
				fieldValue: "world",
				want:       models.Query{URLOptions: models.URLOptions{BodyForm: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}, {Key: "hello", Value: "world"}}}},
			},
			{
				name:       "should not override existing pagination params to body params",
				query:      models.Query{URLOptions: models.URLOptions{BodyForm: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}}}},
				fieldName:  "foo",
				fieldValue: "baz",
				want:       models.Query{URLOptions: models.URLOptions{BodyForm: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}, {Key: "foo", Value: "baz"}}}},
			},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeBodyData, tt.fieldName, tt.fieldValue)
				require.Equal(t, tt.want, got)
			})
		}
	})
	t.Run(string(models.PaginationParamTypeBodyJson), func(t *testing.T) {
		t.Skip() // TODO: NOT IMPLEMENTED YET
		tests := []struct {
			name       string
			query      models.Query
			fieldName  string
			fieldValue string
			want       models.Query
		}{}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeBodyJson, tt.fieldName, tt.fieldValue)
				require.Equal(t, tt.want, got)
			})
		}
	})
	t.Run(string(models.PaginationParamTypeReplace), func(t *testing.T) {
		t.Run("replace params in URL", func(t *testing.T) {
			tests := []struct {
				name       string
				query      models.Query
				fieldName  string
				fieldValue string
				want       models.Query
			}{
				{
					name:       "should replace pagination params in URL path",
					query:      models.Query{URL: "https://abc.com/hello/page/${__pagination.page}"},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URL: "https://abc.com/hello/page/3"},
				},
				{
					name:       "should replace all pagination params in URL path",
					query:      models.Query{URL: "https://abc.com/hello/page/${__pagination.page}/page_num/${__pagination.page}"},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URL: "https://abc.com/hello/page/3/page_num/3"},
				},
			}
			for _, tt := range tests {
				t.Run(tt.name, func(t *testing.T) {
					got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeReplace, tt.fieldName, tt.fieldValue)
					require.Equal(t, tt.want, got)
				})
			}
		})
		t.Run("replace params in URL POST Body", func(t *testing.T) {
			tests := []struct {
				name       string
				query      models.Query
				fieldName  string
				fieldValue string
				want       models.Query
			}{
				{
					name:       "should replace pagination params in URL POST body",
					query:      models.Query{URLOptions: models.URLOptions{Body: `{ "page" : ${__pagination.page} }`}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{Body: `{ "page" : 3 }`}},
				},
				{
					name:       "should replace all pagination params in URL POST body",
					query:      models.Query{URLOptions: models.URLOptions{Body: `{ "page" : ${__pagination.page}, "page_num" : ${__pagination.page} }`}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{Body: `{ "page" : 3, "page_num" : 3 }`}},
				},
			}
			for _, tt := range tests {
				t.Run(tt.name, func(t *testing.T) {
					got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeReplace, tt.fieldName, tt.fieldValue)
					require.Equal(t, tt.want, got)
				})
			}
		})
		t.Run("replace params in URL POST Body GraphQL Query", func(t *testing.T) {
			tests := []struct {
				name       string
				query      models.Query
				fieldName  string
				fieldValue string
				want       models.Query
			}{
				{
					name:       "should replace pagination params in URL GraphQL Query",
					query:      models.Query{URLOptions: models.URLOptions{BodyGraphQLQuery: `{ "page" : ${__pagination.page} }`}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{BodyGraphQLQuery: `{ "page" : 3 }`}},
				},
				{
					name:       "should replace all pagination params in URL GraphQL Query",
					query:      models.Query{URLOptions: models.URLOptions{BodyGraphQLQuery: `{ "page" : ${__pagination.page}, "page_num" : ${__pagination.page} }`}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{BodyGraphQLQuery: `{ "page" : 3, "page_num" : 3 }`}},
				},
			}
			for _, tt := range tests {
				t.Run(tt.name, func(t *testing.T) {
					got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeReplace, tt.fieldName, tt.fieldValue)
					require.Equal(t, tt.want, got)
				})
			}
		})
		t.Run("replace params in URL POST Body GraphQL Variables", func(t *testing.T) {
			tests := []struct {
				name       string
				query      models.Query
				fieldName  string
				fieldValue string
				want       models.Query
			}{
				{
					name:       "should replace pagination params in URL GraphQL Variables",
					query:      models.Query{URLOptions: models.URLOptions{BodyGraphQLVariables: `{ "page" : ${__pagination.page} }`}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{BodyGraphQLVariables: `{ "page" : 3 }`}},
				},
				{
					name:       "should replace all pagination params in URL  GraphQL Variables",
					query:      models.Query{URLOptions: models.URLOptions{BodyGraphQLVariables: `{ "page" : ${__pagination.page}, "page_num" : ${__pagination.page} }`}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{BodyGraphQLVariables: `{ "page" : 3, "page_num" : 3 }`}},
				},
			}
			for _, tt := range tests {
				t.Run(tt.name, func(t *testing.T) {
					got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeReplace, tt.fieldName, tt.fieldValue)
					require.Equal(t, tt.want, got)
				})
			}
		})
		t.Run("replace params in URL Headers", func(t *testing.T) {
			tests := []struct {
				name       string
				query      models.Query
				fieldName  string
				fieldValue string
				want       models.Query
			}{
				{
					name:       "should replace pagination params in URL headers",
					query:      models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "page", Value: "${__pagination.page}"}}}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "page", Value: "3"}}}},
				},
				{
					name:       "should replace all pagination params in URL headers",
					query:      models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "page", Value: "${__pagination.page}"}, {Key: "page_num", Value: "${__pagination.page}"}}}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "page", Value: "3"}, {Key: "page_num", Value: "3"}}}},
				},
			}
			for _, tt := range tests {
				t.Run(tt.name, func(t *testing.T) {
					got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeReplace, tt.fieldName, tt.fieldValue)
					require.Equal(t, tt.want, got)
				})
			}
		})
	})
}
