package infinity

import (
	"errors"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/infinity-libs/lib/go/transformations"
)

func ApplyTransformations(query models.Query, input *backend.QueryDataResponse) (*backend.QueryDataResponse, error) {
	response := input
	var err error
	for _, q := range input.Responses {
		if q.Error != nil {
			err = errors.Join(err, q.Error)
		}
	}
	if err != nil {
		response.Responses[query.RefID] = backend.ErrDataResponse(backend.StatusBadRequest, "unable to apply transformation due to existing errors: "+err.Error())
		return response, nil
	}
	for _, t := range query.Transformations {
		if t.Disabled {
			continue
		}
		response, err = ApplyTransformation(query, t, response)
		if err != nil {
			return response, backend.PluginError(err)
		}
	}
	for k := range response.Responses {
		for _, f := range response.Responses[k].Frames {
			f.Meta = &data.FrameMeta{Custom: struct {
				Query models.Query `json:"query"`
			}{Query: query}}
		}
	}
	return response, nil
}

func ApplyTransformation(query models.Query, transformation models.TransformationItem, input *backend.QueryDataResponse) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()
	switch transformation.Type {
	case models.LimitTransformation:
		for pk, pr := range input.Responses {
			frames, err := transformations.Limit(pr.Frames, transformations.LimitOptions{LimitField: transformation.Limit.LimitField})
			response.Responses[pk] = backend.DataResponse{Frames: frames, Error: err, ErrorSource: backend.ErrorSourcePlugin}
		}
	case models.FilterExpressionTransformation:
		for pk, pr := range input.Responses {
			frames, err := transformations.FilterExpression(pr.Frames, transformations.FilterExpressionOptions{Expression: transformation.FilterExpression.Expression})
			response.Responses[pk] = backend.DataResponse{Frames: frames, Error: err, ErrorSource: backend.ErrorSourcePlugin}
		}
	case models.ComputedColumnTransformation:
		var err error
		for pk, pr := range input.Responses {
			frames := []*data.Frame{}
			for _, frame := range pr.Frames {
				frame, err1 := transformations.GetFrameWithComputedColumns(frame, []transformations.ComputedColumn{{Selector: transformation.ComputedColumn.Expression, Text: transformation.ComputedColumn.Alias}})
				if err1 != nil {
					err = errors.Join(errors.New("error applying computed column"), err1, err)
				}
				if frame != nil {
					frames = append(frames, frame)
				}
			}
			response.Responses[pk] = backend.DataResponse{Frames: frames, Error: err, ErrorSource: backend.ErrorSourcePlugin}
		}
	case models.SummarizeTransformation:
		var err error
		for pk, pr := range input.Responses {
			frames := []*data.Frame{}
			for _, frame := range pr.Frames {
				frame, err1 := transformations.GetSummaryFrame(frame, transformation.Summarize.Expression, transformation.Summarize.By, transformation.Summarize.Alias)
				if err1 != nil {
					err = errors.Join(errors.New("error applying summarize"), err1, err)
				}
				if frame != nil {
					frames = append(frames, frame)
				}
			}
			response.Responses[pk] = backend.DataResponse{Frames: frames, Error: err, ErrorSource: backend.ErrorSourcePlugin}
		}
	default:
		return input, nil
	}
	return response, nil
}
