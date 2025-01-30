package infinity_test

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/trace"
)

func TestGetQueryURL(t *testing.T) {
	tests := []struct {
		name          string
		settings      models.InfinitySettings
		query         models.Query
		pCtx          *backend.PluginContext
		excludeSecret bool
		want          string
	}{
		{
			settings: models.InfinitySettings{},
			query: models.Query{
				URL: "0.0.0.0",
			},
			want: "0.0.0.0",
		},
		{
			settings: models.InfinitySettings{},
			query: models.Query{
				URL: "https://foo.com?key=val",
			},
			want: "https://foo.com?key=val",
		},
		{
			settings: models.InfinitySettings{
				URL: "https://foo.com",
			},
			query: models.Query{
				URL: "/hello?key=val",
			},
			want: "https://foo.com/hello?key=val",
		},
		{
			name: "should merge all the query parameters",
			settings: models.InfinitySettings{
				URL: "https://foo.com",
			},
			query: models.Query{
				URL: "/hello?key=val10&foo=bar",
				URLOptions: models.URLOptions{
					Params: []models.URLOptionKeyValuePair{
						{Key: "key", Value: "val11"},
						{Key: "key2", Value: "value2"},
					},
				},
			},
			want: "https://foo.com/hello?foo=bar&key=val10&key=val11&key2=value2",
		},
		{
			name: "should always respect the URL in the settings",
			settings: models.InfinitySettings{
				URL: "https://one.com",
			},
			query: models.Query{
				URL: "https://two.com/hello?key=val",
			},
			want: "https://one.comhttps://two.com/hello?key=val",
		},
		{
			settings: models.InfinitySettings{
				URL: "https://foo.com",
			},
			query: models.Query{
				URL: "https://foo.com/hello?key=val",
			},
			want: "https://foo.com/hello?key=val",
		},
		{
			settings: models.InfinitySettings{
				URL: "https://foo.com",
				SecureQueryFields: map[string]string{
					"key_one": "val_one",
					"key_two": "val_two",
				},
			},
			query: models.Query{
				URL: "/hello?key=val&key_one=${__qs.key_one}&key_two=${__qs.key_two}&foo=bar",
			},
			want: "https://foo.com/hello?foo=bar&key=val&key_one=val_one&key_two=val_two",
		},
		{
			settings: models.InfinitySettings{
				URL: "https://foo.com",
				SecureQueryFields: map[string]string{
					"key_one": "val_one",
					"key_two": "val_two",
				},
			},
			query: models.Query{
				URL: "/hello?key=val&foo=bar&key_one=foo",
			},
			want: "https://foo.com/hello?foo=bar&key=val&key_one=val_one&key_two=val_two",
		},
		{
			settings: models.InfinitySettings{
				URL: "https://foo.com/${__qs.key_three}",
				SecureQueryFields: map[string]string{
					"key_one":   "val_one",
					"key_two":   "val_two",
					"key_three": "val_three",
				},
				AuthenticationMethod: "apiKey",
				ApiKeyKey:            "hello",
				ApiKeyValue:          "world",
				ApiKeyType:           "query",
			},
			query: models.Query{
				URL: "/hello?key=val&foo=bar&key_one=foo",
				URLOptions: models.URLOptions{
					Params: []models.URLOptionKeyValuePair{
						{Key: "mee", Value: "too"},
					},
				},
			},
			want: "https://foo.com/val_three/hello?foo=bar&hello=world&key=val&key_one=val_one&key_three=val_three&key_two=val_two&mee=too",
		},
		{
			settings: models.InfinitySettings{
				URL: "https://foo.com/${__qs.key_three}",
				SecureQueryFields: map[string]string{
					"key_one":   "val_one",
					"key_two":   "val_two",
					"key_three": "val_three",
				},
				AuthenticationMethod: "apiKey",
				ApiKeyKey:            "hello",
				ApiKeyValue:          "world",
				ApiKeyType:           "query",
			},
			query: models.Query{
				URL: "/hello?key=val&foo=bar&key_one=foo",
				URLOptions: models.URLOptions{
					Params: []models.URLOptionKeyValuePair{
						{Key: "mee", Value: "too"},
					},
				},
			},
			excludeSecret: true,
			want:          "https://foo.com/xxxxxxxx/hello?foo=bar&hello=xxxxxxxx&key=val&key_one=xxxxxxxx&key_three=xxxxxxxx&key_two=xxxxxxxx&mee=too",
		},
		{
			name: "should use %20 instead of ' ' for all the query parameters",
			settings: models.InfinitySettings{
				URL:                    "https://foo.com",
				PathEncodedURLsEnabled: true,
			},
			query: models.Query{
				URL: "/hello?key=val10&foo=bar",
				URLOptions: models.URLOptions{
					Params: []models.URLOptionKeyValuePair{
						{Key: "key", Value: "val11 val12"},
						{Key: "key2", Value: "value2 value3"},
					},
				},
			},
			want: "https://foo.com/hello?foo=bar&key=val10&key=val11%20val12&key2=value2%20value3",
		},
		{
			name: "do not overwrite + that isn't a space in query parameters",
			settings: models.InfinitySettings{
				URL:                    "https://foo.com",
				PathEncodedURLsEnabled: true,
			},
			query: models.Query{
				URL: "/hello?key=val10&foo=bar",
				URLOptions: models.URLOptions{
					Params: []models.URLOptionKeyValuePair{
						{Key: "key", Value: "val11 val+12"},
						{Key: "key2", Value: "value2+value3"},
					},
				},
			},
			want: "https://foo.com/hello?foo=bar&key=val10&key=val11%20val%2B12&key2=value2%2Bvalue3",
		},
		{
			name:     "should respect override from settings",
			pCtx:     &backend.PluginContext{User: &backend.User{Login: "testuser"}},
			settings: models.InfinitySettings{SecureQueryFields: map[string]string{"X-Grafana-User": "${__user.login}"}},
			query: models.Query{
				URL:        "http://foo.com",
				URLOptions: models.URLOptions{Params: []models.URLOptionKeyValuePair{{Key: "X-Grafana-User", Value: "fake-user"}}},
			},
			want: "http://foo.com?X-Grafana-User=testuser",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			u, err := infinity.GetQueryURL(context.TODO(), tt.pCtx, tt.settings, tt.query, !tt.excludeSecret)
			assert.Equal(t, err, nil)
			assert.Equal(t, tt.want, u)
		})
	}
}

func TestClient_GetExecutedURL(t *testing.T) {
	tests := []struct {
		name     string
		settings models.InfinitySettings
		url      string
		command  string
		query    models.Query
	}{
		{
			query:   models.Query{URL: "https://foo.com"},
			url:     "https://foo.com",
			command: "curl -X 'GET' -H 'Accept-Encoding: gzip' 'https://foo.com'",
		},
		{
			settings: models.InfinitySettings{UserName: "hello", Password: "world", BasicAuthEnabled: true},
			query:    models.Query{URL: "https://foo.com"},
			url:      "https://foo.com",
			command:  "curl -X 'GET' -H 'Accept-Encoding: gzip' -H 'Authorization: Basic xxxxxxxx' 'https://foo.com'",
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: "bearerToken", BearerToken: "world2"},
			query:    models.Query{URL: "https://foo.com"},
			url:      "https://foo.com",
			command:  "curl -X 'GET' -H 'Accept-Encoding: gzip' -H 'Authorization: Bearer xxxxxxxx' 'https://foo.com'",
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: "apiKey", ApiKeyType: "header", ApiKeyKey: "hello", ApiKeyValue: "world"},
			query:    models.Query{URL: "https://foo.com"},
			url:      "https://foo.com",
			command:  "curl -X 'GET' -H 'Accept-Encoding: gzip' -H 'Hello: xxxxxxxx' 'https://foo.com'",
		},
		{
			settings: models.InfinitySettings{ForwardOauthIdentity: true},
			query:    models.Query{URL: "https://foo.com"},
			url:      "https://foo.com",
			command:  "curl -X 'GET' -H 'Accept-Encoding: gzip' -H 'Authorization: xxxxxxxx' 'https://foo.com'",
		},
		{
			settings: models.InfinitySettings{CustomHeaders: map[string]string{"good": "bye"}, SecureQueryFields: map[string]string{"me": "too"}},
			query:    models.Query{URL: "https://foo.com?something=${__qs.me}", Type: "json", URLOptions: models.URLOptions{Method: "POST", Body: "my request body with ${__qs.me} value", Headers: []models.URLOptionKeyValuePair{{Key: "hello", Value: "world"}}}},
			url:      "https://foo.com?me=xxxxxxxx&something=xxxxxxxx",
			command:  "curl -X 'POST' -d 'my request body with ${__qs.me} value' -H 'Accept: application/json;q=0.9,text/plain' -H 'Accept-Encoding: gzip' -H 'Content-Type: application/json' -H 'Good: xxxxxxxx' -H 'Hello: xxxxxxxx' 'https://foo.com?me=xxxxxxxx&something=xxxxxxxx'",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := &infinity.Client{Settings: tt.settings}
			got := client.GetExecutedURL(context.TODO(), tt.query)
			assert.Equal(t, fmt.Sprintf("###############\n## URL\n###############\n\n%s\n\n###############\n## Curl Command\n###############\n\n%s", tt.url, tt.command), got)
		})
	}
}

func TestNormalizeURL(t *testing.T) {
	tests := []struct {
		name string
		u    string
		want string
	}{
		{u: "https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.csv", want: "https://raw.githubusercontent.com/grafana/grafana-infinity-datasource/main/testdata/users.csv"},
		{u: "https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/blob/users.csv", want: "https://raw.githubusercontent.com/grafana/grafana-infinity-datasource/main/testdata/blob/users.csv"},
		{u: "https://raw.githubusercontent.com/grafana/grafana-infinity-datasource/main/testdata/users.csv", want: "https://raw.githubusercontent.com/grafana/grafana-infinity-datasource/main/testdata/users.csv"},
		{u: "https://foo.com/channels/38629/feed.json", want: "https://foo.com/channels/38629/feed.json"},
		{u: "https://gitlab.com/restcountries/restcountries/-/blob/master/src/main/resources/countriesV3.json", want: "https://gitlab.com/restcountries/restcountries/-/raw/master/src/main/resources/countriesV3.json"},
		{u: "https://gitlab.com/api/v4/projects", want: "https://gitlab.com/api/v4/projects"},
		{u: "https://bitbucket.org/yesoreyeram/test_repo/src/master/data/countries.json", want: "https://bitbucket.org/yesoreyeram/test_repo/raw/master/data/countries.json"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			require.Equal(t, tt.want, infinity.NormalizeURL(tt.u))
		})
	}
}

func TestGetRequest(t *testing.T) {
	tests := []struct {
		name           string
		pCtx           *backend.PluginContext
		settings       models.InfinitySettings
		body           io.Reader
		query          models.Query
		requestHeaders map[string]string
		wantReq        http.Request
		wantErr        error
	}{
		{
			name:    "shouldn't interpolate grafana values from query",
			pCtx:    &backend.PluginContext{PluginID: "hello"},
			query:   models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "Something", Value: "${__plugin.id"}}}},
			wantReq: http.Request{Header: http.Header{"Something": []string{"${__plugin.id"}}},
		},
		{
			name:     "should forward grafana headers correctly when set in the custom header settings",
			pCtx:     &backend.PluginContext{PluginID: "hello"},
			settings: models.InfinitySettings{CustomHeaders: map[string]string{"Something": "${__plugin.id}"}},
			wantReq:  http.Request{Header: http.Header{"Something": []string{"hello"}}},
		},
		{
			name:     "should override values from settings compared to query",
			pCtx:     &backend.PluginContext{PluginID: "hello"},
			query:    models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "Something", Value: "Some Value"}}}},
			settings: models.InfinitySettings{CustomHeaders: map[string]string{"Something": "${__plugin.id}"}},
			wantReq:  http.Request{Header: http.Header{"Something": []string{"hello"}}},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotReq, err := infinity.GetRequest(context.TODO(), tt.pCtx, tt.settings, tt.body, tt.query, tt.requestHeaders, true)
			if tt.wantErr != nil {
				require.NotNil(t, err)
				assert.Equal(t, tt.wantErr, err)
				return
			}
			require.NotNil(t, gotReq)
			numberOfAdditionalHeaders := 1 // with gzip compression enabled, there will be additional header at run time.
			assert.Equal(t, len(tt.wantReq.Header)+numberOfAdditionalHeaders, len(gotReq.Header))
			for k := range tt.wantReq.Header {
				require.Equal(t, tt.wantReq.Header.Get(k), gotReq.Header.Get(k))
			}
		})
	}
}

const (
	traceIDStr = "4bf92f3577b34da6a3ce929d0e0e4736"
	spanIDStr  = "00f067aa0ba902b7"
)

var (
	traceID = mustTraceIDFromHex(traceIDStr)
	spanID  = mustSpanIDFromHex(spanIDStr)
)

func mustTraceIDFromHex(s string) (t trace.TraceID) {
	var err error
	t, err = trace.TraceIDFromHex(s)
	if err != nil {
		panic(err)
	}
	return
}

func mustSpanIDFromHex(s string) (t trace.SpanID) {
	var err error
	t, err = trace.SpanIDFromHex(s)
	if err != nil {
		panic(err)
	}
	return
}

func TestInjectTrace(t *testing.T) {
	tests := []struct {
		name   string
		sc     trace.SpanContext
		before func()
	}{
		{
			name:   "empty propagation",
			before: func() {},
			sc:     trace.NewSpanContext(trace.SpanContextConfig{}),
		},

		{
			name: "inject trace",
			before: func() {
				otel.SetTextMapPropagator(propagation.TraceContext{})
			},
			sc: trace.NewSpanContext(trace.SpanContextConfig{
				TraceID: traceID,
				SpanID:  spanID,
				Remote:  true,
			}),
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			test.before()
			ctx := trace.ContextWithRemoteSpanContext(context.Background(), test.sc)
			req, _ := http.NewRequest(http.MethodGet, "https://github.com/grafana", nil)
			req = infinity.ApplyTraceHead(ctx, req)
			if test.sc.HasTraceID() {
				newCtx := otel.GetTextMapPropagator().Extract(context.Background(), propagation.HeaderCarrier(req.Header))
				require.Equal(t, test.sc.TraceID(), trace.SpanFromContext(newCtx).SpanContext().TraceID())
			}
		})
	}
}
