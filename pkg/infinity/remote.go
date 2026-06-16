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

func isBackendQuery(query models.Query) bool {
	return query.Parser == models.InfinityParserBackend || query.Parser == models.InfinityParserJQBackend
}

const pageRequestRetries = 2

func canPaginateQuery(query models.Query) bool {
	// Keep pagination generic: allow any backend-parsed URL query type that our backend framers support.
	if !isBackendQuery(query) || query.PageMode == "" || query.PageMode == models.PaginationModeNone {
		return false
	}
	switch query.PageMode {
	case models.PaginationModeCursor:
		return query.Type == models.QueryTypeJSON || query.Type == models.QueryTypeGraphQL
	case models.PaginationModeOffset, models.PaginationModePage, models.PaginationModeList:
		return query.Type == models.QueryTypeJSON ||
			query.Type == models.QueryTypeGraphQL ||
			query.Type == models.QueryTypeCSV ||
			query.Type == models.QueryTypeTSV ||
			query.Type == models.QueryTypeXML ||
			query.Type == models.QueryTypeHTML
	default:
		return false
	}
}

func GetFrameForURLSources(ctx context.Context, pCtx *backend.PluginContext, query models.Query, infClient Client, requestHeaders map[string]string) (*data.Frame, error) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "GetFrameForURLSources")
	defer span.End()
	if canPaginateQuery(query) {
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
			frame, _, err := GetFrameForURLSourcesWithRetries(ctx, pCtx, currentQuery, infClient, requestHeaders, false)
			if err != nil {
				return nil, err
			}
			frames = append(frames, frame)
		}
	}
	if query.PageMode == models.PaginationModeCursor {
		oCursor := ""
		for pageNumber := 0; pageNumber < query.PageMaxPages; pageNumber++ {
			currentQuery := query
			// For replace-mode GraphQL cursors, page 1 should send null instead of a literal macro token.
			if pageNumber == 0 && query.PageParamCursorFieldType == models.PaginationParamTypeReplace {
				currentQuery = ApplyPaginationItemToQuery(currentQuery, query.PageParamCursorFieldType, query.PageParamCursorFieldName, "")
			}
			if pageNumber > 0 {
				if oCursor == "" {
					break
				}
				currentQuery = ApplyPaginationItemToQuery(currentQuery, query.PageParamCursorFieldType, query.PageParamCursorFieldName, oCursor)
			}
			frame, cursor, err := GetFrameForURLSourcesWithRetries(ctx, pCtx, currentQuery, infClient, requestHeaders, false)
			if err != nil {
				return nil, err
			}
			oCursor = cursor
			frames = append(frames, frame)
		}
	}
	mergedFrame, err := transformations.Merge(frames, transformations.MergeFramesOptions{})
	if err != nil {
		return nil, err
	}
	return PostProcessFrame(ctx, mergedFrame, query)
}

func GetFrameForURLSourcesWithRetries(ctx context.Context, pCtx *backend.PluginContext, query models.Query, infClient Client, requestHeaders map[string]string, postProcessingRequired bool) (*data.Frame, string, error) {
	var (
		frame  *data.Frame
		cursor string
		err    error
	)
	for attempt := 0; attempt <= pageRequestRetries; attempt++ {
		// Retry each page independently; on final failure we return the last page error.
		frame, cursor, err = GetFrameForURLSourcesWithPostProcessing(ctx, pCtx, query, infClient, requestHeaders, postProcessingRequired)
		if err == nil {
			return frame, cursor, nil
		}
	}
	return frame, cursor, err
}

func ApplyPaginationItemToQuery(query models.Query, fieldType models.PaginationParamType, fieldName string, fieldValue string) models.Query {
	if strings.TrimSpace(fieldName) == "" {
		return query
	}
	if strings.TrimSpace(fieldValue) == "" && fieldType != models.PaginationParamTypeReplace {
		return query
	}
	field := models.URLOptionKeyValuePair{Key: fieldName, Value: fieldValue}
	switch fieldType {
	case models.PaginationParamTypeHeader:
		query.URLOptions.Headers = append(query.URLOptions.Headers, field)
	case models.PaginationParamTypeBodyData:
		query.URLOptions.BodyForm = append(query.URLOptions.BodyForm, field)
	case models.PaginationParamTypeReplace:
		fieldNameUpdated := fmt.Sprintf(`${__pagination.%s}`, fieldName)
		if fieldValue == "" {
			// Replace quoted placeholder with JSON null to keep GraphQL variables payload valid.
			quotedToken := fmt.Sprintf(`"%s"`, fieldNameUpdated)
			query.URLOptions.BodyGraphQLVariables = strings.ReplaceAll(query.URLOptions.BodyGraphQLVariables, quotedToken, "null")
		}
		query.URL = strings.ReplaceAll(query.URL, fieldNameUpdated, field.Value)
		query.URLOptions.Body = strings.ReplaceAll(query.URLOptions.Body, fieldNameUpdated, field.Value)
		query.URLOptions.BodyGraphQLQuery = strings.ReplaceAll(query.URLOptions.BodyGraphQLQuery, fieldNameUpdated, fieldValue)
		query.URLOptions.BodyGraphQLVariables = strings.ReplaceAll(query.URLOptions.BodyGraphQLVariables, fieldNameUpdated, fieldValue)
		for headerIndex, header := range query.URLOptions.Headers {
			query.URLOptions.Headers[headerIndex].Key = strings.ReplaceAll(header.Key, fieldNameUpdated, field.Value)
			query.URLOptions.Headers[headerIndex].Value = strings.ReplaceAll(header.Value, fieldNameUpdated, field.Value)
		}
		for paramIndex, param := range query.URLOptions.Params {
			query.URLOptions.Params[paramIndex].Key = strings.ReplaceAll(param.Key, fieldNameUpdated, field.Value)
			query.URLOptions.Params[paramIndex].Value = strings.ReplaceAll(param.Value, fieldNameUpdated, field.Value)
		}
		for bodyFormIndex, bodyFormItem := range query.URLOptions.BodyForm {
			query.URLOptions.BodyForm[bodyFormIndex].Key = strings.ReplaceAll(bodyFormItem.Key, fieldNameUpdated, field.Value)
			query.URLOptions.BodyForm[bodyFormIndex].Value = strings.ReplaceAll(bodyFormItem.Value, fieldNameUpdated, field.Value)
		}
	case models.PaginationParamTypeQuery:
		fallthrough // It should go to default
	default:
		query.URLOptions.Params = append(query.URLOptions.Params, field)
	}
	return query
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
	if isBackendQuery(query) {
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
		framerType := jsonframer.FramerTypeGJSON
		if query.Parser == models.InfinityParserJQBackend {
			framerType = jsonframer.FramerTypeJQ
		}
		cursor, err = jsonframer.GetRootData(string(body), query.PageParamCursorFieldExtractionPath, framerType)
		if err != nil {
			return frame, cursor, backend.PluginError(errors.New("error while extracting the cursor value"))
		}
		hasNextPath := strings.TrimSuffix(query.PageParamCursorFieldExtractionPath, ".endCursor")
		if hasNextPath != query.PageParamCursorFieldExtractionPath {
			// If the payload exposes pageInfo.hasNextPage alongside endCursor, respect it as an explicit stop signal.
			hasNextValue, hasNextErr := jsonframer.GetRootData(string(body), hasNextPath+".hasNextPage", framerType)
			if hasNextErr == nil && strings.EqualFold(strings.TrimSpace(hasNextValue), "false") {
				cursor = ""
			}
		}
	}
	return frame, cursor, nil
}
