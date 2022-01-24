package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
)

func newDatasource() datasource.ServeOpts {
	handler := &InfinityDatasource{
		im: datasource.NewInstanceManager(newDataSourceInstance),
	}
	router := mux.NewRouter()
	router.HandleFunc("/proxy", handler.proxyHandler)
	return datasource.ServeOpts{
		QueryDataHandler:    handler,
		CheckHealthHandler:  handler,
		CallResourceHandler: httpadapter.New(router),
	}
}

// InfinityDatasource is an example datasource used to scaffold
type InfinityDatasource struct {
	im instancemgmt.InstanceManager
}

// CheckHealth handles health checks sent from Grafana to the plugin.
func (ds *InfinityDatasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Settings saved",
	}, nil
}

// QueryData handles multiple queries and returns multiple responses.
func (ds *InfinityDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()
	client, err := getInstance(ds.im, req.PluginContext)
	if err != nil {
		return response, err
	}
	for _, q := range req.Queries {
		res := QueryData(ctx, q, *client.client)
		response.Responses[q.RefID] = res
	}
	return response, nil
}

func QueryData(ctx context.Context, backendQuery backend.DataQuery, infClient infinity.Client) (response backend.DataResponse) {
	var query infinity.Query
	response.Error = json.Unmarshal(backendQuery.JSON, &query)
	if response.Error != nil {
		return response
	}
	frame := data.NewFrame("response")
	frame.Meta = &data.FrameMeta{
		ExecutedQueryString: "If you are looking to inspect the response from the server, use browser developer tools, network tab. You will see a call to `proxy` route which is the actual call made.",
	}
	if query.Source == "url" {
		response, err := infClient.GetResults(query)
		frame.Meta.ExecutedQueryString = query.URL
		frame.Meta.Custom = map[string]interface{}{
			"response": response,
			"error":    err,
		}
	}
	response.Frames = append(response.Frames, frame)
	return response
}

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
		http.Error(rw, "unknown query", http.StatusNotImplemented)
		return
	}
	http.Error(rw, "500 - Something bad happened! Invalid query.", http.StatusInternalServerError)
}
