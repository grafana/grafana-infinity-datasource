package infinity_test

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_getQueryURL(t *testing.T) {
	tests := []struct {
		name          string
		settings      models.InfinitySettings
		query         models.Query
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
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			u, err := infinity.GetQueryURL(context.TODO(), tt.settings, tt.query, !tt.excludeSecret)
			assert.Equal(t, err, nil)
			assert.Equal(t, tt.want, u)
		})
	}
}

func Test_ApplyGrafanaHeaders(t *testing.T) {
	tests := []struct {
		name           string
		settings       models.InfinitySettings
		requestHeaders map[string]string
		want           map[string]string
	}{
		{
			name: "should set both headers when enabled and headers exist",
			settings: models.InfinitySettings{
				SendUserHeader:         true,
				SendDatasourceIDHeader: true,
			},
			requestHeaders: map[string]string{
				"X-Grafana-User":          "testuser",
				"X-Grafana-Datasource-Id": "123",
			},
			want: map[string]string{
				"X-Grafana-User":          "testuser",
				"X-Grafana-Datasource-Id": "123",
			},
		},
		{
			name: "should not set headers when disabled",
			settings: models.InfinitySettings{
				SendUserHeader:         false,
				SendDatasourceIDHeader: false,
			},
			requestHeaders: map[string]string{
				"X-Grafana-User":          "testuser",
				"X-Grafana-Datasource-Id": "123",
			},
			want: map[string]string{},
		},
		{
			name: "should not set headers when enabled but headers don't exist",
			settings: models.InfinitySettings{
				SendUserHeader:         true,
				SendDatasourceIDHeader: true,
			},
			requestHeaders: map[string]string{},
			want:           map[string]string{},
		},
		{
			name: "should set only user header when only user header is enabled",
			settings: models.InfinitySettings{
				SendUserHeader:         true,
				SendDatasourceIDHeader: false,
			},
			requestHeaders: map[string]string{
				"X-Grafana-User":          "testuser",
				"X-Grafana-Datasource-Id": "123",
			},
			want: map[string]string{
				"X-Grafana-User": "testuser",
			},
		},
		{
			name: "should set only datasource ID header when only datasource ID header is enabled",
			settings: models.InfinitySettings{
				SendUserHeader:         false,
				SendDatasourceIDHeader: true,
			},
			requestHeaders: map[string]string{
				"X-Grafana-User":          "testuser",
				"X-Grafana-Datasource-Id": "123",
			},
			want: map[string]string{
				"X-Grafana-Datasource-Id": "123",
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "http://example.com", nil)
			req = infinity.ApplyGrafanaHeaders(tt.requestHeaders, tt.settings, req)

			// Check if headers match expected values
			for key, value := range tt.want {
				assert.Equal(t, value, req.Header.Get(key))
			}

			// Check if no extra headers were set
			for key := range req.Header {
				_, exists := tt.want[key]
				assert.True(t, exists, "Unexpected header found: %s", key)
			}
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
			command: "curl -X 'GET' 'https://foo.com'",
		},
		{
			settings: models.InfinitySettings{UserName: "hello", Password: "world", BasicAuthEnabled: true},
			query:    models.Query{URL: "https://foo.com"},
			url:      "https://foo.com",
			command:  "curl -X 'GET' -H 'Authorization: Basic xxxxxxxx' 'https://foo.com'",
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: "bearerToken", BearerToken: "world2"},
			query:    models.Query{URL: "https://foo.com"},
			url:      "https://foo.com",
			command:  "curl -X 'GET' -H 'Authorization: Bearer xxxxxxxx' 'https://foo.com'",
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: "apiKey", ApiKeyType: "header", ApiKeyKey: "hello", ApiKeyValue: "world"},
			query:    models.Query{URL: "https://foo.com"},
			url:      "https://foo.com",
			command:  "curl -X 'GET' -H 'Hello: xxxxxxxx' 'https://foo.com'",
		},
		{
			settings: models.InfinitySettings{ForwardOauthIdentity: true},
			query:    models.Query{URL: "https://foo.com"},
			url:      "https://foo.com",
			command:  "curl -X 'GET' -H 'Authorization: xxxxxxxx' 'https://foo.com'",
		},
		{
			settings: models.InfinitySettings{CustomHeaders: map[string]string{"good": "bye"}, SecureQueryFields: map[string]string{"me": "too"}},
			query:    models.Query{URL: "https://foo.com?something=${__qs.me}", Type: "json", URLOptions: models.URLOptions{Method: "POST", Body: "my request body with ${__qs.me} value", Headers: []models.URLOptionKeyValuePair{{Key: "hello", Value: "world"}}}},
			url:      "https://foo.com?me=xxxxxxxx&something=xxxxxxxx",
			command:  "curl -X 'POST' -d 'my request body with ${__qs.me} value' -H 'Accept: application/json;q=0.9,text/plain' -H 'Content-Type: application/json' -H 'Good: xxxxxxxx' -H 'Hello: xxxxxxxx' 'https://foo.com?me=xxxxxxxx&something=xxxxxxxx'",
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
