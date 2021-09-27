package infinity

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type InfinityConfig struct {
	URL                string
	BasicAuthEnabled   bool
	UserName           string
	Password           string
	CustomHeaders      map[string]string
	SecureQueryFields  map[string]string
	InsecureSkipVerify bool
	ServerName         string
	TimeoutInSeconds   int64
	TlsClientAuth      bool
	TlsAuthWithCACert  bool
	TlsCACert          string
	TlsClientCert      string
	TlsClientKey       string
}

func (ic *InfinityConfig) validate() error {
	return ErrorNotImplemented
}

type infinitySettingsJson struct {
	InsecureSkipVerify bool   `json:"tlsSkipVerify,omitempty"`
	ServerName         string `json:"serverName,omitempty"`
	TLSClientAuth      bool   `json:"tlsClientAuth,omitempty"`
	TLSAuthWithCACert  bool   `json:"tlsAuthWithCACert,omitempty"`
	TimeoutInSeconds   int64  `json:"timeoutInSeconds,omitempty"`
}

func GetSettings(config backend.DataSourceInstanceSettings) (*InfinityConfig, error) {
	settings := &InfinityConfig{
		URL:              config.URL,
		BasicAuthEnabled: config.BasicAuthEnabled,
		UserName:         config.BasicAuthUser,
	}
	if config.URL == Ignore_URL {
		settings.URL = ""
	}
	infJson := infinitySettingsJson{}
	if config.JSONData != nil {
		if err := json.Unmarshal(config.JSONData, &infJson); err != nil {
			return settings, err
		}
		settings.InsecureSkipVerify = infJson.InsecureSkipVerify
		settings.ServerName = infJson.ServerName
		settings.TlsClientAuth = infJson.TLSClientAuth
		settings.TlsAuthWithCACert = infJson.TLSAuthWithCACert
		settings.TimeoutInSeconds = 60
		if infJson.TimeoutInSeconds > 0 {
			settings.TimeoutInSeconds = infJson.TimeoutInSeconds
		}
	}
	if val, ok := config.DecryptedSecureJSONData["basicAuthPassword"]; ok {
		settings.Password = val
	}
	if val, ok := config.DecryptedSecureJSONData["tlsCACert"]; ok {
		settings.TlsCACert = val
	}
	if val, ok := config.DecryptedSecureJSONData["tlsClientCert"]; ok {
		settings.TlsClientCert = val
	}
	if val, ok := config.DecryptedSecureJSONData["tlsClientKey"]; ok {
		settings.TlsClientKey = val
	}
	settings.CustomHeaders = GetSecrets(config, "httpHeaderName", "httpHeaderValue")
	settings.SecureQueryFields = GetSecrets(config, "secureQueryName", "secureQueryValue")
	return settings, nil
}

func GetSecrets(config backend.DataSourceInstanceSettings, secretType string, secretValue string) map[string]string {
	headers := make(map[string]string)
	JsonData := make(map[string]interface{})
	if err := json.Unmarshal(config.JSONData, &JsonData); err != nil {
		return headers
	}
	if len(JsonData) == 0 {
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
