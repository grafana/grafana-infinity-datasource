package pluginhost

import (
	"encoding/json"
	"net/http"
)

func (host *PluginHost) getRouter() *http.ServeMux {
	router := http.NewServeMux()
	router.HandleFunc("GET /reference-data", host.withDatasourceHandlerFunc(getReferenceDataHandler))
	router.HandleFunc("GET /ping", host.withDatasourceHandlerFunc(getPingHandler))
	router.HandleFunc("/", host.withDatasourceHandlerFunc(defaultHandler))
	return router
}

func (host *PluginHost) withDatasourceHandlerFunc(getHandler func(d *instanceSettings) http.HandlerFunc) func(rw http.ResponseWriter, r *http.Request) {
	return func(rw http.ResponseWriter, r *http.Request) {
		client, err := getInstanceFromRequest(r.Context(), host.im, r)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		h := getHandler(client)
		h.ServeHTTP(rw, r)
	}
}

func getReferenceDataHandler(client *instanceSettings) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		referenceKeys := []string{}
		for _, k := range client.client.Settings.ReferenceData {
			referenceKeys = append(referenceKeys, k.Name)
		}
		writeResponse(referenceKeys, nil, w, http.StatusOK)
	})
}

func getPingHandler(client *instanceSettings) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		writeResponse("pong", nil, rw, http.StatusOK)
	}
}

func defaultHandler(client *instanceSettings) http.HandlerFunc {
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
