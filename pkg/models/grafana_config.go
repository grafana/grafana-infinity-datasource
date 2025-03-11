package models

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// GetGrafanaConfig allow you to retrieve config set via grafana.ini file
func GetGrafanaConfig(ctx context.Context, pCtx *backend.PluginContext, key string) (output string) {
	key = strings.TrimSpace(strings.ToUpper(key))
	if v := strings.TrimSpace(os.Getenv(fmt.Sprintf("GF_PLUGIN_%s", key))); v != "" {
		output = v
	}
	return output
}
