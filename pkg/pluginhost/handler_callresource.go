package pluginhost

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
)

func (host *DataSource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	a := httpadapter.New(host.getRouter())
	return a.CallResource(ctx, req, sender)
}

func (host *DataSource) getRouter() *http.ServeMux {
	router := http.NewServeMux()
	router.HandleFunc("GET /reference-data", host.withDatasourceHandlerFunc(getReferenceDataHandler))
	router.HandleFunc("GET /ping", host.withDatasourceHandlerFunc(getPingHandler))
	router.HandleFunc("/", host.withDatasourceHandlerFunc(defaultHandler))
	return router
}

func (host *DataSource) withDatasourceHandlerFunc(getHandler func(d *infinity.Client) http.HandlerFunc) func(rw http.ResponseWriter, r *http.Request) {
	return func(rw http.ResponseWriter, r *http.Request) {
		h := getHandler(host.client)
		h.ServeHTTP(rw, r)
	}
}

func getReferenceDataHandler(client *infinity.Client) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		referenceKeys := []string{}
		for _, k := range client.Settings.ReferenceData {
			referenceKeys = append(referenceKeys, k.Name)
		}
		writeResponse(referenceKeys, nil, w, http.StatusOK)
	})
}

func getPingHandler(client *infinity.Client) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		writeResponse("pong", nil, rw, http.StatusOK)
	}
}

func defaultHandler(client *infinity.Client) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		writeResponse(map[string]any{"error": "not a known resource call"}, nil, rw, http.StatusNotFound)
	}
}

func writeResponse(resp interface{}, err error, rw http.ResponseWriter, statusCode int) {
	rw.WriteHeader(statusCode)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}
	if str, ok := resp.(string); ok {
		rw.Header().Set("Content-Type", "text/plain")
		_, _ = rw.Write([]byte(str))
		return
	}
	b, err := json.Marshal(resp)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}
	rw.Header().Set("Content-Type", "application/json")
	_, _ = rw.Write(b)
}
