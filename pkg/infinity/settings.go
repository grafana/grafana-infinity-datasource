package infinity

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type LocalSourcesOptions struct {
	Enabled      bool     `json:"enabled"`
	AllowedPaths []string `json:"allowed_paths"`
}

type InfinitySettings struct {
	URL                string
	BasicAuthEnabled   bool
	UserName           string
	Password           string
	CustomHeaders      map[string]string
	SecureQueryFields  map[string]string
	InsecureSkipVerify bool
	ServerName         string
	TLSClientAuth      bool
	TLSAuthWithCACert  bool
	TLSCACert          string
	TLSClientCert      string
	TLSClientKey       string
	LocalSources       LocalSourcesOptions
}

type InfinitySettingsJson struct {
	InsecureSkipVerify bool                `json:"tlsSkipVerify,omitempty"`
	ServerName         string              `json:"serverName,omitempty"`
	TLSClientAuth      bool                `json:"tlsClientAuth,omitempty"`
	TLSAuthWithCACert  bool                `json:"tlsAuthWithCACert,omitempty"`
	LocalSources       LocalSourcesOptions `json:"local_sources_options,omitempty"`
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
		settings.InsecureSkipVerify = infJson.InsecureSkipVerify
		settings.ServerName = infJson.ServerName
		settings.TLSClientAuth = infJson.TLSClientAuth
		settings.TLSAuthWithCACert = infJson.TLSAuthWithCACert
		settings.LocalSources = infJson.LocalSources
	}
	if val, ok := config.DecryptedSecureJSONData["basicAuthPassword"]; ok {
		settings.Password = val
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
