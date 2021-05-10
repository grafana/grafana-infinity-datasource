package infinity_test

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	infinity "github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
)

func Test_getQueryURL(t *testing.T) {
	tests := []struct {
		name     string
		settings infinity.InfinitySettings
		query    infinity.Query
		want     string
	}{
		{
			settings: infinity.InfinitySettings{},
			query: infinity.Query{
				URL: "0.0.0.0",
			},
			want: "0.0.0.0",
		},
		{
			settings: infinity.InfinitySettings{},
			query: infinity.Query{
				URL: "https://foo.com?key=val",
			},
			want: "https://foo.com?key=val",
		},
		{
			settings: infinity.InfinitySettings{
				DatasourceMode: infinity.DataSourceModeAdvanced,
				URL:            "https://foo.com",
			},
			query: infinity.Query{
				URL: "/hello?key=val",
			},
			want: "https://foo.com/hello?key=val",
		},
		{
			settings: infinity.InfinitySettings{
				DatasourceMode: infinity.DataSourceModeAdvanced,
				URL:            "https://foo.com",
				SecureQueryFields: map[string]string{
					"key_one": "val_one",
					"key_two": "val_two",
				},
			},
			query: infinity.Query{
				URL: "/hello?key=val&key_one=${__qs.key_one}&key_two=${__qs.key_two}&foo=bar",
			},
			want: "https://foo.com/hello?foo=bar&key=val&key_one=val_one&key_two=val_two",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, infinity.GetQueryURL(tt.settings, tt.query))
		})
	}
}

func TestInfinityClient_GetResults(t *testing.T) {
	tests := []struct {
		name     string
		settings infinity.InfinitySettings
		query    infinity.Query
		wantO    interface{}
		wantErr  bool
	}{
		{
			name:     "should return csv when no mode specified",
			settings: infinity.InfinitySettings{},
			query: infinity.Query{
				URL:  fmt.Sprintf("%s%s", mockCSVDomain, mockCSVURL),
				Type: "csv",
			},
			wantO: mockCSVDATA,
		},
		{
			name:     "should return xml when no mode specified",
			settings: infinity.InfinitySettings{},
			query: infinity.Query{
				URL:  fmt.Sprintf("%s%s", mockXMLDomain, mockXMLURL),
				Type: "xml",
			},
			wantO: mockXMLDATA,
		},
		{
			name: "should return correct csv in advanced mode",
			settings: infinity.InfinitySettings{
				URL:            mockCSVDomain,
				DatasourceMode: "advanced",
			},
			query: infinity.Query{
				URL:  mockCSVURL,
				Type: "csv",
			},
			wantO: mockCSVDATA,
		},
		{
			name: "should respect basic auth details provided",
			settings: infinity.InfinitySettings{
				DatasourceMode: "advanced",
				URL:            "https://httpbin.org/basic-auth",
				UserName:       "foo",
				Password:       "bar",
			},
			query: infinity.Query{
				URL:  "/foo/bar",
				Type: "json",
			},
			wantO: map[string]interface{}{"authenticated": true, "user": "foo"},
		},
		{
			name: "should throw error when incorrect auth specified",
			settings: infinity.InfinitySettings{
				DatasourceMode: "advanced",
				URL:            "https://httpbin.org/basic-auth",
				UserName:       "foo",
				Password:       "baz",
			},
			query: infinity.Query{
				URL:  "/foo/bar",
				Type: "json",
			},
			wantErr: true,
		},
		{
			name:     "should return correct json",
			settings: infinity.InfinitySettings{},
			query: infinity.Query{
				URL:  fmt.Sprintf("%s%s", mockJSONDomain, mockJSONURL),
				Type: "json",
			},
			wantO: []interface{}{
				map[string]interface{}{"name": "foo", "age": float64(20)},
				map[string]interface{}{"name": "bar", "age": float64(25)},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := &infinity.Client{
				Settings:   tt.settings,
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
