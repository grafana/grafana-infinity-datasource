package main

import (
	"os"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
)

func main() {
	backend.SetupPluginEnvironment(infinity.PluginID)
	err := datasource.Serve(infinity.NewDatasource())
	if err != nil {
		backend.Logger.Error("error loading plugin", "pluginId", infinity.PluginID)
		os.Exit(1)
	}
}
