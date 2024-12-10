package infinity

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/infinity-libs/lib/go/jsonframer"
)

func GetJSONBackendResponse(ctx context.Context, urlResponseObject any, query models.Query) (*data.Frame, error) {
	_, span := tracing.DefaultTracer().Start(ctx, "GetJSONBackendResponse")
	logger := backend.Logger.FromContext(ctx)
	defer span.End()
	frame := GetDummyFrame(query)
	responseString, err := json.Marshal(urlResponseObject)
	if err != nil {
		logger.Error("error json parsing root data", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{Query: query, Error: err.Error()}
		return frame, backend.PluginError(fmt.Errorf("error parsing json root data"))
	}
	columns := []jsonframer.ColumnSelector{}
	for _, c := range query.Columns {
		columns = append(columns, jsonframer.ColumnSelector{
			Selector:   c.Selector,
			Alias:      c.Text,
			Type:       c.Type,
			TimeFormat: c.TimeStampFormat,
		})
	}
	newFrame, err := jsonframer.ToFrame(string(responseString), jsonframer.FramerOptions{
		FrameName:    query.RefID,
		RootSelector: query.RootSelector,
		Columns:      columns,
	})

	if err != nil {
		if errors.Is(err, jsonframer.ErrInvalidRootSelector) || errors.Is(err, jsonframer.ErrInvalidJSONContent) || errors.Is(err, jsonframer.ErrEvaluatingJSONata) {
			return frame, backend.DownstreamError(fmt.Errorf("error converting json data to frame: %w", err))
		}
		return frame, backend.PluginError(fmt.Errorf("error converting json data to frame: %w", err))
	}
	if newFrame != nil {
		frame.Fields = append(frame.Fields, newFrame.Fields...)
	}
	return frame, nil
}
