package models

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/textproto"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"golang.org/x/oauth2"
)

const (
	AuthenticationMethodNone         = "none"
	AuthenticationMethodBasic        = "basicAuth"
	AuthenticationMethodApiKey       = "apiKey"
	AuthenticationMethodBearerToken  = "bearerToken"
	AuthenticationMethodForwardOauth = "oauthPassThru"
	AuthenticationMethodDigestAuth   = "digestAuth"
	AuthenticationMethodOAuth        = "oauth2"
	AuthenticationMethodAWS          = "aws"
	AuthenticationMethodAzureBlob    = "azureBlob"
)

const (
	AuthOAuthTypeClientCredentials = "client_credentials"
	AuthOAuthJWT                   = "jwt"
	AuthOAuthOthers                = "others"
)

const (
	ApiKeyTypeHeader = "header"
	ApiKeyTypeQuery  = "query"
)

type OAuth2Settings struct {
	OAuth2Type     string           `json:"oauth2_type,omitempty"`
	ClientID       string           `json:"client_id,omitempty"`
	TokenURL       string           `json:"token_url,omitempty"`
	Email          string           `json:"email,omitempty"`
	PrivateKeyID   string           `json:"private_key_id,omitempty"`
	Subject        string           `json:"subject,omitempty"`
	Scopes         []string         `json:"scopes,omitempty"`
	AuthStyle      oauth2.AuthStyle `json:"authStyle,omitempty"`
	ClientSecret   string
	PrivateKey     string
	EndpointParams map[string]string
}

type AWSAuthType string

const (
	AWSAuthTypeKeys AWSAuthType = "keys"
)

type AWSSettings struct {
	AuthType AWSAuthType `json:"authType"`
	Region   string      `json:"region"`
	Service  string      `json:"service"`
}

type ProxyType string

const (
	ProxyTypeNone ProxyType = "none"
	ProxyTypeEnv  ProxyType = "env"
	ProxyTypeUrl  ProxyType = "url"
)

type UnsecuredQueryHandlingMode string

const (
	UnsecuredQueryHandlingAllow UnsecuredQueryHandlingMode = "allow"
	UnsecuredQueryHandlingWarn  UnsecuredQueryHandlingMode = "warn"
	UnsecuredQueryHandlingDeny  UnsecuredQueryHandlingMode = "deny"
)

type InfinitySettings struct {
	UID                      string
	Name                     string
	IsMock                   bool
	AuthenticationMethod     string
	OAuth2Settings           OAuth2Settings
	BearerToken              string
	ApiKeyKey                string
	ApiKeyType               string
	ApiKeyValue              string
	AWSSettings              AWSSettings
	AWSAccessKey             string
	AWSSecretKey             string
	URL                      string
	BasicAuthEnabled         bool
	UserName                 string
	Password                 string
	ForwardOauthIdentity     bool
	CustomHeaders            map[string]string
	SecureQueryFields        map[string]string
	InsecureSkipVerify       bool
	ServerName               string
	TimeoutInSeconds         int64
	TLSClientAuth            bool
	TLSAuthWithCACert        bool
	TLSCACert                string
	TLSClientCert            string
	TLSClientKey             string
	ProxyType                ProxyType
	ProxyUrl                 string
	AllowedHosts             []string
	ReferenceData            []RefData
	CustomHealthCheckEnabled bool
	CustomHealthCheckUrl     string
	AzureBlobAccountUrl      string
	AzureBlobAccountName     string
	AzureBlobAccountKey      string
	UnsecuredQueryHandling   UnsecuredQueryHandlingMode
	PathEncodedURLsEnabled   bool
	// ProxyOpts is used for Secure Socks Proxy configuration
	ProxyOpts httpclient.Options
}

func (s *InfinitySettings) Validate() error {
	if (s.BasicAuthEnabled || s.AuthenticationMethod == AuthenticationMethodBasic || s.AuthenticationMethod == AuthenticationMethodDigestAuth) && s.Password == "" {
		return errors.New("invalid or empty password detected")
	}
	if s.AuthenticationMethod == AuthenticationMethodApiKey && (s.ApiKeyValue == "" || s.ApiKeyKey == "") {
		return errors.New("invalid API key specified")
	}
	if s.AuthenticationMethod == AuthenticationMethodBearerToken && s.BearerToken == "" {
		return errors.New("invalid or empty bearer token detected")
	}
	if s.AuthenticationMethod == AuthenticationMethodAzureBlob {
		if strings.TrimSpace(s.AzureBlobAccountName) == "" {
			return errors.New("invalid/empty azure blob account name")
		}
		if strings.TrimSpace(s.AzureBlobAccountKey) == "" {
			return errors.New("invalid/empty azure blob key")
		}
		return nil
	}
	if s.AuthenticationMethod == AuthenticationMethodAWS && s.AWSSettings.AuthType == AWSAuthTypeKeys {
		if strings.TrimSpace(s.AWSAccessKey) == "" {
			return errors.New("invalid/empty AWS access key")
		}
		if strings.TrimSpace(s.AWSSecretKey) == "" {
			return errors.New("invalid/empty AWS secret key")
		}
		return nil
	}
	if s.AuthenticationMethod != AuthenticationMethodNone && len(s.AllowedHosts) < 1 {
		return errors.New("configure allowed hosts in the authentication section")
	}
	if s.HaveSecureHeaders() && len(s.AllowedHosts) < 1 {
		return errors.New("configure allowed hosts in the authentication section")
	}
	return nil
}

func (s *InfinitySettings) HaveSecureHeaders() bool {
	if len(s.CustomHeaders) > 0 {
		for k := range s.CustomHeaders {
			if textproto.CanonicalMIMEHeaderKey(k) == "Accept" {
				continue
			}
			if textproto.CanonicalMIMEHeaderKey(k) == "Content-Type" {
				continue
			}
			return true
		}
		return false
	}
	return false
}

type RefData struct {
	Name string `json:"name,omitempty"`
	Data string `json:"data,omitempty"`
}

type InfinitySettingsJson struct {
	IsMock                   bool           `json:"is_mock,omitempty"`
	AuthenticationMethod     string         `json:"auth_method,omitempty"`
	APIKeyKey                string         `json:"apiKeyKey,omitempty"`
	APIKeyType               string         `json:"apiKeyType,omitempty"`
	OAuth2Settings           OAuth2Settings `json:"oauth2,omitempty"`
	AWSSettings              AWSSettings    `json:"aws,omitempty"`
	ForwardOauthIdentity     bool           `json:"oauthPassThru,omitempty"`
	InsecureSkipVerify       bool           `json:"tlsSkipVerify,omitempty"`
	ServerName               string         `json:"serverName,omitempty"`
	TLSClientAuth            bool           `json:"tlsAuth,omitempty"`
	TLSAuthWithCACert        bool           `json:"tlsAuthWithCACert,omitempty"`
	TimeoutInSeconds         int64          `json:"timeoutInSeconds,omitempty"`
	ProxyType                ProxyType      `json:"proxy_type,omitempty"`
	ProxyUrl                 string         `json:"proxy_url,omitempty"`
	ReferenceData            []RefData      `json:"refData,omitempty"`
	CustomHealthCheckEnabled bool           `json:"customHealthCheckEnabled,omitempty"`
	CustomHealthCheckUrl     string         `json:"customHealthCheckUrl,omitempty"`
	AzureBlobAccountUrl      string         `json:"azureBlobAccountUrl,omitempty"`
	AzureBlobAccountName     string         `json:"azureBlobAccountName,omitempty"`
	PathEncodedURLsEnabled   bool           `json:"pathEncodedUrlsEnabled,omitempty"`
	// Security
	AllowedHosts           []string                   `json:"allowedHosts,omitempty"`
	UnsecuredQueryHandling UnsecuredQueryHandlingMode `json:"unsecuredQueryHandling,omitempty"`
}

func LoadSettings(ctx context.Context, config backend.DataSourceInstanceSettings) (settings InfinitySettings, err error) {
	settings.UID = config.UID
	settings.Name = config.Name
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
		settings.IsMock = infJson.IsMock
		settings.AuthenticationMethod = infJson.AuthenticationMethod
		settings.OAuth2Settings = infJson.OAuth2Settings
		if settings.AuthenticationMethod == "oauth2" && settings.OAuth2Settings.OAuth2Type == "" {
			settings.OAuth2Settings.OAuth2Type = "client_credentials"
		}
		settings.ApiKeyKey = infJson.APIKeyKey
		settings.ApiKeyType = infJson.APIKeyType
		settings.AWSSettings = infJson.AWSSettings
		if settings.ApiKeyType == "" {
			settings.ApiKeyType = "header"
		}
		if val, ok := config.DecryptedSecureJSONData["apiKeyValue"]; ok {
			settings.ApiKeyValue = val
		}
		settings.ForwardOauthIdentity = infJson.ForwardOauthIdentity
		settings.InsecureSkipVerify = infJson.InsecureSkipVerify
		settings.ServerName = infJson.ServerName
		settings.TLSClientAuth = infJson.TLSClientAuth
		settings.TLSAuthWithCACert = infJson.TLSAuthWithCACert
		settings.TimeoutInSeconds = 60
		settings.ProxyType = infJson.ProxyType
		settings.ProxyUrl = infJson.ProxyUrl
		settings.PathEncodedURLsEnabled = infJson.PathEncodedURLsEnabled
		if settings.ProxyType == "" {
			settings.ProxyType = ProxyTypeEnv
		}
		if infJson.TimeoutInSeconds > 0 {
			settings.TimeoutInSeconds = infJson.TimeoutInSeconds
		}
		settings.UnsecuredQueryHandling = infJson.UnsecuredQueryHandling
		if settings.UnsecuredQueryHandling == "" {
			settings.UnsecuredQueryHandling = UnsecuredQueryHandlingWarn
		}
		if len(infJson.AllowedHosts) > 0 {
			settings.AllowedHosts = infJson.AllowedHosts
		}
	}
	settings.ReferenceData = infJson.ReferenceData
	settings.CustomHealthCheckEnabled = infJson.CustomHealthCheckEnabled
	settings.CustomHealthCheckUrl = infJson.CustomHealthCheckUrl
	settings.AzureBlobAccountUrl = infJson.AzureBlobAccountUrl
	settings.AzureBlobAccountName = infJson.AzureBlobAccountName
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
	if val, ok := config.DecryptedSecureJSONData["bearerToken"]; ok {
		settings.BearerToken = val
	}
	if val, ok := config.DecryptedSecureJSONData["awsAccessKey"]; ok {
		settings.AWSAccessKey = val
	}
	if val, ok := config.DecryptedSecureJSONData["awsSecretKey"]; ok {
		settings.AWSSecretKey = val
	}
	if val, ok := config.DecryptedSecureJSONData["azureBlobAccountKey"]; ok {
		settings.AzureBlobAccountKey = val
	}
	settings.CustomHeaders = GetSecrets(config, "httpHeaderName", "httpHeaderValue")
	settings.SecureQueryFields = GetSecrets(config, "secureQueryName", "secureQueryValue")
	settings.OAuth2Settings.EndpointParams = GetSecrets(config, "oauth2EndPointParamsName", "oauth2EndPointParamsValue")
	if settings.AuthenticationMethod == "" {
		settings.AuthenticationMethod = AuthenticationMethodNone
		if settings.BasicAuthEnabled {
			settings.AuthenticationMethod = AuthenticationMethodBasic
		}
		if settings.ForwardOauthIdentity {
			settings.AuthenticationMethod = AuthenticationMethodForwardOauth
		}
	}
	if settings.AuthenticationMethod == AuthenticationMethodAzureBlob && settings.AzureBlobAccountUrl == "" {
		settings.AzureBlobAccountUrl = "https://%s.blob.core.windows.net/"
	}

	// secure socks proxy config
	opts, err := config.HTTPClientOptions(ctx)
	if err != nil {
		return settings, err
	}
	settings.ProxyOpts = opts
	return
}

func GetSecrets(config backend.DataSourceInstanceSettings, secretType string, secretValue string) map[string]string {
	headers := make(map[string]string)
	JsonData := make(map[string]any)
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
