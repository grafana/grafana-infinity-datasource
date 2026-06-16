package infinity

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strconv"
	"sync"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetPaginatedResultsCursorStopsWhenCursorEnds(t *testing.T) {
	// Verifies cursor pagination stops as soon as extracted endCursor becomes empty.
	var (
		mu       sync.Mutex
		requests int
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		requests++
		mu.Unlock()
		cursor := r.URL.Query().Get("cursor")
		w.Header().Set("Content-Type", "application/json")
		switch cursor {
		case "":
			_, _ = w.Write([]byte(`{"data":{"items":[{"id":1}],"pageInfo":{"endCursor":"c1"}}}`))
		case "c1":
			_, _ = w.Write([]byte(`{"data":{"items":[{"id":2}],"pageInfo":{"endCursor":"c2"}}}`))
		case "c2":
			_, _ = w.Write([]byte(`{"data":{"items":[{"id":3}],"pageInfo":{"endCursor":""}}}`))
		default:
			w.WriteHeader(http.StatusBadRequest)
			_, _ = w.Write([]byte(`{"error":"unexpected cursor"}`))
		}
	}))
	defer server.Close()

	query := models.Query{
		Type:                               models.QueryTypeGraphQL,
		Source:                             "url",
		Parser:                             models.InfinityParserBackend,
		URL:                                server.URL,
		RootSelector:                       "data.items",
		Columns:                            []models.InfinityColumn{{Text: "id", Selector: "id", Type: "number"}},
		PageMode:                           models.PaginationModeCursor,
		PageMaxPages:                       10,
		PageParamCursorFieldType:           models.PaginationParamTypeQuery,
		PageParamCursorFieldName:           "cursor",
		PageParamCursorFieldExtractionPath: "data.pageInfo.endCursor",
	}
	client := Client{Settings: models.InfinitySettings{}, HttpClient: server.Client(), IsMock: true}
	frame, err := GetPaginatedResults(context.Background(), nil, query, client, map[string]string{})
	require.NoError(t, err)
	require.NotNil(t, frame)

	mu.Lock()
	assert.Equal(t, 3, requests)
	mu.Unlock()
}

func TestGetPaginatedResultsPageModeRetriesAndSucceeds(t *testing.T) {
	// Verifies per-page retries recover from transient failures and continue pagination.
	var (
		mu          sync.Mutex
		page2Errors int
		requests    int
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		requests++
		mu.Unlock()
		page := r.URL.Query().Get("page")
		if page == "2" {
			mu.Lock()
			page2Errors++
			shouldFail := page2Errors <= pageRequestRetries
			mu.Unlock()
			if shouldFail {
				w.WriteHeader(http.StatusInternalServerError)
				_, _ = w.Write([]byte(`{"error":"temporary"}`))
				return
			}
		}
		pageNo, _ := strconv.Atoi(page)
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(fmt.Sprintf(`{"items":[{"id":%d}]}`, pageNo)))
	}))
	defer server.Close()

	query := models.Query{
		Type:                   models.QueryTypeJSON,
		Source:                 "url",
		Parser:                 models.InfinityParserBackend,
		URL:                    server.URL,
		URLOptions:             models.URLOptions{Method: http.MethodGet},
		RootSelector:           "items",
		Columns:                []models.InfinityColumn{{Text: "id", Selector: "id", Type: "number"}},
		PageMode:               models.PaginationModePage,
		PageMaxPages:           3,
		PageParamSizeFieldType: models.PaginationParamTypeQuery,
		PageParamSizeFieldName: "limit",
		PageParamSizeFieldVal:  1,
		PageParamPageFieldType: models.PaginationParamTypeQuery,
		PageParamPageFieldName: "page",
		PageParamPageFieldVal:  1,
	}
	client := Client{Settings: models.InfinitySettings{}, HttpClient: server.Client(), IsMock: true}
	frame, err := GetPaginatedResults(context.Background(), nil, query, client, map[string]string{})
	require.NoError(t, err)
	require.NotNil(t, frame)

	mu.Lock()
	assert.Equal(t, 3, page2Errors)
	assert.Equal(t, 5, requests)
	mu.Unlock()
}

func TestGetPaginatedResultsPageModeFailsAfterRetryExhaustion(t *testing.T) {
	// Verifies query fails fast when a page keeps failing after all retry attempts.
	var (
		mu          sync.Mutex
		page2Errors int
		page3Calls  int
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		page := r.URL.Query().Get("page")
		if page == "2" {
			mu.Lock()
			page2Errors++
			mu.Unlock()
			w.WriteHeader(http.StatusInternalServerError)
			_, _ = w.Write([]byte(`{"error":"permanent"}`))
			return
		}
		if page == "3" {
			mu.Lock()
			page3Calls++
			mu.Unlock()
		}
		pageNo, _ := strconv.Atoi(page)
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(fmt.Sprintf(`{"items":[{"id":%d}]}`, pageNo)))
	}))
	defer server.Close()

	query := models.Query{
		Type:                   models.QueryTypeJSON,
		Source:                 "url",
		Parser:                 models.InfinityParserBackend,
		URL:                    server.URL,
		URLOptions:             models.URLOptions{Method: http.MethodGet},
		RootSelector:           "items",
		Columns:                []models.InfinityColumn{{Text: "id", Selector: "id", Type: "number"}},
		PageMode:               models.PaginationModePage,
		PageMaxPages:           3,
		PageParamSizeFieldType: models.PaginationParamTypeQuery,
		PageParamSizeFieldName: "limit",
		PageParamSizeFieldVal:  1,
		PageParamPageFieldType: models.PaginationParamTypeQuery,
		PageParamPageFieldName: "page",
		PageParamPageFieldVal:  1,
	}
	client := Client{Settings: models.InfinitySettings{}, HttpClient: server.Client(), IsMock: true}
	frame, err := GetPaginatedResults(context.Background(), nil, query, client, map[string]string{})
	require.Error(t, err)
	require.Nil(t, frame)

	mu.Lock()
	assert.Equal(t, pageRequestRetries+1, page2Errors)
	assert.Equal(t, 0, page3Calls)
	mu.Unlock()
}

func TestGetPaginatedResultsCursorHonorsMaxPagesBoundary(t *testing.T) {
	// Verifies cursor mode never exceeds pagination_max_pages.
	var (
		mu       sync.Mutex
		requests int
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		requests++
		next := fmt.Sprintf("c%d", requests)
		mu.Unlock()
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(fmt.Sprintf(`{"data":{"items":[{"id":1}],"pageInfo":{"endCursor":"%s"}}}`, next)))
	}))
	defer server.Close()

	query := models.Query{
		Type:                               models.QueryTypeGraphQL,
		Source:                             "url",
		Parser:                             models.InfinityParserBackend,
		URL:                                server.URL,
		RootSelector:                       "data.items",
		Columns:                            []models.InfinityColumn{{Text: "id", Selector: "id", Type: "number"}},
		PageMode:                           models.PaginationModeCursor,
		PageMaxPages:                       5,
		PageParamCursorFieldType:           models.PaginationParamTypeQuery,
		PageParamCursorFieldName:           "cursor",
		PageParamCursorFieldExtractionPath: "data.pageInfo.endCursor",
	}
	client := Client{Settings: models.InfinitySettings{}, HttpClient: server.Client(), IsMock: true}
	frame, err := GetPaginatedResults(context.Background(), nil, query, client, map[string]string{})
	require.NoError(t, err)
	require.NotNil(t, frame)

	mu.Lock()
	assert.Equal(t, 5, requests)
	mu.Unlock()
}

func TestGetPaginatedResultsGraphQLCursorReplaceStartsWithNullAndStopsOnHasNextPageFalse(t *testing.T) {
	// Verifies GraphQL replace-mode sends null cursor on first request and stops when hasNextPage=false.
	type graphQLRequest struct {
		Variables map[string]any `json:"variables"`
	}
	var (
		mu                sync.Mutex
		requests          int
		firstAfterValue   any
		secondAfterValue  any
		thirdRequestCount int
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		req := graphQLRequest{}
		_ = json.Unmarshal(body, &req)
		after := req.Variables["after"]

		mu.Lock()
		requests++
		switch requests {
		case 1:
			firstAfterValue = after
		case 2:
			secondAfterValue = after
		case 3:
			thirdRequestCount++
		}
		mu.Unlock()

		w.Header().Set("Content-Type", "application/json")
		if requests == 1 {
			_, _ = w.Write([]byte(`{"data":{"search":{"edges":[{"node":{"id":1}}],"pageInfo":{"hasNextPage":true,"endCursor":"c1"}}}}`))
			return
		}
		_, _ = w.Write([]byte(`{"data":{"search":{"edges":[{"node":{"id":2}}],"pageInfo":{"hasNextPage":false,"endCursor":"c2"}}}}`))
	}))
	defer server.Close()

	query := models.Query{
		Type:   models.QueryTypeGraphQL,
		Source: "url",
		Parser: models.InfinityParserBackend,
		URL:    server.URL,
		URLOptions: models.URLOptions{
			Method:               http.MethodPost,
			BodyType:             "graphql",
			BodyGraphQLQuery:     `query($q: String!, $first: Int!, $after: String) { search(query: $q, type: REPOSITORY, first: $first, after: $after) { edges { node { id } } pageInfo { hasNextPage endCursor } } }`,
			BodyGraphQLVariables: `{ "q":"org:grafana", "first": 1, "after":"${__pagination.cursor}" }`,
		},
		RootSelector:                       "data.search.edges",
		Columns:                            []models.InfinityColumn{{Text: "id", Selector: "node.id", Type: "number"}},
		PageMode:                           models.PaginationModeCursor,
		PageMaxPages:                       10,
		PageParamCursorFieldType:           models.PaginationParamTypeReplace,
		PageParamCursorFieldName:           "cursor",
		PageParamCursorFieldExtractionPath: "data.search.pageInfo.endCursor",
	}
	client := Client{Settings: models.InfinitySettings{}, HttpClient: server.Client(), IsMock: true}
	frame, err := GetPaginatedResults(context.Background(), nil, query, client, map[string]string{})
	require.NoError(t, err)
	require.NotNil(t, frame)

	mu.Lock()
	require.Equal(t, 2, requests)
	require.Nil(t, firstAfterValue)
	require.Equal(t, "c1", secondAfterValue)
	require.Equal(t, 0, thirdRequestCount)
	mu.Unlock()
}
