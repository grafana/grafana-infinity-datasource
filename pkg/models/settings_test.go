package models_test

import (
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
)

func TestLoadSettings(t *testing.T) {
	tests := []struct {
		name         string
		config       backend.DataSourceInstanceSettings
		wantSettings models.InfinitySettings
		wantErr      bool
	}{
		{
			name: "empty settings shouldn't throw error",
			wantSettings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodNone,
				OAuth2Settings: models.OAuth2Settings{
					EndpointParams: map[string]string{},
				},
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
			wantSettings: models.InfinitySettings{
				URL:                  "https://foo.com",
				UserName:             "user",
				Password:             "password",
				TimeoutInSeconds:     60,
				ApiKeyType:           "header",
				BasicAuthEnabled:     false,
				AuthenticationMethod: models.AuthenticationMethodNone,
				OAuth2Settings: models.OAuth2Settings{
					EndpointParams: map[string]string{},
				},
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
				URL:              "https://foo.com",
				BasicAuthUser:    "user",
				BasicAuthEnabled: true,
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
			wantSettings: models.InfinitySettings{
				URL:                  "https://foo.com",
				UserName:             "user",
				Password:             "password",
				TimeoutInSeconds:     30,
				ApiKeyType:           "header",
				BasicAuthEnabled:     true,
				AuthenticationMethod: models.AuthenticationMethodBasic,
				OAuth2Settings: models.OAuth2Settings{
					EndpointParams: map[string]string{},
				},
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
			gotSettings, err := models.LoadSettings(tt.config)
			if (err != nil) != tt.wantErr {
				t.Errorf("LoadSettings() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			assert.Equal(t, tt.wantSettings, gotSettings)
		})
	}
}

func TestAllSettingsAgainstFrontEnd(t *testing.T) {
	config := backend.DataSourceInstanceSettings{
		URL:           "https://foo.com",
		BasicAuthUser: "user",
		JSONData: []byte(`{ 
			"auth_method"      : "oauth2",
			"apiKeyKey" 	   : "hello",
			"apiKeyType" 	   : "query",
			"datasource_mode"  : "advanced",
			"secureQueryName1" : "foo",
			"httpHeaderName1"  : "header1",
			"timeoutInSeconds" : 30,
			"tlsAuth"		   : true,
			"tlsAuthWithCACert": true,
			"tlsSkipVerify"    : true,
			"oauth2EndPointParamsName1":"resource",
			"oauth2EndPointParamsName2":"name",
			"oauthPassThru": true,
			"allowedHosts": ["host1","host2"],
			"aws" : {
				"authType" 	: "keys",
				"region" 	: "region1",
				"service" 	: "service1"
			},
			"oauth2" : {
				"client_id":"myClientID",
				"email":"myEmail",
				"private_key_id":"saturn",
				"subject":"mySubject",
				"token_url":"TOKEN_URL",
				"scopes":["scope1","scope2"]
			}
		}`),
		DecryptedSecureJSONData: map[string]string{
			"tlsCACert":                  "myTlsCACert",
			"tlsClientCert":              "myTlsClientCert",
			"tlsClientKey":               "myTlsClientKey",
			"basicAuthPassword":          "password",
			"secureQueryValue1":          "bar",
			"httpHeaderValue1":           "headervalue1",
			"apiKeyValue":                "earth",
			"bearerToken":                "myBearerToken",
			"awsAccessKey":               "awsAccessKey1",
			"awsSecretKey":               "awsSecretKey1",
			"oauth2ClientSecret":         "myOauth2ClientSecret",
			"oauth2JWTPrivateKey":        "myOauth2JWTPrivateKey",
			"oauth2EndPointParamsValue1": "Resource1",
			"oauth2EndPointParamsValue2": "Resource2",
		},
	}
	gotSettings, err := models.LoadSettings(config)
	assert.Nil(t, err)
	assert.NotNil(t, gotSettings)
	assert.Equal(t, models.InfinitySettings{
		AuthenticationMethod: "oauth2",
		ForwardOauthIdentity: true,
		InsecureSkipVerify:   true,
		TLSClientAuth:        true,
		TLSAuthWithCACert:    true,
		TLSClientCert:        "myTlsClientCert",
		TLSCACert:            "myTlsCACert",
		TLSClientKey:         "myTlsClientKey",
		AWSAccessKey:         "awsAccessKey1",
		AWSSecretKey:         "awsSecretKey1",
		AWSSettings: models.AWSSettings{
			AuthType: models.AWSAuthTypeKeys,
			Service:  "service1",
			Region:   "region1",
		},
		OAuth2Settings: models.OAuth2Settings{
			ClientID:     "myClientID",
			OAuth2Type:   "client_credentials",
			ClientSecret: "myOauth2ClientSecret",
			PrivateKey:   "myOauth2JWTPrivateKey",
			Email:        "myEmail",
			PrivateKeyID: "saturn",
			Subject:      "mySubject",
			TokenURL:     "TOKEN_URL",
			Scopes:       []string{"scope1", "scope2"},
			EndpointParams: map[string]string{
				"resource": "Resource1",
				"name":     "Resource2",
			},
		},
		BearerToken:      "myBearerToken",
		ApiKeyKey:        "hello",
		ApiKeyType:       "query",
		ApiKeyValue:      "earth",
		URL:              "https://foo.com",
		AllowedHosts:     []string{"host1", "host2"},
		UserName:         "user",
		Password:         "password",
		TimeoutInSeconds: 30,
		CustomHeaders: map[string]string{
			"header1": "headervalue1",
		},
		SecureQueryFields: map[string]string{
			"foo": "bar",
		},
	}, gotSettings)
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
			got := models.GetSecrets(tt.config, "httpHeaderName", "httpHeaderValue")
			assert.Equal(t, tt.want, got)
		})
	}
}
