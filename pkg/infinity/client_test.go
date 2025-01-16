package infinity_test

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
)

func TestInfinityClient_GetResults(t *testing.T) {
	tests := []struct {
		name           string
		settings       models.InfinitySettings
		requestHeaders map[string]string
		query          models.Query
		wantO          any
		wantErr        bool
	}{
		{
			name:     "should return csv when no mode specified",
			settings: models.InfinitySettings{},
			query: models.Query{
				URL:  fmt.Sprintf("%s%s", mockCSVDomain, mockCSVURL),
				Type: "csv",
			},
			wantO: mockCSVDATA,
		},
		{
			name:     "should return xml when no mode specified",
			settings: models.InfinitySettings{},
			query: models.Query{
				URL:  fmt.Sprintf("%s%s", mockXMLDomain, mockXMLURL),
				Type: "xml",
			},
			wantO: mockXMLDATA,
		},
		{
			name: "should return correct csv in advanced mode",
			settings: models.InfinitySettings{
				URL: mockCSVDomain,
			},
			query: models.Query{
				URL:  mockCSVURL,
				Type: "csv",
			},
			wantO: mockCSVDATA,
		},
		{
			name:     "should return correct json",
			settings: models.InfinitySettings{},
			query: models.Query{
				URL:  fmt.Sprintf("%s%s", mockJSONDomain, mockJSONURL),
				Type: "json",
			},
			wantO: []any([]any{map[string]any{"age": 20.0, "name": "foo"}, map[string]any{"age": 25.0, "name": "bar"}}),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := &infinity.Client{
				Settings:   tt.settings,
				HttpClient: &http.Client{},
			}
			pluginContext := &backend.PluginContext{}
			gotO, statusCode, duration, err := client.GetResults(context.Background(), pluginContext, tt.query, tt.requestHeaders)
			if (err != nil) != tt.wantErr {
				t.Errorf("GetResults() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			assert.Equal(t, tt.wantO, gotO)
			assert.NotNil(t, statusCode)
			assert.NotNil(t, duration)
		})
	}
}

func TestCanAllowURL(t *testing.T) {
	tests := []struct {
		name         string
		url          string
		allowedHosts []string
		want         bool
	}{
		{
			url:  "https://foo.com",
			want: true,
		},
		{
			url:          "https://foo.com",
			allowedHosts: []string{"https://foo.com"},
			want:         true,
		},
		{
			url:          "https://bar.com",
			allowedHosts: []string{"https://foo.com"},
			want:         false,
		},
		{
			name:         "should match only case sensitive URL",
			url:          "https://FOO.com",
			allowedHosts: []string{"https://foo.com"},
			want:         false,
		},
		{
			url:          "https://bar.com/",
			allowedHosts: []string{"https://foo.com/", "https://bar.com/", "https://baz.com/"},
			want:         true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := infinity.CanAllowURL(tt.url, tt.allowedHosts)
			assert.Equal(t, tt.want, got)
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
