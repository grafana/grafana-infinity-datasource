package main

import (
	"os"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"

	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/pluginhost"
)

func main() {

	if err := backend.SetupTracer("Infinity plugin", tracing.Opts{}); err != nil {
		backend.Logger.Error("error setting up tracer", "error", err.Error())
	}

	err := datasource.Serve(pluginhost.NewDatasource())
	if err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}
