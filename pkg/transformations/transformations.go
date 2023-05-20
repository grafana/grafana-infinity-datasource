package transformations

import (
	"errors"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
)

func ApplyTransformations(query models.Query, previousInput *backend.QueryDataResponse) (*backend.QueryDataResponse, error) {
	response := previousInput
	var err error
	for _, q := range previousInput.Responses {
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
			return response, err
		}
	}
	return response, nil
}

func ApplyTransformation(query models.Query, transformation models.TransformationItem, previousInput *backend.QueryDataResponse) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()
	switch transformation.Type {
	case models.LimitTransformation:
		for pk, pr := range previousInput.Responses {
			frames, err := Limit(pr.Frames, LimitOptions{LimitField: transformation.Limit.LimitField})
			response.Responses[pk] = backend.DataResponse{Frames: frames, Error: err}
		}
	case models.FilterExpressionTransformation:
		for pk, pr := range previousInput.Responses {
			frames, err := FilterExpression(pr.Frames, FilterExpressionOptions{Expression: transformation.FilterExpression.Expression})
			response.Responses[pk] = backend.DataResponse{Frames: frames, Error: err}
		}
	case models.ComputedColumnTransformation:
		var err error
		for pk, pr := range previousInput.Responses {
			frames := []*data.Frame{}
			for _, frame := range pr.Frames {
				frame, err1 := GetFrameWithComputedColumns(frame, []models.InfinityColumn{{Selector: transformation.ComputedColumn.Expression, Text: transformation.ComputedColumn.Alias}})
				if err1 != nil {
					err = errors.Join(errors.New("error applying computed column"), err1, err)
				}
				if frame != nil {
					frames = append(frames, frame)
				}
			}
			response.Responses[pk] = backend.DataResponse{Frames: frames, Error: err}
		}
	default:
		return previousInput, nil
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
