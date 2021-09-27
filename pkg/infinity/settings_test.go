package infinity_test

import (
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
)

func TestGetSettings(t *testing.T) {
	tests := []struct {
		name         string
		config       backend.DataSourceInstanceSettings
		wantSettings infinity.InfinityConfig
		wantErr      bool
	}{
		{
			name: "empty settings shouldn't throw error",
			wantSettings: infinity.InfinityConfig{
				CustomHeaders:     map[string]string{},
				SecureQueryFields: map[string]string{},
			},
		},
		{
			name:    "incorrect json should throw error",
			wantErr: true,
			config: backend.DataSourceInstanceSettings{
				JSONData: []byte(`{ `),
			},
		},
		{
			name: "empty json data should parse correctly",
			config: backend.DataSourceInstanceSettings{
				JSONData: []byte(`{}`),
			},
			wantSettings: infinity.InfinityConfig{
				TimeoutInSeconds:  60,
				CustomHeaders:     map[string]string{},
				SecureQueryFields: map[string]string{},
			},
		},
		{
			name: "valid settings should parse correctly",
			config: backend.DataSourceInstanceSettings{
				URL:           "https://foo.com",
				BasicAuthUser: "user",
				JSONData: []byte(`{ 
					"datasource_mode"  : "advanced",
					"secureQueryName1" : "foo",
					"httpHeaderName1"  : "header1"
				}`),
				DecryptedSecureJSONData: map[string]string{
					"basicAuthPassword": "password",
					"secureQueryValue1": "bar",
					"httpHeaderValue1":  "headervalue1",
				},
			},
			wantSettings: infinity.InfinityConfig{
				URL:              "https://foo.com",
				UserName:         "user",
				Password:         "password",
				TimeoutInSeconds: 60,
				CustomHeaders: map[string]string{
					"header1": "headervalue1",
				},
				SecureQueryFields: map[string]string{
					"foo": "bar",
				},
			},
		},
		{
			name: "custom timeout settings should parse correctly",
			config: backend.DataSourceInstanceSettings{
				URL:           "https://foo.com",
				BasicAuthUser: "user",
				JSONData: []byte(`{ 
					"datasource_mode"  : "advanced",
					"secureQueryName1" : "foo",
					"httpHeaderName1"  : "header1",
					"timeoutInSeconds" : 30
				}`),
				DecryptedSecureJSONData: map[string]string{
					"basicAuthPassword": "password",
					"secureQueryValue1": "bar",
					"httpHeaderValue1":  "headervalue1",
				},
			},
			wantSettings: infinity.InfinityConfig{
				URL:              "https://foo.com",
				UserName:         "user",
				Password:         "password",
				TimeoutInSeconds: 30,
				CustomHeaders: map[string]string{
					"header1": "headervalue1",
				},
				SecureQueryFields: map[string]string{
					"foo": "bar",
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotSettings, err := infinity.GetSettings(tt.config)
			if tt.wantErr == true {
				assert.NotNil(t, err)
				return
			}
			assert.Nil(t, err)
			assert.Equal(t, tt.wantSettings, *gotSettings)
		})
	}
}
