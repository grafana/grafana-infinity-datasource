package testsuite_test

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/require"
)

func TestPagePaginationInitialPage(t *testing.T) {
	run := func(t *testing.T, pageValueJSON string) []string {
		t.Helper()
		var mu sync.Mutex
		pages := []string{}
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			mu.Lock()
			pages = append(pages, r.URL.Query().Get("page"))
			mu.Unlock()
			_, _ = fmt.Fprintf(w, `[{"page":"%s"}]`, r.URL.Query().Get("page"))
		}))
		defer server.Close()
		client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{AllowedHosts: []string{server.URL}})
		require.Nil(t, err)
		res := queryData(t, context.Background(), backend.DataQuery{
			JSON: []byte(fmt.Sprintf(`{
				"type": "json",
				"source": "url",
				"parser": "backend",
				"url": "%s",
				"pagination_mode": "page",
				"pagination_max_pages": 3%s
			}`, server.URL, pageValueJSON)),
		}, *client, map[string]string{}, backend.PluginContext{})
		require.Nil(t, res.Error)
		mu.Lock()
		defer mu.Unlock()
		return pages
	}
	t.Run("should start from page 0 when the initial page is explicitly 0", func(t *testing.T) {
		require.ElementsMatch(t, []string{"0", "1", "2"}, run(t, `, "pagination_param_page_value": 0`))
	})
	t.Run("should start from page 1 when the initial page is not set", func(t *testing.T) {
		require.ElementsMatch(t, []string{"1", "2", "3"}, run(t, ``))
	})
	t.Run("should start from the given initial page", func(t *testing.T) {
		require.ElementsMatch(t, []string{"5", "6", "7"}, run(t, `, "pagination_param_page_value": 5`))
	})
}
