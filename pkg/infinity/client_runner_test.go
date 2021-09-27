package infinity_test

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
)

func TestClient_GetResults(t *testing.T) {
	tests := []struct {
		name    string
		config  infinity.InfinityConfig
		query   infinity.InfinityQuery
		wantO   interface{}
		wantErr bool
	}{
		{
			name:   "should return csv when no mode specified",
			config: infinity.InfinityConfig{},
			query: infinity.InfinityQuery{
				URL:  fmt.Sprintf("%s%s", mockCSVDomain, mockCSVURL),
				Type: "csv",
			},
			wantO: mockCSVDATA,
		},
		{
			name:   "should return xml when no mode specified",
			config: infinity.InfinityConfig{},
			query: infinity.InfinityQuery{
				URL:  fmt.Sprintf("%s%s", mockXMLDomain, mockXMLURL),
				Type: "xml",
			},
			wantO: mockXMLDATA,
		},
		{
			name: "should return correct csv in advanced mode",
			config: infinity.InfinityConfig{
				URL: mockCSVDomain,
			},
			query: infinity.InfinityQuery{
				URL:  mockCSVURL,
				Type: "csv",
			},
			wantO: mockCSVDATA,
		},
		{
			name: "should respect basic auth details provided",
			config: infinity.InfinityConfig{
				URL:              "https://httpbin.org/basic-auth",
				BasicAuthEnabled: true,
				UserName:         "foo",
				Password:         "bar",
			},
			query: infinity.InfinityQuery{
				URL:  "/foo/bar",
				Type: "json",
			},
			wantO: "{\n  \"authenticated\": true, \n  \"user\": \"foo\"\n}\n",
		},
		{
			name: "should throw error when incorrect auth specified",
			config: infinity.InfinityConfig{
				URL:      "https://httpbin.org/basic-auth",
				UserName: "foo",
				Password: "baz",
			},
			query: infinity.InfinityQuery{
				URL:  "/foo/bar",
				Type: "json",
			},
			wantErr: true,
		},
		{
			name:   "should return correct json",
			config: infinity.InfinityConfig{},
			query: infinity.InfinityQuery{
				URL:  fmt.Sprintf("%s%s", mockJSONDomain, mockJSONURL),
				Type: "json",
			},
			wantO: "[\n  {\n    \"name\": \"foo\",\n    \"age\": 20\n  },\n  {\n    \"name\": \"bar\",\n    \"age\": 25\n  }\n]",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := &infinity.Client{
				Config:     tt.config,
				HttpClient: &http.Client{},
			}
			gotO, err := client.GetResults(tt.query)
			if (err != nil) != tt.wantErr {
				t.Errorf("GetResults() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			assert.Equal(t, tt.wantO, gotO)
		})
	}
}

func Test_ReplaceQueryStringSecret(t *testing.T) {
	t.Run("should return string as it is when no replacers found", func(t *testing.T) {
		o := infinity.ReplaceQueryStringSecret("hello", infinity.InfinityConfig{})
		assert.Equal(t, "hello", o)
	})
	t.Run("should return string as it is when no matching replacers found", func(t *testing.T) {
		o := infinity.ReplaceQueryStringSecret("hello${__qs.foo}", infinity.InfinityConfig{})
		assert.Equal(t, "hello${__qs.foo}", o)
	})
	t.Run("should return replaced string when matching replacers found", func(t *testing.T) {
		o := infinity.ReplaceQueryStringSecret("hello${__qs.foo}", infinity.InfinityConfig{SecureQueryFields: map[string]string{"foo": "bar"}})
		assert.Equal(t, "hellobar", o)
	})
}

func TestGetQueryURL(t *testing.T) {
	t.Run("should return valid query if no options provided", func(t *testing.T) {
		url, err := infinity.GetQueryURL(infinity.InfinityConfig{}, infinity.InfinityQuery{})
		assert.Nil(t, err)
		assert.NotNil(t, url)
	})
	tests := []struct {
		name     string
		settings infinity.InfinityConfig
		query    infinity.InfinityQuery
		want     string
	}{
		{
			name:     "should return valid url when ip is passed as query",
			settings: infinity.InfinityConfig{},
			query:    infinity.InfinityQuery{URL: "0.0.0.0"},
			want:     "0.0.0.0",
		},
		{
			name:     "should return valid query full url specified in the query",
			settings: infinity.InfinityConfig{},
			query:    infinity.InfinityQuery{URL: "https://foo.com?key=val"},
			want:     "https://foo.com?key=val",
		},
		{
			name:     "should return valid query partial url specified in the query and base specified in the settings",
			settings: infinity.InfinityConfig{URL: "https://foo.com"},
			query:    infinity.InfinityQuery{URL: "/hello?key=val"},
			want:     "https://foo.com/hello?key=val",
		},
		{
			name:     "should return valid query base url specified both in settings and query",
			settings: infinity.InfinityConfig{URL: "https://foo.com"},
			query:    infinity.InfinityQuery{URL: "https://foo.com/hello?key=val"},
			want:     "https://foo.com/hello?key=val",
		},
		{

			name: "should return valid query when query have secure params",
			settings: infinity.InfinityConfig{
				URL: "https://foo.com",
				SecureQueryFields: map[string]string{
					"key_one": "val_one",
					"key_two": "val_two",
				},
			},
			query: infinity.InfinityQuery{URL: "/hello?key=val&key_one=${__qs.key_one}&key_two=${__qs.key_two}&foo=bar"},
			want:  "https://foo.com/hello?foo=bar&key=val&key_one=val_one&key_two=val_two",
		},
		{

			name: "should return valid query when query params present both in settings and query",
			settings: infinity.InfinityConfig{
				URL: "https://foo.com",
				SecureQueryFields: map[string]string{
					"key_one": "val_one",
				},
			},
			query: infinity.InfinityQuery{URL: "/hello?key=val&key_one=${__qs.key_one}&foo=bar&key_three=${__qs.key_three}", URLOptions: infinity.URLOptions{
				Params: []infinity.URLParam{{Key: "key_three", Value: "val_three"}},
			}},
			want: "https://foo.com/hello?foo=bar&key=val&key_one=val_one&key_three=val_three",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			u, err := infinity.GetQueryURL(tt.settings, tt.query)
			assert.Equal(t, err, nil)
			assert.Equal(t, tt.want, u)
		})
	}
}

const (
	mockCSVDomain = "https://gist.githubusercontent.com"
	mockCSVURL    = "/yesoreyeram/64a46b02f0bf87cb527d6270dd84ea47/raw/32ae9b1a4a0183dceb3596226b818c8f428193af/sample-with-quotes.csv"
	mockCSVDATA   = `"country","city"
"india","delhi"
"england","london"
"australia","sydney, canberra"`
	mockXMLDomain = "https://gist.githubusercontent.com"
	mockXMLURL    = "/yesoreyeram/655a362eed0f51be24e16d3f1127a31d/raw/0cdc6302b7c6a2dec69606d9471b56c843863054/simple.xml"
	mockXMLDATA   = `<?xml version="1.0" encoding="UTF-8"?>
<CATALOG><CD><TITLE>Empire Burlesque</TITLE></CD><CD><TITLE>Hide your heart</TITLE></CD></CATALOG>`
	mockJSONDomain = "https://gist.githubusercontent.com"
	mockJSONURL    = "/yesoreyeram/655a362eed0f51be24e16d3f1127a31d/raw/7b5dac1fe0a5d5ce47c9251117f73ade363b7ca8/users.json"
)
