package infinity

import (
	"context"
	"fmt"
	"strings"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/errorsource"
	"github.com/grafana/infinity-libs/lib/go/transformations"
)

func PostProcessFrame(ctx context.Context, frame *data.Frame, query models.Query) (*data.Frame, error) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "PostProcessFrame")
	logger := backend.Logger.FromContext(ctx)
	defer span.End()
	cc := []transformations.ComputedColumn{}
	for _, c := range query.ComputedColumns {
		cc = append(cc, transformations.ComputedColumn{Selector: c.Selector, Text: c.Text})
	}
	frame, err := transformations.GetFrameWithComputedColumns(frame, cc)
	if err != nil {
		logger.Error("error getting computed column", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{Query: query, Error: err.Error()}
		return frame, errorsource.PluginError(err, false)
	}
	frame, err = transformations.ApplyFilter(frame, query.FilterExpression)
	if err != nil {
		logger.Error("error applying filter", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{Query: query, Error: err.Error()}
		return frame, errorsource.PluginError(fmt.Errorf("error applying filter. %w", err), false)
	}
	if strings.TrimSpace(query.SummarizeExpression) != "" {
		alias := query.SummarizeAlias
		if alias == "" {
			alias = "summary"
		}
		return transformations.GetSummaryFrame(frame, query.SummarizeExpression, query.SummarizeBy, alias)
	}
	frame.Meta = &data.FrameMeta{Custom: &CustomMeta{Query: query}}
	if query.Source == "inline" {
		frame, err = WrapMetaForInlineQuery(ctx, frame, err, query)
		if err != nil {
			return frame, err
		}
	}
	if query.Format == "timeseries" && frame.TimeSeriesSchema().Type == data.TimeSeriesTypeLong {
		if wFrame, err := data.LongToWide(frame, &data.FillMissing{Mode: data.FillModeNull}); err == nil {
			return wFrame, err
		}
	}
	return frame, nil
}
