package main

import (
	"os"

	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"

	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/pluginhost"
)

func main() {
	err := datasource.Serve(pluginhost.NewDatasource())
	if err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}
