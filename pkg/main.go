package main

import (
	"os"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"

	"github.com/grafana/grafana-infinity-datasource/pkg/pluginhost"
)

const pluginID = "yesoreyeram-infinity-datasource"

func main() {
	if err := backend.SetupTracer(pluginID, tracing.Opts{}); err != nil {
		backend.Logger.Error("error setting up tracer", "error", err.Error())
	}
	if err := datasource.Serve(pluginhost.NewDatasource()); err != nil {
		backend.Logger.Error("error starting infinity plugin", "error", err.Error())
		os.Exit(1)
	}
}
