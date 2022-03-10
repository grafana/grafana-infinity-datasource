package main

import (
	"os"

	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

func main() {
	err := datasource.Serve(newDatasource())
	if err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}
