package infinity_test

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/require"
)

func TestRedirectCredentialsAndMethods(t *testing.T) {
	for _, auth := range []string{models.AuthenticationMethodApiKey, models.AuthenticationMethodAWS} {
		for _, status := range []int{301, 302, 303, 307, 308} {
			for _, allowed := range []bool{false, true} {
				t.Run(fmt.Sprintf("%s/%d/allowed=%t", auth, status, allowed), func(t *testing.T) {
					type receivedRequest struct{ method, body, key, signature string }
					received := make(chan receivedRequest, 1)
					target := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
						body, _ := io.ReadAll(r.Body)
						received <- receivedRequest{r.Method, string(body), r.Header.Get("X-Api-Key"), r.Header.Get("Authorization")}
						_, _ = io.WriteString(w, `{"ok":true}`)
					}))
					defer target.Close()
					firstSignature := make(chan string, 1)
					initial := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
						firstSignature <- r.Header.Get("Authorization")
						http.Redirect(w, r, target.URL+"/final?secret=redirect-canary", status)
					}))
					defer initial.Close()
					settings := models.InfinitySettings{
						AuthenticationMethod: auth, AllowedHosts: []string{initial.URL},
						ApiKeyType: models.ApiKeyTypeHeader, ApiKeyKey: "X-Api-Key", ApiKeyValue: "stored-secret",
						AWSAccessKey: "test-access-key", AWSSecretKey: "test-secret-key",
						AWSSettings: models.AWSSettings{AuthType: models.AWSAuthTypeKeys, Region: "us-east-2", Service: "monitoring"},
						ProxyType:   models.ProxyTypeNone, TimeoutInSeconds: 5,
					}
					if allowed {
						settings.AllowedHosts = append(settings.AllowedHosts, target.URL)
					}
					client, err := infinity.NewClient(context.Background(), settings)
					require.NoError(t, err)
					defer client.HttpClient.CloseIdleConnections()
					_, code, _, err := client.GetResults(context.Background(), &backend.PluginContext{}, models.Query{
						URL: initial.URL + "/start", Type: models.QueryTypeJSON,
						URLOptions: models.URLOptions{Method: http.MethodPost, BodyType: "raw", Body: "request-body"},
					}, nil)
					if !allowed {
						require.ErrorIs(t, err, models.ErrInvalidConfigHostNotAllowed)
						require.NotContains(t, err.Error(), "redirect-canary")
						require.Equal(t, http.StatusUnauthorized, code)
						require.Empty(t, received, "blocked destination must receive no request or credentials")
						return
					}
					require.NoError(t, err)
					require.Equal(t, http.StatusOK, code)
					require.Len(t, received, 1)
					r := <-received
					if status == 307 || status == 308 {
						require.Equal(t, http.MethodPost, r.method)
						require.Equal(t, "request-body", r.body)
					} else {
						require.Equal(t, http.MethodGet, r.method)
						require.Empty(t, r.body)
					}
					if auth == models.AuthenticationMethodAWS {
						signature := <-firstSignature
						require.True(t, strings.HasPrefix(r.signature, "AWS4-HMAC-SHA256 "))
						require.True(t, strings.HasPrefix(signature, "AWS4-HMAC-SHA256 "))
						require.NotEqual(t, signature, r.signature, "each destination must be signed again")
					} else {
						require.Equal(t, "stored-secret", r.key)
					}
				})
			}
		}
	}
}

func TestRedirectBaseOnlyAndMultipleHops(t *testing.T) {
	var outsideHits atomic.Int32
	outside := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		outsideHits.Add(1)
		_, _ = io.WriteString(w, `{"ok":true}`)
	}))
	defer outside.Close()
	middle := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, outside.URL+"/final?secret=redirect-canary", http.StatusFound)
	}))
	defer middle.Close()
	initial := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/relative":
			http.Redirect(w, r, "/ok", http.StatusFound)
		case "/outside":
			http.Redirect(w, r, outside.URL+"/final?secret=redirect-canary", http.StatusFound)
		case "/multi":
			http.Redirect(w, r, middle.URL, http.StatusFound)
		case "/loop":
			http.Redirect(w, r, "/loop", http.StatusFound)
		case "/restricted/start":
			http.Redirect(w, r, "/ok", http.StatusFound)
		default:
			_, _ = io.WriteString(w, `{"ok":true}`)
		}
	}))
	defer initial.Close()
	for _, tt := range []struct {
		name, path string
		settings   models.InfinitySettings
		wantErr    error
		loop       bool
	}{
		{name: "base only follows same-origin relative redirects", path: "/relative", settings: models.InfinitySettings{URL: initial.URL}},
		{name: "base only blocks a different port", path: "/outside", settings: models.InfinitySettings{URL: initial.URL}, wantErr: models.ErrQueryURLNotAllowedByBaseURL},
		{name: "allowlist cannot override base", path: "/outside", settings: models.InfinitySettings{URL: initial.URL, AllowedHosts: []string{initial.URL, outside.URL}}, wantErr: models.ErrQueryURLNotAllowedByBaseURL},
		{name: "second redirect is checked", path: "/multi", settings: models.InfinitySettings{AllowedHosts: []string{initial.URL, middle.URL}}, wantErr: models.ErrInvalidConfigHostNotAllowed},
		{name: "same-origin allowlist path restriction remains enforced", path: "/restricted/start", settings: models.InfinitySettings{AllowedHosts: []string{initial.URL + "/restricted/"}}, wantErr: models.ErrInvalidConfigHostNotAllowed},
		{name: "default redirect limit is retained", path: "/loop", settings: models.InfinitySettings{URL: initial.URL}, loop: true},
	} {
		t.Run(tt.name, func(t *testing.T) {
			tt.settings.TimeoutInSeconds = 5
			client, err := infinity.NewClient(context.Background(), tt.settings)
			require.NoError(t, err)
			defer client.HttpClient.CloseIdleConnections()
			if tt.loop {
				req, err := http.NewRequest(http.MethodGet, initial.URL+tt.path, nil)
				require.NoError(t, err)
				res, err := client.HttpClient.Do(req)
				if res != nil {
					_ = res.Body.Close()
				}
				require.ErrorContains(t, err, "stopped after 10 redirects")
				return
			}
			_, _, _, err = client.GetResults(context.Background(), &backend.PluginContext{}, models.Query{URL: initial.URL + tt.path, Type: models.QueryTypeJSON}, nil)
			switch {
			case tt.wantErr != nil:
				require.ErrorIs(t, err, tt.wantErr)
				require.NotContains(t, err.Error(), "redirect-canary")
			default:
				require.NoError(t, err)
			}
			require.Zero(t, outsideHits.Load())
		})
	}
}

func TestAllowedHostsRejectPortPrefixCollision(t *testing.T) {
	for _, tt := range []struct {
		url     string
		allowed []string
		want    bool
	}{
		{"http://example.test:800/path", []string{"http://example.test:800"}, true},
		{"http://example.test:8000/path", []string{"http://example.test:800"}, false},
		{"http://example.test:8000/path", []string{"http://example.test"}, false},
		{"https://example.test:443/path", []string{"https://example.test"}, true},
		{"http://example.test.other/path", []string{"http://example.test"}, false},
		{"http://example.test@other.test/path", []string{"http://example.test"}, false},
		{"http://example.test/api/users", []string{"http://example.test/api/"}, true},
		{"http://example.test/other", []string{"http://example.test/api/"}, false},
	} {
		t.Run(tt.url+"/"+tt.allowed[0], func(t *testing.T) {
			require.Equal(t, tt.want, infinity.CanAllowURL(tt.url, tt.allowed))
		})
	}
}
