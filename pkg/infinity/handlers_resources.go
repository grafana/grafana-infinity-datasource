package infinity

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
)

func (ds *InfinityDatasource) proxyHandler(rw http.ResponseWriter, req *http.Request) {
	pluginContext := httpadapter.PluginConfigFromContext(req.Context())
	dsi, err := ds.getDatasourceInstance(context.Background(), pluginContext)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}
	if req.Method == http.MethodPost {
		query := InfinityQuery{}
		err = json.NewDecoder(req.Body).Decode(&query)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		if query.Source == "url" {
			response, err := dsi.client.GetResults(query)
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
