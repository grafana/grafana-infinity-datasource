package infinity

import (
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
)

func GetFrameForURLSources(query querySrv.Query, infClient Client, requestHeaders map[string]string) (*data.Frame, error) {
	frame := GetDummyFrame(query)
	urlResponseObject, statusCode, duration, err := infClient.GetResults(query, requestHeaders)
	if query.Type == querySrv.QueryTypeJSONBackend {
		return GetJSONBackendResponse(urlResponseObject, query)
	}
	frame.Meta.ExecutedQueryString = infClient.GetExecutedURL(query)
	if infClient.IsMock {
		duration = 123
	}
	frame.Meta.Custom = &CustomMeta{
		Query:                  query,
		Data:                   urlResponseObject,
		ResponseCodeFromServer: statusCode,
		Duration:               duration,
	}
	if err != nil {
		backend.Logger.Error("error getting response for query", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{
			Data:                   urlResponseObject,
			ResponseCodeFromServer: statusCode,
			Duration:               duration,
			Query:                  query,
			Error:                  err.Error(),
		}
		return frame, err
	}
	return frame, nil
}
