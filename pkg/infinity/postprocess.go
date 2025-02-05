package infinity

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/grafana/grafana-infinity-datasource/pkg/dataplane"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/infinity-libs/lib/go/framesql"
	t "github.com/grafana/infinity-libs/lib/go/transformations"
)

func PostProcessFrame(ctx context.Context, frame *data.Frame, query models.Query) (*data.Frame, error) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "PostProcessFrame")
	logger := backend.Logger.FromContext(ctx)
	defer span.End()
	cc := []t.ComputedColumn{}
	for _, c := range query.ComputedColumns {
		cc = append(cc, t.ComputedColumn{Selector: c.Selector, Text: c.Text})
	}
	frame, err := t.GetFrameWithComputedColumns(frame, cc)
	if err != nil {
		logger.Error("error getting computed column", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{Query: query, Error: err.Error()}
		return frame, backend.PluginError(err)
	}
	frame, err = t.ApplyFilter(frame, query.FilterExpression)
	if err != nil {
		logger.Error("error applying filter", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{Query: query, Error: err.Error()}
		err = addErrorSourceToTransformError(fmt.Errorf("error applying filter. %w", err))
		return frame, err
	}
	if strings.TrimSpace(query.SummarizeExpression) != "" {
		alias := query.SummarizeAlias
		if alias == "" {
			alias = "summary"
		}
		summaryFrame, err := t.GetSummaryFrame(frame, query.SummarizeExpression, query.SummarizeBy, alias)
		if err != nil {
			err = addErrorSourceToTransformError(err)
		}
		return summaryFrame, err
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
	if query.Parser != models.InfinityParserBackend {
		return frame, nil
	}
	if frame.Meta == nil {
		frame.Meta = &data.FrameMeta{}
	}
	if dataplane.CanBeNumericWide(frame) {
		frame.Meta.Type = data.FrameTypeNumericWide
		frame.Meta.TypeVersion = data.FrameTypeVersion{0, 1}
		return frame, nil
	}
	if dataplane.CanBeNumericLong(frame) {
		frame.Meta.Type = data.FrameTypeNumericLong
		frame.Meta.TypeVersion = data.FrameTypeVersion{0, 1}
		return frame, nil
	}
	return frame, nil
}

func addErrorSourceToTransformError(err error) error {
	downstreamErrors := []error{
		t.ErrSummarizeByFieldNotFound,
		t.ErrNotUniqueFieldNames,
		t.ErrEvaluatingFilterExpression,
		t.ErrMergeTransformationNoFrameSupplied,
		t.ErrMergeTransformationDifferentFields,
		t.ErrMergeTransformationDifferentFieldNames,
		t.ErrMergeTransformationDifferentFieldTypes,
		t.ErrInvalidFilterExpression,
		framesql.ErrEmptySummarizeExpression,
		framesql.ErrExpressionNotFoundInFields,
	}
	for _, e := range downstreamErrors {
		if errors.Is(err, e) {
			return backend.DownstreamError(err)
		}
	}
	return backend.PluginError(err)
}
