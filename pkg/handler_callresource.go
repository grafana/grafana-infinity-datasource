package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
)

func (host *PluginHost) getRouter() *mux.Router {
	router := mux.NewRouter()
	router.HandleFunc("/proxy", host.withDatasourceHandler(GetProxyHandler)).Methods("POST")
	router.NotFoundHandler = http.HandlerFunc(host.withDatasourceHandler(defaultHandler))
	return router
}

func (host *PluginHost) withDatasourceHandler(getHandler func(d *instanceSettings) http.HandlerFunc) func(rw http.ResponseWriter, r *http.Request) {
	return func(rw http.ResponseWriter, r *http.Request) {
		client, err := getInstanceFromRequest(host.im, r)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		h := getHandler(client)
		h.ServeHTTP(rw, r)
	}
}

func GetProxyHandler(client *instanceSettings) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			var query infinity.Query
			err := json.NewDecoder(r.Body).Decode(&query)
			if err != nil {
				http.Error(rw, err.Error(), http.StatusInternalServerError)
				return
			}
			if query.Source == "url" {
				response, _, _, err := client.client.GetResults(query, map[string]string{})
				if err != nil {
					http.Error(rw, err.Error(), http.StatusInternalServerError)
					return
				}
				fmt.Fprintf(rw, "%s", response)
				return
			}
			http.Error(rw, "unknown query", http.StatusNotImplemented)
			return
		}
		http.Error(rw, "500 - Something bad happened! Invalid query.", http.StatusInternalServerError)
	}
}

func defaultHandler(client *instanceSettings) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		http.Error(rw, "not a known resource call", http.StatusInternalServerError)
	}
}
