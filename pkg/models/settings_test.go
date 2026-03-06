package models_test

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-infinity-datasource/pkg/secretsmanager"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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
				URL:                    "https://foo.com",
				UserName:               "user",
				Password:               "password",
				TimeoutInSeconds:       60,
				ApiKeyType:             "header",
				BasicAuthEnabled:       false,
				ProxyType:              models.ProxyTypeEnv,
				AuthenticationMethod:   models.AuthenticationMethodNone,
				UnsecuredQueryHandling: models.UnsecuredQueryHandlingWarn,
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
				URL:                    "https://foo.com",
				UserName:               "user",
				Password:               "password",
				TimeoutInSeconds:       30,
				ApiKeyType:             "header",
				BasicAuthEnabled:       true,
				AuthenticationMethod:   models.AuthenticationMethodBasic,
				ProxyType:              models.ProxyTypeEnv,
				UnsecuredQueryHandling: models.UnsecuredQueryHandlingWarn,
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
			gotSettings, err := models.LoadSettings(context.Background(), tt.config)
			if (err != nil) != tt.wantErr {
				t.Errorf("LoadSettings() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			assert.NotNil(t, gotSettings)

			// settings.ProxyOpts are handled by the sdk, we just validate
			assert.NotNil(t, gotSettings.ProxyOpts)

			// and then clean it to compare with the wanted settings
			gotSettings.ProxyOpts = httpclient.Options{}
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
			"proxy_type" : "url",
			"proxy_url" : "https://foo.com",
			"allowedHosts": ["host1","host2"],
			"keepCookies": ["cookie1","cookie2"],
			"customHealthCheckEnabled" : true,
			"customHealthCheckUrl" : "https://foo-check/",
			"allowDangerousHTTPMethods": true,
			"unsecuredQueryHandling" : "deny",
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
	gotSettings, err := models.LoadSettings(context.Background(), config)
	assert.Nil(t, err)
	assert.NotNil(t, gotSettings)

	// settings.ProxyOpts are handled by the sdk, we just validate
	assert.NotNil(t, gotSettings.ProxyOpts)

	// and then clean it to compare with the wanted settings
	gotSettings.ProxyOpts = httpclient.Options{}

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
		BearerToken:               "myBearerToken",
		ApiKeyKey:                 "hello",
		ApiKeyType:                "query",
		ApiKeyValue:               "earth",
		URL:                       "https://foo.com",
		ProxyType:                 models.ProxyTypeUrl,
		ProxyUrl:                  "https://foo.com",
		AllowedHosts:              []string{"host1", "host2"},
		UserName:                  "user",
		Password:                  "password",
		TimeoutInSeconds:          30,
		CustomHealthCheckEnabled:  true,
		CustomHealthCheckUrl:      "https://foo-check/",
		UnsecuredQueryHandling:    models.UnsecuredQueryHandlingDeny,
		AllowDangerousHTTPMethods: true,
		CustomHeaders: map[string]string{
			"header1": "headervalue1",
		},
		SecureQueryFields: map[string]string{
			"foo": "bar",
		},
		KeepCookies: []string{"cookie1", "cookie2"},
	}, gotSettings)
}

func TestLoadSettings_VaultFailsOnProviderInitError(t *testing.T) {
	config := backend.DataSourceInstanceSettings{
		JSONData: []byte(`{
			"vaultConfig": {
				"provider": "azure-keyvault",
				"azure": {
					"vaultUrl": "http://invalid.vault.azure.net/",
					"authMethod": "managed-identity"
				}
			}
		}`),
	}

	_, err := models.LoadSettings(context.Background(), config)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "vault provider initialization failed")
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

func TestInfinitySettings_Validate(t *testing.T) {
	tests := []struct {
		name     string
		settings models.InfinitySettings
		wantErr  error
	}{
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodNone},
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodNone, CustomHeaders: map[string]string{"A": "B"}},
			wantErr:  models.ErrInvalidConfigHostNotAllowed,
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodNone, CustomHeaders: map[string]string{"A": "B", "Accept": ""}},
			wantErr:  models.ErrInvalidConfigHostNotAllowed,
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodNone, CustomHeaders: map[string]string{"A": "B", "Content-Type": ""}},
			wantErr:  models.ErrInvalidConfigHostNotAllowed,
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodNone, CustomHeaders: map[string]string{"A": "B", "Accept": "", "Content-Type": ""}},
			wantErr:  models.ErrInvalidConfigHostNotAllowed,
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodNone, CustomHeaders: map[string]string{"A": "B", "C": "D"}},
			wantErr:  models.ErrInvalidConfigHostNotAllowed,
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodBasic},
			wantErr:  errors.New("invalid or empty password detected"),
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodBasic, Password: "123"},
			wantErr:  models.ErrInvalidConfigHostNotAllowed,
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodApiKey},
			wantErr:  errors.New("invalid API key specified"),
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodApiKey, ApiKeyKey: "foo"},
			wantErr:  errors.New("invalid API key specified"),
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodApiKey, ApiKeyValue: "bar"},
			wantErr:  errors.New("invalid API key specified"),
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodApiKey, ApiKeyKey: "foo", ApiKeyValue: "bar"},
			wantErr:  models.ErrInvalidConfigHostNotAllowed,
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodBearerToken},
			wantErr:  errors.New("invalid or empty bearer token detected"),
		},
		{
			settings: models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodBearerToken, BearerToken: "foo"},
			wantErr:  models.ErrInvalidConfigHostNotAllowed,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.settings.Validate()
			if tt.wantErr != nil {
				require.NotNil(t, err)
				assert.Equal(t, tt.wantErr, err)
				return
			}
			require.Nil(t, err)
		})
	}
}

func TestValidateAllowedHosts(t *testing.T) {
	tests := []struct {
		name        string
		allowedUrls []string
		wantErr     bool
		expectedErr string
	}{
		{
			name:        "empty list should not error",
			allowedUrls: []string{},
		},
		{
			name:        "nil list should not error",
			allowedUrls: nil,
		},
		{
			name:        "valid https URLs",
			allowedUrls: []string{"https://api.example.com", "https://api2.example.com"},
		},
		{
			name:        "valid http URLs",
			allowedUrls: []string{"http://api.example.com", "http://localhost:8080"},
		},
		{
			name:        "valid URLs with paths",
			allowedUrls: []string{"https://api.example.com/v1", "https://api.example.com/v2/users"},
		},
		{
			name:        "valid URLs with ports",
			allowedUrls: []string{"https://api.example.com:8443", "http://localhost:3000"},
		},
		{
			name:        "valid URLs with query parameters",
			allowedUrls: []string{"https://api.example.com?version=v1", "https://api.example.com/search?q=test"},
		},
		{
			name:        "valid URLs with fragments",
			allowedUrls: []string{"https://api.example.com#section", "https://docs.example.com/api#overview"},
		},
		{
			name:        "valid IP addresses",
			allowedUrls: []string{"http://192.168.1.1", "https://10.0.0.1:8080"},
		},
		{
			name:        "valid IPv6 addresses",
			allowedUrls: []string{"http://[::1]", "https://[2001:db8::1]:8080"},
		},
		{
			name:        "valid subdomain URLs",
			allowedUrls: []string{"https://api.sub.example.com", "https://v2.api.example.com"},
		},
		{
			name:        "valid URLs with authentication info",
			allowedUrls: []string{"https://user:pass@api.example.com", "http://admin@localhost:8080"},
		},
		{
			name: "mixed valid URLs",
			allowedUrls: []string{
				"https://api.example.com",
				"http://localhost:8080",
				"https://192.168.1.100:9000/api/v1",
				"http://[::1]:3000",
			},
		},
		{
			name:        "invalid URL - malformed",
			allowedUrls: []string{"://invalid-url"},
			wantErr:     true,
			expectedErr: "invalid url found in allowed hosts settings",
		},
		{
			name:        "valid URL - missing protocol - should default to https",
			allowedUrls: []string{"api.example.com"},
			wantErr:     false,
		},
		{
			name:        "invalid URL - empty string",
			allowedUrls: []string{""},
			wantErr:     true,
			expectedErr: "invalid url found in allowed hosts settings",
		},
		{
			name:        "invalid URL - only protocol",
			allowedUrls: []string{"https://"},
			wantErr:     true,
			expectedErr: "invalid url found in allowed hosts settings",
		},
		{
			name:        "invalid URL - whitespace only",
			allowedUrls: []string{"   "},
			wantErr:     true,
			expectedErr: "invalid url found in allowed hosts settings",
		},
		{
			name:        "invalid URL - protocol only with path",
			allowedUrls: []string{"https:///path"},
			wantErr:     true,
			expectedErr: "invalid url found in allowed hosts settings",
		},
		{
			name:        "invalid URL - space in URL",
			allowedUrls: []string{"https://api example.com"},
			wantErr:     true,
			expectedErr: "error parsing allowed list url",
		},
		{
			name:        "invalid URL - invalid characters",
			allowedUrls: []string{"https://api.exam ple.com"},
			wantErr:     true,
			expectedErr: "error parsing allowed list url",
		},
		{
			name:        "mixed valid and invalid URLs - should fail on first invalid",
			allowedUrls: []string{"https://api.example.com", "https://", "https://api2.example.com"},
			wantErr:     true,
			expectedErr: "invalid url found in allowed hosts settings",
		},
		{
			name:        "invalid URL - control characters",
			allowedUrls: []string{"https://api.example.com\x00"},
			wantErr:     true,
			expectedErr: "error parsing allowed list url",
		},
		{
			name:        "edge case - localhost variants",
			allowedUrls: []string{"http://localhost", "http://127.0.0.1", "http://0.0.0.0"},
			wantErr:     false,
		},
		{
			name:        "edge case - unusual but valid ports",
			allowedUrls: []string{"https://api.example.com:65535", "http://localhost:1"},
		},
		{
			name:        "edge case - very long hostname",
			allowedUrls: []string{"https://" + strings.Repeat("a", 253) + ".com"},
		},
		{
			name:        "invalid URL - percent encoding issues",
			allowedUrls: []string{"https://api.example.com/%"},
			wantErr:     true,
			expectedErr: "error parsing allowed list url",
		},
		{
			name:        "valid host name",
			allowedUrls: []string{"localhost"},
		},
		{
			name:        "valid host name with port",
			allowedUrls: []string{"localhost:8080"},
		},
		{
			name:        "hostnames such as h should be considered as hostname instead of url scheme",
			allowedUrls: []string{"h"},
		},
		{
			name:        "hostnames such as abc should be considered as hostname instead of url scheme",
			allowedUrls: []string{"abc"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := models.ValidateAllowedHosts(tt.allowedUrls)
			if tt.wantErr {
				require.Error(t, err, "Expected an error but got none")
				if tt.expectedErr != "" {
					assert.Contains(t, err.Error(), tt.expectedErr, "Error message should contain expected text")
				}
			} else {
				require.NoError(t, err, "Expected no error but got: %v", err)
			}
		})
	}
}

func TestValidate_VaultAwareSecrets(t *testing.T) {
	vaultEnabled := secretsmanager.VaultConfig{
		Provider: secretsmanager.ProviderTypeAzureKeyVault,
		Azure: &secretsmanager.AzureKeyVaultConfig{
			VaultURL: "https://my-vault.vault.azure.net",
		},
	}
	vaultWithMapping := secretsmanager.VaultConfig{
		Provider: secretsmanager.ProviderTypeAzureKeyVault,
		Azure: &secretsmanager.AzureKeyVaultConfig{
			VaultURL: "https://my-vault.vault.azure.net",
		},
		SecretMapping: map[string]string{
			"basicAuthPassword": "my-password-secret",
		},
	}

	tests := []struct {
		name     string
		settings models.InfinitySettings
		wantErr  error
	}{
		// --- Basic Auth ---
		{
			name: "basicAuth without password and no vault => error",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodBasic,
				Password:             "",
			},
			wantErr: models.ErrInvalidConfigPassword,
		},
		{
			name: "basicAuth without password but vault enabled => no secret error, requires allowed hosts",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodBasic,
				Password:             "",
				VaultConfig:          vaultEnabled,
			},
			wantErr: models.ErrInvalidConfigHostNotAllowed, // passes secret check but fails allowed hosts
		},
		{
			name: "basicAuth without password, vault enabled, allowed hosts set => passes",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodBasic,
				Password:             "",
				VaultConfig:          vaultEnabled,
				AllowedHosts:         []string{"https://example.com"},
			},
			wantErr: nil,
		},
		{
			name: "basicAuth without password, vault with explicit mapping => passes secret check",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodBasic,
				Password:             "",
				VaultConfig:          vaultWithMapping,
				AllowedHosts:         []string{"https://example.com"},
			},
			wantErr: nil,
		},
		// --- Digest Auth ---
		{
			name: "digestAuth without password and no vault => error",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodDigestAuth,
				Password:             "",
			},
			wantErr: models.ErrInvalidConfigPassword,
		},
		{
			name: "digestAuth without password, vault enabled, allowed hosts set => passes",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodDigestAuth,
				Password:             "",
				VaultConfig:          vaultEnabled,
				AllowedHosts:         []string{"https://example.com"},
			},
			wantErr: nil,
		},
		// --- API Key ---
		{
			name: "apiKey without key name and no vault => error",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodApiKey,
				ApiKeyKey:            "",
				ApiKeyValue:          "",
			},
			wantErr: models.ErrInvalidConfigAPIKey,
		},
		{
			name: "apiKey with key name but no value and no vault => error",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodApiKey,
				ApiKeyKey:            "X-Api-Key",
				ApiKeyValue:          "",
			},
			wantErr: models.ErrInvalidConfigAPIKey,
		},
		{
			name: "apiKey without key name but vault enabled => error (key name is never vault-resolved)",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodApiKey,
				ApiKeyKey:            "",
				ApiKeyValue:          "",
				VaultConfig:          vaultEnabled,
			},
			wantErr: models.ErrInvalidConfigAPIKey,
		},
		{
			name: "apiKey with key name, no value, vault enabled => passes secret check",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodApiKey,
				ApiKeyKey:            "X-Api-Key",
				ApiKeyValue:          "",
				VaultConfig:          vaultEnabled,
				AllowedHosts:         []string{"https://example.com"},
			},
			wantErr: nil,
		},
		// --- Bearer Token ---
		{
			name: "bearerToken without token and no vault => error",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodBearerToken,
				BearerToken:          "",
			},
			wantErr: models.ErrInvalidConfigBearerToken,
		},
		{
			name: "bearerToken without token, vault enabled, allowed hosts set => passes",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodBearerToken,
				BearerToken:          "",
				VaultConfig:          vaultEnabled,
				AllowedHosts:         []string{"https://example.com"},
			},
			wantErr: nil,
		},
		// --- Azure Blob ---
		{
			name: "azureBlob without account name and vault => still error (account name is not a secret)",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodAzureBlob,
				AzureBlobAccountName: "",
				AzureBlobAccountKey:  "",
				VaultConfig:          vaultEnabled,
			},
			wantErr: models.ErrInvalidConfigAzBlobAccName,
		},
		{
			name: "azureBlob with account name, no key, no vault => error",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodAzureBlob,
				AzureBlobAccountName: "myaccount",
				AzureBlobAccountKey:  "",
			},
			wantErr: models.ErrInvalidConfigAzBlobKey,
		},
		{
			name: "azureBlob with account name, no key, vault enabled => passes",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodAzureBlob,
				AzureBlobAccountName: "myaccount",
				AzureBlobAccountKey:  "",
				VaultConfig:          vaultEnabled,
			},
			wantErr: nil,
		},
		// --- AWS ---
		{
			name: "aws keys auth without access key and no vault => error",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodAWS,
				AWSSettings:          models.AWSSettings{AuthType: models.AWSAuthTypeKeys},
				AWSAccessKey:         "",
				AWSSecretKey:         "",
			},
			wantErr: models.ErrInvalidConfigAWSAccessKey,
		},
		{
			name: "aws keys auth with access key, no secret key, no vault => error",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodAWS,
				AWSSettings:          models.AWSSettings{AuthType: models.AWSAuthTypeKeys},
				AWSAccessKey:         "AKIA...",
				AWSSecretKey:         "",
			},
			wantErr: models.ErrInvalidConfigAWSSecretKey,
		},
		{
			name: "aws keys auth without access key, vault enabled => passes",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodAWS,
				AWSSettings:          models.AWSSettings{AuthType: models.AWSAuthTypeKeys},
				AWSAccessKey:         "",
				AWSSecretKey:         "",
				VaultConfig:          vaultEnabled,
			},
			wantErr: nil,
		},
		// --- Vault none / empty ---
		{
			name: "vault provider 'none' does not cover secrets",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodBasic,
				Password:             "",
				VaultConfig: secretsmanager.VaultConfig{
					Provider: secretsmanager.ProviderTypeNone,
				},
			},
			wantErr: models.ErrInvalidConfigPassword,
		},
		{
			name: "vault provider empty string does not cover secrets",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodBasic,
				Password:             "",
				VaultConfig: secretsmanager.VaultConfig{
					Provider: "",
				},
			},
			wantErr: models.ErrInvalidConfigPassword,
		},
		// --- Existing secret provided locally (vault should not interfere) ---
		{
			name: "basicAuth with password provided locally, no vault => passes",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodBasic,
				Password:             "local-pw",
				AllowedHosts:         []string{"https://example.com"},
			},
			wantErr: nil,
		},
		{
			name: "basicAuth with password provided locally and vault enabled => passes",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodBasic,
				Password:             "local-pw",
				VaultConfig:          vaultEnabled,
				AllowedHosts:         []string{"https://example.com"},
			},
			wantErr: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.settings.Validate()
			if tt.wantErr != nil {
				require.NotNil(t, err, "expected error %v", tt.wantErr)
				assert.Equal(t, tt.wantErr, err)
				return
			}
			require.Nil(t, err, "unexpected error: %v", err)
		})
	}
}

func TestDoesAllowedHostsRequired_VaultEnabled(t *testing.T) {
	tests := []struct {
		name     string
		settings models.InfinitySettings
		want     bool
	}{
		{
			name: "vault enabled with no auth and no base URL => required",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodNone,
				VaultConfig: secretsmanager.VaultConfig{
					Provider: secretsmanager.ProviderTypeAzureKeyVault,
				},
			},
			want: true,
		},
		{
			name: "vault enabled with base URL set => not required",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodNone,
				URL:                  "https://base.example.com",
				VaultConfig: secretsmanager.VaultConfig{
					Provider: secretsmanager.ProviderTypeAzureKeyVault,
				},
			},
			want: false,
		},
		{
			name: "vault provider none with no auth => not required",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodNone,
				VaultConfig: secretsmanager.VaultConfig{
					Provider: secretsmanager.ProviderTypeNone,
				},
			},
			want: false,
		},
		{
			name: "vault provider empty with no auth => not required",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodNone,
				VaultConfig: secretsmanager.VaultConfig{
					Provider: "",
				},
			},
			want: false,
		},
		{
			name: "no vault, no auth, no base URL => not required",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodNone,
			},
			want: false,
		},
		{
			name: "vault enabled with auth => required (both conditions met)",
			settings: models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodBasic,
				VaultConfig: secretsmanager.VaultConfig{
					Provider: secretsmanager.ProviderTypeAzureKeyVault,
				},
			},
			want: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.settings.DoesAllowedHostsRequired()
			assert.Equal(t, tt.want, got)
		})
	}
}
