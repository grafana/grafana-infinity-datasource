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
		response, err := client.client.GetResults(query)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		if query.Type == "json" || query.Type == "graphql" {
			queryJSON, err := json.MarshalIndent(response, "", "\t")
			if err != nil {
				http.Error(rw, err.Error(), http.StatusInternalServerError)
				return
			}
			fmt.Fprintf(rw, "%s", queryJSON)
			return
		}
		fmt.Fprintf(rw, "%s", response)
		return
	}
	rw.WriteHeader(http.StatusNotImplemented)
	rw.Write([]byte("500 - Something bad happened! Invalid query."))
}
