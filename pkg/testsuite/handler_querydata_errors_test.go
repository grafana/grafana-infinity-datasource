package testsuite_test

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/infinity-libs/lib/go/jsonframer"
	"github.com/stretchr/testify/require"
)

func TestErrors(t *testing.T) {
	t.Run("remote url query", func(t *testing.T) {
		t.Run("succeed with invalid server response", func(t *testing.T) {
			server := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				_, _ = w.Write([]byte(`{}`))
			}))
			server.Start()
			defer server.Close()
			client, _ := infinity.NewClient(context.TODO(), models.InfinitySettings{})
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{ "url":  "%s" }`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.Nil(t, res.Error)
			require.Equal(t, backend.ErrorSource(""), res.ErrorSource)
		})
		t.Run("fail with invalid server response", func(t *testing.T) {
			server := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusForbidden)
			}))
			server.Start()
			defer server.Close()
			client, _ := infinity.NewClient(context.TODO(), models.InfinitySettings{})
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{ "url":  "%s" }`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res.Error)
			require.Equal(t, backend.ErrorSourceDownstream, res.ErrorSource)
			require.ErrorIs(t, res.Error, models.ErrUnsuccessfulHTTPResponseStatus)
			require.Equal(t, "error while performing the infinity query. unsuccessful HTTP response. 403 Forbidden", res.Error.Error())
		})
		t.Run("fail with incorrect response from server", func(t *testing.T) {
			server := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				_, _ = w.Write([]byte(`{`))
			}))
			server.Start()
			defer server.Close()
			client, _ := infinity.NewClient(context.TODO(), models.InfinitySettings{})
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{ "url":  "%s" }`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res.Error)
			require.Equal(t, backend.ErrorSourceDownstream, res.ErrorSource)
			require.ErrorIs(t, res.Error, models.ErrParsingResponseBodyAsJson)
			require.Equal(t, "error while performing the infinity query. unable to parse response body as JSON. unexpected end of JSON input", res.Error.Error())
		})
		t.Run("fail with incorrect JSONata", func(t *testing.T) {
			server := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				_, _ = w.Write([]byte(`{}`))
			}))
			server.Start()
			defer server.Close()
			client, _ := infinity.NewClient(context.TODO(), models.InfinitySettings{})
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{ "url":  "%s", "parser": "backend", "root_selector": "foo bar baz"}`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res.Error)
			require.Equal(t, backend.ErrorSourceDownstream, res.ErrorSource)
			require.ErrorIs(t, res.Error, jsonframer.ErrInvalidRootSelector)
			require.Equal(t, "error while performing the infinity query. error converting json data to frame: failed to compile JSONata expression\nsyntax error: 'bar', position: 4", res.Error.Error())
		})
	})
}
