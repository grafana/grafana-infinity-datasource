package infinity

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func (ds *InfinityDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()
	_, err := ds.getDatasourceInstance(ctx, req.PluginContext)
	if err != nil {
		response.Responses["error"] = backend.DataResponse{Error: err}
		return response, nil
	}
	for _, q := range req.Queries {
		res := ds.query(ctx, req.PluginContext, q)
		response.Responses[q.RefID] = res
	}
	return response, nil
}

func (ds *InfinityDatasource) query(_ context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	_, err := GetQuery(query)
	if err != nil {
		return backend.DataResponse{Error: err}
	}
	return backend.DataResponse{Error: ErrorNotImplemented}
}
