package pluginhost

import (
	"context"
	"errors"
	"fmt"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

// QueryData handles multiple queries and returns multiple responses.
func (ds *DataSource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	logger := backend.Logger.FromContext(ctx)
	ctx, span := tracing.DefaultTracer().Start(ctx, "PluginHost.QueryData")
	defer span.End()
	response := backend.NewQueryDataResponse()
	if ds.client == nil {
		return response, backend.PluginError(errors.New("invalid infinity client"))
	}
	for _, q := range req.Queries {
		query, err := models.LoadQuery(ctx, q, req.PluginContext, ds.client.Settings)
		if err != nil {
			span.RecordError(err)
			logger.Error("error un-marshaling the query", "error", err.Error())
			// Here we are using error source from the original error and if it does not have any source we are using the plugin error as the default source
			errorRes := backend.ErrorResponseWithErrorSource(fmt.Errorf("%s: %w", "error un-marshaling the query", err))
			response.Responses[q.RefID] = errorRes
			continue
		}
		if query.Type == models.QueryTypeTransformations {
			response1, err := infinity.ApplyTransformations(query, response)
			if err != nil {
				logger.Error("error applying infinity query transformation", "error", err.Error())
				span.RecordError(err)
				span.SetStatus(500, err.Error())
				// We should have error source from the original error, but in a case it is not there, we are using the plugin error as the default source
				return response, backend.PluginError(fmt.Errorf("%s: %w", "error applying infinity query transformation", err))
			}
			response = response1
			continue
		}
		response.Responses[q.RefID] = QueryDataQuery(ctx, req.PluginContext, query, *ds.client, req.Headers)
	}
	return response, nil
}

func QueryDataQuery(ctx context.Context, pluginContext backend.PluginContext, query models.Query, infClient infinity.Client, requestHeaders map[string]string) (response backend.DataResponse) {
	logger := backend.Logger.FromContext(ctx)
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
	logger.Info("performing QueryData in infinity datasource", args...)
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
			return backend.ErrorResponseWithErrorSource(backend.DownstreamError(errors.New("invalid or empty sheet ID")))
		}
		query.URL = fmt.Sprintf("https://sheets.googleapis.com/v4/spreadsheets/%s?includeGridData=true&ranges=%s", sheetId, sheetRange)
		frame, err := infinity.GetFrameForURLSources(ctx, &pluginContext, query, infClient, requestHeaders)
		if err != nil {
			span.RecordError(err)
			span.SetStatus(500, err.Error())
			response.Frames = append(response.Frames, frame)
			wrappedError := fmt.Errorf("%s: %w", "error getting data frame from google sheets", err)
			response.Error = wrappedError
			// We should have error source from the original error, but in a case it is not there, we are using the plugin error as the default source
			if backend.IsDownstreamError(err) {
				response.ErrorSource = backend.ErrorSourceDownstream
			} else {
				response.ErrorSource = backend.ErrorSourcePlugin	
			}
			return response
		}
		if frame != nil {
			response.Frames = append(response.Frames, frame)
		}
	default:
		query, _ := infinity.UpdateQueryWithReferenceData(ctx, query, infClient.Settings)
		switch query.Source {
		case "url", "azure-blob":
			if infClient.Settings.AuthenticationMethod != models.AuthenticationMethodAzureBlob && infClient.Settings.AuthenticationMethod != models.AuthenticationMethodNone && len(infClient.Settings.AllowedHosts) < 1 {
				response.Error = errors.New("datasource is missing allowed hosts/URLs. Configure it in the datasource settings page for enhanced security")
				response.ErrorSource = backend.ErrorSourceDownstream
				return response
			}
			if infClient.Settings.HaveSecureHeaders() && len(infClient.Settings.AllowedHosts) < 1 {
				response.Error = errors.New("datasource is missing allowed hosts/URLs. Configure it in the datasource settings page for enhanced security")
				response.ErrorSource = backend.ErrorSourceDownstream
				return response
			}
			if notices := infinity.GetSecureHeaderWarnings(query); infClient.Settings.UnsecuredQueryHandling == models.UnsecuredQueryHandlingDeny && len(notices) > 0 {
				response.Error = errors.New("query contain sensitive content and denied by the unsecuredQueryHandling config")
				response.Status = backend.StatusForbidden
				response.ErrorSource = backend.ErrorSourceDownstream
				return response
			}
			frame, err := infinity.GetFrameForURLSources(ctx, &pluginContext, query, infClient, requestHeaders)
			if err != nil {
				logger.Debug("error while performing the infinity query", "msg", err.Error())
				if frame != nil {
					frame, _ = infinity.WrapMetaForRemoteQuery(ctx, infClient.Settings, frame, err, query)
					response.Frames = append(response.Frames, frame)
				}
				response.Error = fmt.Errorf("error while performing the infinity query. %w", err)
				if backend.IsDownstreamError(err) {
					response.ErrorSource = backend.ErrorSourceDownstream
				} else {
					response.ErrorSource = backend.ErrorSourcePlugin	
				}
				return response
			}
			if frame != nil && infClient.Settings.AuthenticationMethod != models.AuthenticationMethodAzureBlob && infClient.Settings.AuthenticationMethod != models.AuthenticationMethodNone && infClient.Settings.AuthenticationMethod != "" && len(infClient.Settings.AllowedHosts) < 1 {
				frame.AppendNotices(data.Notice{
					Text: "Datasource is missing allowed hosts/URLs. Configure it in the datasource settings page for enhanced security.",
				})
			}
			if frame != nil {
				frame, _ = infinity.WrapMetaForRemoteQuery(ctx, infClient.Settings, frame, nil, query)
				response.Frames = append(response.Frames, frame)
			}
		case "inline":
			frame, err := infinity.GetFrameForInlineSources(ctx, query)
			if err != nil {
				logger.Debug("error while performing the infinity inline query", "msg", err.Error())
				span.RecordError(err)
				span.SetStatus(500, err.Error())
				frame, _ := infinity.WrapMetaForInlineQuery(ctx, frame, err, query)
				response.Frames = append(response.Frames, frame)
				response.Error = fmt.Errorf("error while performing the infinity inline query. %w", err)
				// We should have error source from the original error, but in a case it is not there, we are using the plugin error as the default source
				if backend.IsDownstreamError(err) {
					response.ErrorSource = backend.ErrorSourceDownstream
				} else {
					response.ErrorSource = backend.ErrorSourcePlugin	
				}
				return response
			}
			if frame != nil {
				frame, _ := infinity.WrapMetaForInlineQuery(ctx, frame, nil, query)
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
