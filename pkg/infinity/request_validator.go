package infinity

import (
	"context"
	"net/http"
	"strings"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// ValidateRequest is a basic implementation of request validator / interceptor
func ValidateRequest(ctx context.Context, pCtx *backend.PluginContext, settings models.InfinitySettings, req *http.Request) error {
	hostName := req.URL.Hostname()
	if hostName == "" {
		return nil
	}

	//#region denied list of hosts from the grafana config / environment variable
	// if the host name of URL found in denied list of hosts grafana config, the URL should be blocked
	deniedHostsSettingFromGrafana := getHostNamesFromConfig(ctx, pCtx, "host_deny_list")
	if len(deniedHostsSettingFromGrafana) > 0 {
		deny := false
		for _, deniedHost := range deniedHostsSettingFromGrafana {
			if strings.EqualFold(hostName, strings.TrimSpace(deniedHost)) {
				deny = true
			}
		}
		if deny {
			return models.ErrHostNameDenied(hostName)
		}
	}
	//#endregion

	//#region allowed list of hosts from the grafana config / environment variable
	// if the host name of URL not found in allowed list of hosts grafana config, the URL should be blocked
	allowedHostsSettingFromGrafana := getHostNamesFromConfig(ctx, pCtx, "host_allow_list")
	if len(allowedHostsSettingFromGrafana) > 0 {
		allow := false
		for _, allowedHost := range allowedHostsSettingFromGrafana {
			if strings.EqualFold(hostName, strings.TrimSpace(allowedHost)) {
				allow = true
			}
		}
		if !allow {
			return models.ErrHostNameNotAllowed(hostName)
		}
	}
	//#endregion

	//#region allowed list of hosts from the grafana config / environment variable
	allowedHostsFromDsConfig := settings.AllowedHosts
	if len(allowedHostsFromDsConfig) > 0 {
		allow := false
		for _, host := range allowedHostsFromDsConfig {
			if strings.HasPrefix(req.URL.String(), host) {
				allow = true
			}
		}
		if !allow {
			return models.ErrURLNotAllowed
		}
	}
	//#endregion

	return nil
}

func getHostNamesFromConfig(ctx context.Context, pCtx *backend.PluginContext, key string) (out []string) {
	hostNamesConfig := strings.TrimSpace(models.GetGrafanaConfig(ctx, pCtx, key))
	if hostNamesConfig == "" {
		return out
	}
	hostNames := strings.Split(hostNamesConfig, " ")
	for _, k := range hostNames {
		if key := strings.TrimSpace(k); key != "" {
			out = append(out, key)
		}
	}
	return out
}
