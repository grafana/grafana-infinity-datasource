package infinity

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/infinity-libs/lib/go/jsonframer"
	"github.com/grafana/infinity-libs/lib/go/transformations"
)

func GetFrameForURLSources(ctx context.Context, pCtx *backend.PluginContext, query models.Query, infClient Client, requestHeaders map[string]string) (*data.Frame, error) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "GetFrameForURLSources")
	defer span.End()
	if query.Type == models.QueryTypeJSON && query.Parser == models.InfinityParserBackend && query.PageMode != models.PaginationModeNone && query.PageMode != "" {
		return GetPaginatedResults(ctx, pCtx, query, infClient, requestHeaders)
	}
	frame, _, err := GetFrameForURLSourcesWithPostProcessing(ctx, pCtx, query, infClient, requestHeaders, true)
	return frame, err
}

func GetPaginatedResults(ctx context.Context, pCtx *backend.PluginContext, query models.Query, infClient Client, requestHeaders map[string]string) (*data.Frame, error) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "GetPaginatedResults")
	defer span.End()
	frames := []*data.Frame{}
	queries := []models.Query{}
	var errs error
	switch query.PageMode {
	case models.PaginationModeOffset:
		for pageNumber := 1; pageNumber <= query.PageMaxPages; pageNumber++ {
			offset := query.PageParamOffsetFieldVal + ((pageNumber - 1) * query.PageParamSizeFieldVal)
			currentQuery := query
			currentQuery = ApplyPaginationItemToQuery(currentQuery, query.PageParamSizeFieldType, query.PageParamSizeFieldName, fmt.Sprintf("%d", query.PageParamSizeFieldVal))
			currentQuery = ApplyPaginationItemToQuery(currentQuery, query.PageParamOffsetFieldType, query.PageParamOffsetFieldName, fmt.Sprintf("%d", offset))
			queries = append(queries, currentQuery)
		}
	case models.PaginationModePage:
		initialPageNumber := query.PageParamPageFieldVal
		if initialPageNumber == 0 {
			initialPageNumber = 1
		}
		for pageNumber := 0; pageNumber < query.PageMaxPages; pageNumber++ {
			currentQuery := query
			currentQuery = ApplyPaginationItemToQuery(currentQuery, query.PageParamSizeFieldType, query.PageParamSizeFieldName, fmt.Sprintf("%d", query.PageParamSizeFieldVal))
			currentQuery = ApplyPaginationItemToQuery(currentQuery, query.PageParamPageFieldType, query.PageParamPageFieldName, fmt.Sprintf("%d", initialPageNumber+pageNumber))
			queries = append(queries, currentQuery)
		}
	case models.PaginationModeList:
		listOfVars := strings.Split(strings.TrimSuffix(query.PageParamListFieldValue, ","), ",")
		for i, listItem := range listOfVars {
			if i >= query.PageMaxPages {
				continue
			}
			currentQuery := query
			currentQuery = ApplyPaginationItemToQuery(currentQuery, query.PageParamListFieldType, query.PageParamListFieldName, strings.TrimSpace(listItem))
			queries = append(queries, currentQuery)
		}
	case models.PaginationModeCursor:
		queries = append(queries, query)
	default:
		frame, _, err := GetFrameForURLSourcesWithPostProcessing(ctx, pCtx, query, infClient, requestHeaders, true)
		return frame, err
	}
	if query.PageMode != models.PaginationModeCursor {
		for _, currentQuery := range queries {
			frame, _, err := GetFrameForURLSourcesWithPostProcessing(ctx, pCtx, currentQuery, infClient, requestHeaders, false)
			frames = append(frames, frame)
			errs = errors.Join(errs, err)
		}
	}
	if query.PageMode == models.PaginationModeCursor {
		i := 0
		oCursor := ""
		for {
			currentQuery := query
			if i > 0 && oCursor != "" {
				currentQuery = ApplyPaginationItemToQuery(currentQuery, query.PageParamCursorFieldType, query.PageParamCursorFieldName, oCursor)
			}
			if i > query.PageMaxPages || (i > 0 && oCursor == "") {
				break
			}
			i++
			frame, cursor, err := GetFrameForURLSourcesWithPostProcessing(ctx, pCtx, currentQuery, infClient, requestHeaders, false)
			oCursor = cursor
			frames = append(frames, frame)
			errs = errors.Join(errs, err)
		}
	}
	if errs != nil {
		return nil, errs
	}
	mergedFrame, err := transformations.Merge(frames, transformations.MergeFramesOptions{})
	if err != nil {
		return nil, err
	}
	return PostProcessFrame(ctx, mergedFrame, query)
}

func ApplyPaginationItemToQuery(currentQuery models.Query, fieldType models.PaginationParamType, fieldName string, fieldValue string) models.Query {
	if strings.TrimSpace(fieldValue) == "" {
		return currentQuery
	}
	field := models.URLOptionKeyValuePair{Key: fieldName, Value: fieldValue}
	switch fieldType {
	case models.PaginationParamTypeHeader:
		currentQuery.URLOptions.Headers = append(currentQuery.URLOptions.Headers, field)
	case models.PaginationParamTypeBodyData:
		currentQuery.URLOptions.BodyForm = append(currentQuery.URLOptions.BodyForm, field)
	case models.PaginationParamTypeReplace:
		currentQuery.URL = strings.ReplaceAll(currentQuery.URL, fieldName, field.Value)
		currentQuery.URLOptions.Body = strings.ReplaceAll(currentQuery.URLOptions.Body, fieldName, field.Value)
		currentQuery.URLOptions.BodyGraphQLQuery = strings.ReplaceAll(currentQuery.URLOptions.BodyGraphQLQuery, fieldName, fieldValue)
		for headerIndex, header := range currentQuery.URLOptions.Headers {
			currentQuery.URLOptions.Headers[headerIndex].Key = strings.ReplaceAll(header.Key, fieldName, field.Value)
			currentQuery.URLOptions.Headers[headerIndex].Value = strings.ReplaceAll(header.Value, fieldName, field.Value)
		}
		for paramIndex, param := range currentQuery.URLOptions.Params {
			currentQuery.URLOptions.Params[paramIndex].Key = strings.ReplaceAll(param.Key, fieldName, field.Value)
			currentQuery.URLOptions.Params[paramIndex].Value = strings.ReplaceAll(param.Value, fieldName, field.Value)
		}
		for bodyFormIndex, bodyFormItem := range currentQuery.URLOptions.BodyForm {
			currentQuery.URLOptions.BodyForm[bodyFormIndex].Key = strings.ReplaceAll(bodyFormItem.Key, fieldName, field.Value)
			currentQuery.URLOptions.BodyForm[bodyFormIndex].Value = strings.ReplaceAll(bodyFormItem.Value, fieldName, field.Value)
		}
	default:
		currentQuery.URLOptions.Params = append(currentQuery.URLOptions.Params, field)
	}
	return currentQuery
}

func GetFrameForURLSourcesWithPostProcessing(ctx context.Context, pCtx *backend.PluginContext, query models.Query, infClient Client, requestHeaders map[string]string, postProcessingRequired bool) (*data.Frame, string, error) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "GetFrameForURLSourcesWithPostProcessing")
	logger := backend.Logger.FromContext(ctx)
	defer span.End()
	frame := GetDummyFrame(query)
	cursor := ""
	urlResponseObject, statusCode, duration, err := infClient.GetResults(ctx, pCtx, query, requestHeaders)
	frame.Meta.ExecutedQueryString = infClient.GetExecutedURL(ctx, query)
	if infClient.IsMock {
		duration = 123
	}
	if err != nil {
		span.RecordError(err)
		span.SetStatus(500, err.Error())
		frame.Meta.Custom = &CustomMeta{
			Data:                   urlResponseObject,
			ResponseCodeFromServer: statusCode,
			Duration:               duration,
			Query:                  query,
			Error:                  err.Error(),
		}
		return frame, cursor, err
	}
	if query.Type == models.QueryTypeGSheets {
		if frame, err = GetGoogleSheetsResponse(ctx, urlResponseObject, query); err != nil {
			return frame, cursor, err
		}
	}
	if query.Parser == "backend" {
		if query.Type == models.QueryTypeJSON || query.Type == models.QueryTypeGraphQL {
			if frame, err = GetJSONBackendResponse(ctx, urlResponseObject, query); err != nil {
				return frame, cursor, err
			}
		}
		if query.Type == models.QueryTypeCSV || query.Type == models.QueryTypeTSV {
			if responseString, ok := urlResponseObject.(string); ok {
				if frame, err = GetCSVBackendResponse(ctx, responseString, query); err != nil {
					return frame, cursor, err
				}
			}
		}
		if query.Type == models.QueryTypeXML || query.Type == models.QueryTypeHTML {
			if responseString, ok := urlResponseObject.(string); ok {
				if frame, err = GetXMLBackendResponse(ctx, responseString, query); err != nil {
					return frame, cursor, err
				}
			}
		}
		if postProcessingRequired {
			frame, err = PostProcessFrame(ctx, frame, query)
		}
	}
	if frame.Meta == nil {
		frame.Meta = &data.FrameMeta{}
	}
	frame.Meta.ExecutedQueryString = infClient.GetExecutedURL(ctx, query)
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
		logger.Error("error getting response for query", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{
			Data:                   urlResponseObject,
			ResponseCodeFromServer: statusCode,
			Duration:               duration,
			Query:                  query,
			Error:                  err.Error(),
		}
		return frame, cursor, err
	}
	if query.PageMode == models.PaginationModeCursor && strings.TrimSpace(query.PageParamCursorFieldExtractionPath) != "" {
		body, err := json.Marshal(urlResponseObject)
		if err != nil {
			return frame, cursor, backend.PluginError(errors.New("error while finding the cursor value"))
		}
		cursor, err = jsonframer.GetRootData(string(body), query.PageParamCursorFieldExtractionPath)
		if err != nil {
			return frame, cursor, backend.PluginError(errors.New("error while extracting the cursor value"))
		}
	}
	return frame, cursor, nil
}
