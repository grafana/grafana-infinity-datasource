package models

import (
	"fmt"
	"os"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// getSettingsFromEnvironment allow you to retrieve settings from grafana config / environment variable
func getSettingsFromEnvironment(pCtx *backend.PluginContext, key string) (output string) {

	key = strings.TrimSpace(strings.ToUpper(key))

	if v := strings.TrimSpace(os.Getenv(fmt.Sprintf("GF_PLUGIN_%s", key))); v != "" {
		output = v
	}

	if pCtx == nil {
		return output
	}

	pluginId := strings.TrimSpace(strings.ToUpper(pCtx.PluginID))
	if v := strings.TrimSpace(os.Getenv(fmt.Sprintf("GF_PLUGIN_%s_%s", pluginId, key))); v != "" && pluginId != "" {
		output = v
	}

	if pCtx.DataSourceInstanceSettings == nil {
		return output
	}

	dsUID := strings.TrimSpace(strings.ToUpper(pCtx.DataSourceInstanceSettings.UID))
	if v := strings.TrimSpace(os.Getenv(fmt.Sprintf("GF_DS_%s_%s", dsUID, key))); v != "" && dsUID != "" {
		output = v
	}

	caseSensitiveDsUID := strings.TrimSpace(pCtx.DataSourceInstanceSettings.UID)
	if v := strings.TrimSpace(os.Getenv(fmt.Sprintf("GF_DS_%s_%s", caseSensitiveDsUID, key))); v != "" && caseSensitiveDsUID != "" {
		output = v
	}

	return output
}
