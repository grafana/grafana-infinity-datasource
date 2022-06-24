package infinity_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	infinity "github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
	settingsSrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/settings"
)

func Test_getQueryURL(t *testing.T) {
	tests := []struct {
		name          string
		settings      settingsSrv.InfinitySettings
		query         querySrv.Query
		excludeSecret bool
		want          string
	}{
		{
			settings: settingsSrv.InfinitySettings{},
			query: querySrv.Query{
				URL: "0.0.0.0",
			},
			want: "0.0.0.0",
		},
		{
			settings: settingsSrv.InfinitySettings{},
			query: querySrv.Query{
				URL: "https://foo.com?key=val",
			},
			want: "https://foo.com?key=val",
		},
		{
			settings: settingsSrv.InfinitySettings{
				URL: "https://foo.com",
			},
			query: querySrv.Query{
				URL: "/hello?key=val",
			},
			want: "https://foo.com/hello?key=val",
		},
		{
			name: "should merge all the query parameters",
			settings: settingsSrv.InfinitySettings{
				URL: "https://foo.com",
			},
			query: querySrv.Query{
				URL: "/hello?key=val10&foo=bar",
				URLOptions: querySrv.URLOptions{
					Params: []querySrv.URLOptionKeyValuePair{
						{Key: "key", Value: "val11"},
						{Key: "key2", Value: "value2"},
					},
				},
			},
			want: "https://foo.com/hello?foo=bar&key=val10&key=val11&key2=value2",
		},
		{
			name: "should always respect the URL in the settings",
			settings: settingsSrv.InfinitySettings{
				URL: "https://one.com",
			},
			query: querySrv.Query{
				URL: "https://two.com/hello?key=val",
			},
			want: "https://one.comhttps://two.com/hello?key=val",
		},
		{
			settings: settingsSrv.InfinitySettings{
				URL: "https://foo.com",
			},
			query: querySrv.Query{
				URL: "https://foo.com/hello?key=val",
			},
			want: "https://foo.com/hello?key=val",
		},
		{
			settings: settingsSrv.InfinitySettings{
				URL: "https://foo.com",
				SecureQueryFields: map[string]string{
					"key_one": "val_one",
					"key_two": "val_two",
				},
			},
			query: querySrv.Query{
				URL: "/hello?key=val&key_one=${__qs.key_one}&key_two=${__qs.key_two}&foo=bar",
			},
			want: "https://foo.com/hello?foo=bar&key=val&key_one=val_one&key_two=val_two",
		},
		{
			settings: settingsSrv.InfinitySettings{
				URL: "https://foo.com",
				SecureQueryFields: map[string]string{
					"key_one": "val_one",
					"key_two": "val_two",
				},
			},
			query: querySrv.Query{
				URL: "/hello?key=val&foo=bar&key_one=foo",
			},
			want: "https://foo.com/hello?foo=bar&key=val&key_one=val_one&key_two=val_two",
		},
		{
			settings: settingsSrv.InfinitySettings{
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
			query: querySrv.Query{
				URL: "/hello?key=val&foo=bar&key_one=foo",
				URLOptions: querySrv.URLOptions{
					Params: []querySrv.URLOptionKeyValuePair{
						{Key: "mee", Value: "too"},
					},
				},
			},
			want: "https://foo.com/val_three/hello?foo=bar&hello=world&key=val&key_one=val_one&key_three=val_three&key_two=val_two&mee=too",
		},
		{
			settings: settingsSrv.InfinitySettings{
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
			query: querySrv.Query{
				URL: "/hello?key=val&foo=bar&key_one=foo",
				URLOptions: querySrv.URLOptions{
					Params: []querySrv.URLOptionKeyValuePair{
						{Key: "mee", Value: "too"},
					},
				},
			},
			excludeSecret: true,
			want:          "https://foo.com/xxxxxxxx/hello?foo=bar&hello=xxxxxxxx&key=val&key_one=xxxxxxxx&key_three=xxxxxxxx&key_two=xxxxxxxx&mee=too",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			u, err := infinity.GetQueryURL(tt.settings, tt.query, !tt.excludeSecret)
			assert.Equal(t, err, nil)
			assert.Equal(t, tt.want, u)
		})
	}
}
func TestClient_GetExecutedURL(t *testing.T) {
	tests := []struct {
		name     string
		settings settingsSrv.InfinitySettings
		url      string
		command  string
		query    querySrv.Query
	}{
		{
			query:   querySrv.Query{URL: "https://foo.com"},
			url:     "https://foo.com",
			command: "curl -X 'GET' 'https://foo.com'",
		},
		{
			settings: settingsSrv.InfinitySettings{UserName: "hello", Password: "world", BasicAuthEnabled: true},
			query:    querySrv.Query{URL: "https://foo.com"},
			url:      "https://foo.com",
			command:  "curl -X 'GET' -H 'Authorization: Basic xxxxxxxx' 'https://foo.com'",
		},
		{
			settings: settingsSrv.InfinitySettings{AuthenticationMethod: "bearerToken", BearerToken: "world2"},
			query:    querySrv.Query{URL: "https://foo.com"},
			url:      "https://foo.com",
			command:  "curl -X 'GET' -H 'Authorization: Bearer xxxxxxxx' 'https://foo.com'",
		},
		{
			settings: settingsSrv.InfinitySettings{AuthenticationMethod: "apiKey", ApiKeyType: "header", ApiKeyKey: "hello", ApiKeyValue: "world"},
			query:    querySrv.Query{URL: "https://foo.com"},
			url:      "https://foo.com",
			command:  "curl -X 'GET' -H 'Hello: xxxxxxxx' 'https://foo.com'",
		},
		{
			settings: settingsSrv.InfinitySettings{ForwardOauthIdentity: true},
			query:    querySrv.Query{URL: "https://foo.com"},
			url:      "https://foo.com",
			command:  "curl -X 'GET' -H 'Authorization: xxxxxxxx' 'https://foo.com'",
		},
		{
			settings: settingsSrv.InfinitySettings{CustomHeaders: map[string]string{"good": "bye"}, SecureQueryFields: map[string]string{"me": "too"}},
			query:    querySrv.Query{URL: "https://foo.com?something=${__qs.me}", Type: "json", URLOptions: querySrv.URLOptions{Method: "POST", Body: "my request body with ${__qs.me} value", Headers: []querySrv.URLOptionKeyValuePair{{Key: "hello", Value: "world"}}}},
			url:      "https://foo.com?me=xxxxxxxx&something=xxxxxxxx",
			command:  "curl -X 'POST' -d 'my request body with ${__qs.me} value' -H 'Accept: application/json;q=0.9,text/plain' -H 'Content-Type: application/json' -H 'Good: xxxxxxxx' -H 'Hello: xxxxxxxx' 'https://foo.com?me=xxxxxxxx&something=xxxxxxxx'",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := &infinity.Client{Settings: tt.settings}
			got := client.GetExecutedURL(tt.query)
			assert.Equal(t, fmt.Sprintf("###############\n## URL\n###############\n\n%s\n\n###############\n## Curl Command\n###############\n\n%s", tt.url, tt.command), got)
		})
	}
}
