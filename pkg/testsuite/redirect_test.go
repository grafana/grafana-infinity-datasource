package testsuite_test

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

func TestRedirectsAreRestrictedToAllowedHosts(t *testing.T) {
	var outsideHits atomic.Int32
	var leakedKey atomic.Value
	outside := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		outsideHits.Add(1)
		leakedKey.Store(r.Header.Get("X-Api-Key"))
		_, _ = fmt.Fprint(w, `{"secret":"outside"}`)
	}))
	defer outside.Close()
	allowedB := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = fmt.Fprint(w, `{"message":"B"}`)
	}))
	defer allowedB.Close()
	allowedA := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/to-outside":
			http.Redirect(w, r, outside.URL+"/secret", http.StatusFound)
		case "/to-allowed":
			http.Redirect(w, r, allowedB.URL+"/ok", http.StatusFound)
		case "/loop":
			http.Redirect(w, r, "/loop", http.StatusFound)
		default:
			_, _ = fmt.Fprint(w, `{"message":"A"}`)
		}
	}))
	defer allowedA.Close()

	run := func(t *testing.T, settings models.InfinitySettings, path string) backend.DataResponse {
		t.Helper()
		settings.AuthenticationMethod = models.AuthenticationMethodApiKey
		settings.ApiKeyType = models.ApiKeyTypeHeader
		settings.ApiKeyKey = "X-Api-Key"
		settings.ApiKeyValue = "stored-secret"
		client, err := infinity.NewClient(context.Background(), settings)
		require.NoError(t, err)
		return queryData(t, context.Background(), backend.DataQuery{
			JSON: []byte(fmt.Sprintf(`{"type":"json","url":"%s","source":"url"}`, allowedA.URL+path)),
		}, *client, map[string]string{}, backend.PluginContext{})
	}

	t.Run("redirect to a host outside allowed hosts is blocked and sends no credentials", func(t *testing.T) {
		res := run(t, models.InfinitySettings{AllowedHosts: []string{allowedA.URL}}, "/to-outside")
		require.Error(t, res.Error)
		require.ErrorContains(t, res.Error, models.ErrInvalidConfigHostNotAllowed.Error())
		require.Zero(t, outsideHits.Load())
	})
	t.Run("redirect to another allowed host is followed", func(t *testing.T) {
		res := run(t, models.InfinitySettings{AllowedHosts: []string{allowedA.URL, allowedB.URL}}, "/to-allowed")
		require.NoError(t, res.Error)
		require.NotEmpty(t, res.Frames)
	})
	t.Run("redirect outside the base URL origin is blocked", func(t *testing.T) {
		res := run(t, models.InfinitySettings{URL: allowedA.URL, AllowedHosts: []string{allowedA.URL, outside.URL}}, "/to-outside")
		require.Error(t, res.Error)
		require.ErrorContains(t, res.Error, models.ErrQueryURLNotAllowedByBaseURL.Error())
		require.Zero(t, outsideHits.Load())
	})
	t.Run("redirect loops are stopped", func(t *testing.T) {
		res := run(t, models.InfinitySettings{AllowedHosts: []string{allowedA.URL}}, "/loop")
		require.Error(t, res.Error)
	})
}
