package infinity

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-framer/jsonFramer"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
)

func GetFrameForURLSources(ctx context.Context, query querySrv.Query, infClient Client, requestHeaders map[string]string) (*data.Frame, error) {
	frame := GetDummyFrame(query)
	urlResponseObject, statusCode, duration, err := infClient.GetResults(ctx, query, requestHeaders)
	frame.Meta.ExecutedQueryString = infClient.GetExecutedURL(query)
	if infClient.IsMock {
		duration = 123
	}
	if err != nil {
		frame.Meta.Custom = &CustomMeta{
			Data:                   urlResponseObject,
			ResponseCodeFromServer: statusCode,
			Duration:               duration,
			Query:                  query,
			Error:                  err.Error(),
		}
		return frame, err
	}
	if query.Type == querySrv.QueryTypeGSheets {
		if frame, err = GetGoogleSheetsResponse(urlResponseObject, query); err != nil {
			return frame, err
		}
	}
	if (query.Type == querySrv.QueryTypeJSON || query.Type == querySrv.QueryTypeGraphQL) && query.Parser == "backend" {
		if frame, err = GetJSONBackendResponse(urlResponseObject, query); err != nil {
			return frame, err
		}
	}
	if (query.Type == querySrv.QueryTypeCSV || query.Type == querySrv.QueryTypeTSV) && query.Parser == "backend" {
		if responseString, ok := urlResponseObject.(string); ok {
			if frame, err = GetCSVBackendResponse(responseString, query); err != nil {
				return frame, err
			}
		}
	}
	if (query.Type == querySrv.QueryTypeXML || query.Type == querySrv.QueryTypeHTML) && query.Parser == "backend" {
		if responseString, ok := urlResponseObject.(string); ok {
			if frame, err = GetXMLBackendResponse(responseString, query); err != nil {
				return frame, err
			}
		}
	}
	if query.Type == querySrv.QueryTypeJSON && query.Parser == "sqlite" {
		sqliteQuery := query.SQLiteQuery
		if strings.TrimSpace(sqliteQuery) == "" {
			sqliteQuery = "SELECT * FROM input"
		}
		body, err := json.Marshal(urlResponseObject)
		if err != nil {
			return frame, fmt.Errorf("error while marshaling the response object. %w", err)
		}
		if frame, err = jsonFramer.JsonStringToFrame(string(body), jsonFramer.JSONFramerOptions{
			FramerType:   jsonFramer.FramerTypeSQLite3,
			SQLite3Query: sqliteQuery,
			RootSelector: query.RootSelector,
		}); err != nil {
			return frame, err
		}
	}
	if frame.Meta == nil {
		frame.Meta = &data.FrameMeta{}
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
