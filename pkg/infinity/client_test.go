package infinity_test

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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

func TestValidateRequest(t *testing.T) {
	tests := []struct {
		name           string
		url            string
		envAllowedHost string
		envDeniedHost  string
		allowedHosts   []string
		wantErr        error
	}{
		{
			url: "https://foo.com",
		},
		{
			url:          "https://foo.com",
			allowedHosts: []string{"https://foo.com"},
		},
		{
			url:          "https://bar.com",
			allowedHosts: []string{"https://foo.com"},
			wantErr:      models.ErrURLNotAllowed,
		},
		{
			name:         "should match only case sensitive URL",
			url:          "https://FOO.com",
			allowedHosts: []string{"https://foo.com"},
			wantErr:      models.ErrURLNotAllowed,
		},
		{
			url:          "https://bar.com/",
			allowedHosts: []string{"https://foo.com/", "https://bar.com/", "https://baz.com/"},
		},
		{
			name:          "should throw error if host name matches the denied list in the grafana config",
			url:           "https://FOO.com",
			envDeniedHost: "baa.com foo.com bar.com",
			wantErr:       errors.New("hostname denied via grafana config. hostname FOO.com"),
		},
		{
			name:           "should throw error if host name not found in the allowed list in the grafana config",
			url:            "https://FOO.com",
			envAllowedHost: "baa.com foo.co bar.com",
			wantErr:        errors.New("hostname not allowed via grafana config. hostname FOO.com"),
		},
		{
			name:          "should not throw error if host name doesn't match the denied list in the grafana config",
			url:           "https://FOO.com",
			envDeniedHost: "baa.com bar.com",
		},
		{
			name:           "should not throw error if host name found in the allowed list in the grafana config",
			url:            "https://FOO.com",
			envAllowedHost: "baa.com foo.com bar.com",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.envAllowedHost != "" {
				t.Setenv("GF_PLUGIN_HOST_ALLOW_LIST", tt.envAllowedHost)
			}
			if tt.envDeniedHost != "" {
				t.Setenv("GF_PLUGIN_HOST_DENY_LIST", tt.envDeniedHost)
			}
			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			gotErr := infinity.ValidateRequest(context.TODO(), &backend.PluginContext{}, models.InfinitySettings{AllowedHosts: tt.allowedHosts}, req)
			if tt.wantErr != nil {
				require.NotNil(t, gotErr)
				assert.Equal(t, tt.wantErr, gotErr)
				return
			}
			require.Nil(t, gotErr)
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
