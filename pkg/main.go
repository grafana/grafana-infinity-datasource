package main

import (
	"os"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-infinity-datasource/pkg/pluginhost"
)

func main() {
	dsOptions := datasource.ManageOpts{
		TracingOpts: tracing.Opts{},
	}
	if err := datasource.Manage(models.PluginID, pluginhost.NewDataSourceInstance, dsOptions); err != nil {
		backend.Logger.Error("error starting infinity plugin", "error", err.Error())
		os.Exit(1)
	}
}
