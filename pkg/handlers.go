package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
)

func (td *InfinityDatasource) proxyHandler(rw http.ResponseWriter, req *http.Request) {
	client, err := getInstanceFromRequest(td.im, req)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}
	if req.Method == http.MethodPost {
		var query infinity.Query
		err = json.NewDecoder(req.Body).Decode(&query)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		if query.Source == "url" {
			response, err := client.client.GetResults(query)
			if err != nil {
				http.Error(rw, err.Error(), http.StatusInternalServerError)
				return
			}
			fmt.Fprintf(rw, "%s", response)
			return
		}
		if query.Source == "local-fs" {
			response, err := client.client.GetLocalFileContent(query)
			if err != nil {
				http.Error(rw, err.Error(), http.StatusInternalServerError)
				return
			}
			fmt.Fprintf(rw, "%s", response)
			return
		}
		fmt.Fprintf(rw, "unknown query")
		return
	}
	rw.WriteHeader(http.StatusNotImplemented)
	_, _ = rw.Write([]byte("500 - Something bad happened! Invalid query."))
}
