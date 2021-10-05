package infinity_test

import (
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
)

func TestLoadSettings(t *testing.T) {
	tests := []struct {
		name         string
		config       backend.DataSourceInstanceSettings
		wantSettings infinity.InfinitySettings
		wantErr      bool
	}{
		{
			name: "empty settings shouldn't throw error",
			wantSettings: infinity.InfinitySettings{
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
			wantSettings: infinity.InfinitySettings{
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
			wantSettings: infinity.InfinitySettings{
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
			gotSettings, err := infinity.LoadSettings(tt.config)
			if (err != nil) != tt.wantErr {
				t.Errorf("LoadSettings() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			assert.Equal(t, tt.wantSettings, gotSettings)
		})
	}
}

func Test_getSecrets(t *testing.T) {
	tests := []struct {
		name   string
		config backend.DataSourceInstanceSettings
		want   map[string]string
	}{
		{
			name: "should return all the headers starting with httpHeaderName",
			config: backend.DataSourceInstanceSettings{
				JSONData: []byte(`{
					"foo":"bar",
					"basicAuthPassword":"password",
					"httpHeaderName1":"one",
					"httpHeaderName2":"two",
					"httpHeaderName3":"three"
				}`),
				DecryptedSecureJSONData: map[string]string{
					"httpHeaderValue1": "value_of_one",
					"httpHeaderValue2": "value_of_two",
					"httpHeaderValue3": "value_of_three",
				},
			},
			want: map[string]string{
				"one":   "value_of_one",
				"two":   "value_of_two",
				"three": "value_of_three",
			},
		},
		{
			name: "should return headers when non string values are present",
			config: backend.DataSourceInstanceSettings{
				JSONData: []byte(`{
					"foo":"bar",
					"basicAuthPassword":"password",
					"age":13,
					"name":{ "f":"F", "l":"L" },
					"something":[1,2,3],
					"httpHeaderName1":"one",
					"httpHeaderName2":"two",
					"httpHeaderName3":"three"
				}`),
				DecryptedSecureJSONData: map[string]string{
					"httpHeaderValue1": "value_of_one",
					"httpHeaderValue2": "2",
				},
			},
			want: map[string]string{
				"one":   "value_of_one",
				"two":   "2",
				"three": "",
			},
		},
		{
			name: "should return empty array when no headers are present",
			config: backend.DataSourceInstanceSettings{
				JSONData: []byte(`{
					"foo":"bar",
					"basicAuthPassword":"password"
				}`),
				DecryptedSecureJSONData: map[string]string{
					"httpHeaderValue1": "value_of_one",
					"httpHeaderValue2": "value_of_two",
				},
			},
			want: map[string]string{},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := infinity.GetSecrets(tt.config, "httpHeaderName", "httpHeaderValue")
			assert.Equal(t, tt.want, got)
		})
	}
}
