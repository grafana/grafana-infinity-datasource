package infinity_test

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/require"
)

// newPaginationServer serves a JSON body keyed by the value of the given
// query parameter. Unknown values return an empty array.
func newPaginationServer(t *testing.T, key string, pages map[string]string, hits *int32) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		atomic.AddInt32(hits, 1)
		body, ok := pages[r.URL.Query().Get(key)]
		if !ok {
			body = "[]"
		}
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, body)
	}))
}

func newPaginationQuery(url string) models.Query {
	return models.Query{
		Type:                   models.QueryTypeJSON,
		Source:                 "url",
		Parser:                 models.InfinityParserBackend,
		URL:                    url,
		PageMaxPages:           5,
		PageParamSizeFieldName: "limit",
		PageParamSizeFieldType: models.PaginationParamTypeQuery,
		PageParamSizeFieldVal:  2,
	}
}

func getPaginatedRows(t *testing.T, q models.Query, srv *httptest.Server) (int, error) {
	t.Helper()
	client := infinity.Client{Settings: models.InfinitySettings{}, HttpClient: srv.Client()}
	frame, err := infinity.GetPaginatedResults(context.Background(), &backend.PluginContext{}, q, client, nil)
	if err != nil {
		return 0, err
	}
	return frame.Rows(), nil
}

func TestGetPaginatedResults_EmptyAndShortPages(t *testing.T) {
	t.Run("offset mode stops after a page shorter than the page size", func(t *testing.T) {
		var hits int32
		srv := newPaginationServer(t, "offset", map[string]string{
			"0": `[{"id":1},{"id":2}]`,
			"2": `[{"id":3}]`,
			"4": `[{"id":99}]`, // must never be requested
		}, &hits)
		defer srv.Close()
		q := newPaginationQuery(srv.URL)
		q.PageMode = models.PaginationModeOffset
		q.PageParamOffsetFieldName = "offset"
		q.PageParamOffsetFieldType = models.PaginationParamTypeQuery
		rows, err := getPaginatedRows(t, q, srv)
		require.NoError(t, err)
		require.Equal(t, 3, rows)
		require.Equal(t, int32(2), hits)
	})
	t.Run("offset mode drops an empty page after data and stops fetching", func(t *testing.T) {
		var hits int32
		srv := newPaginationServer(t, "offset", map[string]string{
			"0": `[{"id":1},{"id":2}]`,
			"2": `[{"id":3},{"id":4}]`,
			// offset 4 returns []
			"6": `[{"id":99}]`, // must never be requested
		}, &hits)
		defer srv.Close()
		q := newPaginationQuery(srv.URL)
		q.PageMode = models.PaginationModeOffset
		q.PageParamOffsetFieldName = "offset"
		q.PageParamOffsetFieldType = models.PaginationParamTypeQuery
		rows, err := getPaginatedRows(t, q, srv)
		require.NoError(t, err)
		require.Equal(t, 4, rows)
		require.Equal(t, int32(3), hits)
	})
	t.Run("page mode returns an empty result without error when the first page is empty", func(t *testing.T) {
		var hits int32
		srv := newPaginationServer(t, "page", map[string]string{}, &hits)
		defer srv.Close()
		q := newPaginationQuery(srv.URL)
		q.PageMode = models.PaginationModePage
		q.PageParamPageFieldName = "page"
		q.PageParamPageFieldType = models.PaginationParamTypeQuery
		rows, err := getPaginatedRows(t, q, srv)
		require.NoError(t, err)
		require.Equal(t, 0, rows)
		require.Equal(t, int32(1), hits)
	})
	t.Run("cursor mode drops an empty page after data and stops fetching", func(t *testing.T) {
		var hits int32
		srv := newPaginationServer(t, "cursor", map[string]string{
			"":    `{"next":"abc","items":[{"id":1},{"id":2}]}`,
			"abc": `{"next":"def","items":[]}`,
			"def": `{"next":"","items":[{"id":99}]}`, // must never be requested
		}, &hits)
		defer srv.Close()
		q := newPaginationQuery(srv.URL)
		q.PageMode = models.PaginationModeCursor
		q.PageParamCursorFieldName = "cursor"
		q.PageParamCursorFieldType = models.PaginationParamTypeQuery
		q.PageParamCursorFieldExtractionPath = "next"
		q.RootSelector = "items"
		rows, err := getPaginatedRows(t, q, srv)
		require.NoError(t, err)
		require.Equal(t, 2, rows)
		require.Equal(t, int32(2), hits)
	})
}
