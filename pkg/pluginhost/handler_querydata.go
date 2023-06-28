package pluginhost

import (
	"context"
	"errors"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/transformations"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

// QueryData handles multiple queries and returns multiple responses.
func (ds *PluginHost) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "PluginHost.QueryData")
	defer span.End()
	response := backend.NewQueryDataResponse()
	client, err := getInstance(ctx, ds.im, req.PluginContext)
	if err != nil {
		backend.Logger.Error("error getting infinity instance", "error", err.Error())
		return response, fmt.Errorf("error getting infinity instance. %w", err)
	}
	for _, q := range req.Queries {
		res := backend.DataResponse{}
		query, err := models.LoadQuery(ctx, q, req.PluginContext)
		if err != nil {
			backend.Logger.Error("error un-marshaling the query", "error", err.Error())
			res.Error = fmt.Errorf("error un-marshaling the query. %w", err)
			response.Responses[q.RefID] = res
			continue
		}
		if query.Type == models.QueryTypeTransformations {
			response1, err := transformations.ApplyTransformations(query, response)
			if err != nil {
				return response, err
			}
			response = response1
			continue
		}
		res = QueryDataQuery(ctx, query, *client.client, req.Headers, req.PluginContext)
		response.Responses[q.RefID] = res
	}
	return response, nil
}

func QueryData(ctx context.Context, backendQuery backend.DataQuery, infClient infinity.Client, requestHeaders map[string]string, pluginContext backend.PluginContext) (response backend.DataResponse) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "QueryData")
	defer span.End()
	query, err := models.LoadQuery(ctx, backendQuery, pluginContext)
	if err != nil {
		backend.Logger.Error("error un-marshaling the query", "error", err.Error())
		response.Error = fmt.Errorf("error un-marshaling the query. %w", err)
		return response
	}
	return QueryDataQuery(ctx, query, infClient, requestHeaders, pluginContext)
}

func QueryDataQuery(ctx context.Context, query models.Query, infClient infinity.Client, requestHeaders map[string]string, pluginContext backend.PluginContext) (response backend.DataResponse) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "QueryDataQuery", trace.WithAttributes(
		attribute.String("type", string(query.Type)),
		attribute.String("source", string(query.Source)),
		attribute.String("parser", string(query.Parser)),
		attribute.String("url", string(query.URL)),
	))
	defer span.End()
	args := []interface{}{}
	args = append(args, "type", query.Type)
	args = append(args, "source", query.Source)
	args = append(args, "parser", query.Parser)
	args = append(args, "uql", query.UQL)
	args = append(args, "url", query.URL)
	args = append(args, "root_selector", query.RootSelector)
	args = append(args, "filterExpression", query.FilterExpression)
	args = append(args, "summarizeExpression", query.SummarizeExpression)
	args = append(args, "settings.AuthenticationMethod", infClient.Settings.AuthenticationMethod)
	args = append(args, "settings.OAuth2Settings.OAuth2Type", infClient.Settings.OAuth2Settings.OAuth2Type)
	backend.Logger.Info("performing QueryData in infinity datasource", args...)
	//region Frame Builder
	switch query.Type {
	case models.QueryTypeGSheets:
		sheetId := query.Spreadsheet
		sheetName := query.SheetName
		sheetRange := query.SheetRange
		if sheetName != "" {
			sheetRange = sheetName + "!" + sheetRange
		}
		if sheetId == "" {
			response.Error = errors.New("invalid or empty sheet ID")
			return response
		}
		query.URL = fmt.Sprintf("https://sheets.googleapis.com/v4/spreadsheets/%s?includeGridData=true&ranges=%s", sheetId, sheetRange)
		frame, err := infinity.GetFrameForURLSources(ctx, query, infClient, requestHeaders)
		if err != nil {
			response.Frames = append(response.Frames, frame)
			response.Error = fmt.Errorf("error getting data frame from google sheets. %w", err)
			return response
		}
		if frame != nil {
			response.Frames = append(response.Frames, frame)
		}
	default:
		query, _ := infinity.UpdateQueryWithReferenceData(ctx, query, infClient.Settings)
		switch query.Source {
		case "url":
			if infClient.Settings.AuthenticationMethod != models.AuthenticationMethodNone && len(infClient.Settings.AllowedHosts) < 1 {
				response.Error = errors.New("datasource is missing allowed hosts/URLs. Configure it in the datasource settings page for enhanced security")
				return response
			}
			if infClient.Settings.HaveSecureHeaders() && len(infClient.Settings.AllowedHosts) < 1 {
				response.Error = errors.New("datasource is missing allowed hosts/URLs. Configure it in the datasource settings page for enhanced security")
				return response
			}
			frame, err := infinity.GetFrameForURLSources(ctx, query, infClient, requestHeaders)
			if err != nil {
				if frame != nil {
					frame, _ = infinity.WrapMetaForRemoteQuery(ctx, frame, err, query)
					response.Frames = append(response.Frames, frame)
				}
				response.Error = fmt.Errorf("error getting data frame. %w", err)
				return response
			}
			if frame != nil && infClient.Settings.AuthenticationMethod != models.AuthenticationMethodNone && infClient.Settings.AuthenticationMethod != "" && len(infClient.Settings.AllowedHosts) < 1 {
				frame.AppendNotices(data.Notice{
					Text: "Datasource is missing allowed hosts/URLs. Configure it in the datasource settings page for enhanced security.",
				})
			}
			if frame != nil {
				frame, _ = infinity.WrapMetaForRemoteQuery(ctx, frame, nil, query)
				response.Frames = append(response.Frames, frame)
			}
		case "inline":
			frame, err := infinity.GetFrameForInlineSources(query)
			if err != nil {
				frame, _ := infinity.WrapMetaForInlineQuery(frame, err, query)
				response.Frames = append(response.Frames, frame)
				response.Error = fmt.Errorf("error getting data frame from inline data. %w", err)
				return response
			}
			if frame != nil {
				frame, _ := infinity.WrapMetaForInlineQuery(frame, nil, query)
				response.Frames = append(response.Frames, frame)
			}
		default:
			frame := infinity.GetDummyFrame(query)
			if frame != nil {
				response.Frames = append(response.Frames, frame)
			}
		}
	}
	//endregion
	return response
}
