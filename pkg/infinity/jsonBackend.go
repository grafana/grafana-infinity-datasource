package infinity

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/errorsource"
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
		return frame, errorsource.PluginError(fmt.Errorf("error parsing json root data"), false)
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
	if newFrame != nil {
		frame.Fields = append(frame.Fields, newFrame.Fields...)
	}
	if err != nil {
		err = errorsource.PluginError(fmt.Errorf("error parsing json data to frame: %w", err), false)
	}
	return frame, err
}
