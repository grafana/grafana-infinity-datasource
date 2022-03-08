package infinity

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type OAuth2Settings struct {
	OAuth2Type     string   `json:"oauth2_type,omitempty"`
	ClientID       string   `json:"client_id,omitempty"`
	TokenURL       string   `json:"token_url,omitempty"`
	Email          string   `json:"email,omitempty"`
	PrivateKeyID   string   `json:"private_key_id,omitempty"`
	Subject        string   `json:"subject,omitempty"`
	Scopes         []string `json:"scopes,omitempty"`
	ClientSecret   string
	PrivateKey     string
	EndpointParams map[string]string
}

type InfinitySettings struct {
	AuthenticationMethod string
	OAuth2Settings       OAuth2Settings
	BearerToken          string
	ApiKeyKey            string
	ApiKeyType           string
	ApiKeyValue          string
	URL                  string
	BasicAuthEnabled     bool
	UserName             string
	Password             string
	ForwardOauthIdentity bool
	CustomHeaders        map[string]string
	SecureQueryFields    map[string]string
	InsecureSkipVerify   bool
	ServerName           string
	TimeoutInSeconds     int64
	TLSClientAuth        bool
	TLSAuthWithCACert    bool
	TLSCACert            string
	TLSClientCert        string
	TLSClientKey         string
}

type InfinitySettingsJson struct {
	AuthenticationMethod string         `json:"auth_method,omitempty"`
	APIKeyKey            string         `json:"apiKeyKey,omitempty"`
	APIKeyType           string         `json:"apiKeyType,omitempty"`
	OAuth2Settings       OAuth2Settings `json:"oauth2,omitempty"`
	ForwardOauthIdentity bool           `json:"oauthPassThru,omitempty"`
	InsecureSkipVerify   bool           `json:"tlsSkipVerify,omitempty"`
	ServerName           string         `json:"serverName,omitempty"`
	TLSClientAuth        bool           `json:"tlsClientAuth,omitempty"`
	TLSAuthWithCACert    bool           `json:"tlsAuthWithCACert,omitempty"`
	TimeoutInSeconds     int64          `json:"timeoutInSeconds,omitempty"`
}

func LoadSettings(config backend.DataSourceInstanceSettings) (settings InfinitySettings, err error) {
	settings.URL = config.URL
	if config.URL == "__IGNORE_URL__" {
		settings.URL = ""
	}
	settings.BasicAuthEnabled = config.BasicAuthEnabled
	settings.UserName = config.BasicAuthUser
	infJson := InfinitySettingsJson{}
	if config.JSONData != nil {
		if err := json.Unmarshal(config.JSONData, &infJson); err != nil {
			return settings, err
		}
		settings.AuthenticationMethod = infJson.AuthenticationMethod
		settings.OAuth2Settings = infJson.OAuth2Settings
		if settings.AuthenticationMethod == "oauth2" && settings.OAuth2Settings.OAuth2Type == "" {
			settings.OAuth2Settings.OAuth2Type = "client_credentials"
		}
		if settings.AuthenticationMethod == "apiKey" {
			settings.ApiKeyKey = infJson.APIKeyKey
			settings.ApiKeyType = infJson.APIKeyType
			if settings.ApiKeyType == "" {
				settings.ApiKeyType = "header"
			}
			if val, ok := config.DecryptedSecureJSONData["apiKeyValue"]; ok {
				settings.ApiKeyValue = val
			}
		}
		settings.ForwardOauthIdentity = infJson.ForwardOauthIdentity
		settings.InsecureSkipVerify = infJson.InsecureSkipVerify
		settings.ServerName = infJson.ServerName
		settings.TLSClientAuth = infJson.TLSClientAuth
		settings.TLSAuthWithCACert = infJson.TLSAuthWithCACert
		settings.TimeoutInSeconds = 60
		if infJson.TimeoutInSeconds > 0 {
			settings.TimeoutInSeconds = infJson.TimeoutInSeconds
		}
	}
	if val, ok := config.DecryptedSecureJSONData["basicAuthPassword"]; ok {
		settings.Password = val
	}
	if val, ok := config.DecryptedSecureJSONData["oauth2ClientSecret"]; ok {
		settings.OAuth2Settings.ClientSecret = val
	}
	if val, ok := config.DecryptedSecureJSONData["oauth2JWTPrivateKey"]; ok {
		settings.OAuth2Settings.PrivateKey = val
	}
	if val, ok := config.DecryptedSecureJSONData["tlsCACert"]; ok {
		settings.TLSCACert = val
	}
	if val, ok := config.DecryptedSecureJSONData["tlsClientCert"]; ok {
		settings.TLSClientCert = val
	}
	if val, ok := config.DecryptedSecureJSONData["tlsClientKey"]; ok {
		settings.TLSClientKey = val
	}
	settings.CustomHeaders = GetSecrets(config, "httpHeaderName", "httpHeaderValue")
	settings.SecureQueryFields = GetSecrets(config, "secureQueryName", "secureQueryValue")
	if settings.AuthenticationMethod == "oauth2" && settings.OAuth2Settings.OAuth2Type == "jwt" {
		settings.OAuth2Settings.EndpointParams = GetSecrets(config, "oauth2EndPointParamsName", "oauth2EndPointParamsValue")
	}
	if settings.AuthenticationMethod == "bearerToken" {
		if val, ok := config.DecryptedSecureJSONData["bearerToken"]; ok {
			settings.BearerToken = val
		}
	}
	return
}

func GetSecrets(config backend.DataSourceInstanceSettings, secretType string, secretValue string) map[string]string {
	headers := make(map[string]string)
	JsonData := make(map[string]interface{})
	if err := json.Unmarshal(config.JSONData, &JsonData); err != nil {
		return headers
	}
	if JsonData == nil {
		return headers
	}
	for key, value := range JsonData {
		if strings.HasPrefix(key, secretType) {
			header_key := fmt.Sprintf("%v", value)
			headers[header_key] = config.DecryptedSecureJSONData[strings.Replace(key, secretType, secretValue, 1)]
		}
	}
	return headers
}
