package infinity

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type DataSourceMode string

const (
	DataSourceModeBasic    DataSourceMode = "basic"
	DataSourceModeAdvanced DataSourceMode = "advanced"
)

type InfinitySettings struct {
	DatasourceMode    DataSourceMode
	URL               string
	UserName          string
	Password          string
	CustomHeaders     map[string]string
	SecureQueryFields map[string]string
}

type InfinitySettingsJson struct {
	DataSourceMode string `json:"datasource_mode,omitempty"`
}

func LoadSettings(config backend.DataSourceInstanceSettings) (settings InfinitySettings, err error) {
	infJson := InfinitySettingsJson{}
	if config.JSONData != nil {
		if err := json.Unmarshal(config.JSONData, &infJson); err != nil {
			return settings, err
		}
	}
	settings.URL = config.URL
	settings.UserName = config.BasicAuthUser
	settings.DatasourceMode = DataSourceMode(infJson.DataSourceMode)
	val, ok := config.DecryptedSecureJSONData["basicAuthPassword"]
	settings.CustomHeaders = GetSecrets(config, "httpHeaderName", "httpHeaderValue")
	settings.SecureQueryFields = GetSecrets(config, "secureQueryName", "secureQueryValue")
	if ok {
		settings.Password = val
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
