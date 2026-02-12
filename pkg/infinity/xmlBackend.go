package infinity

import (
	"context"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/infinity-libs/lib/go/jsonframer"
	"github.com/grafana/infinity-libs/lib/go/xmlframer"
)

func GetXMLBackendResponse(ctx context.Context, inputString string, query models.Query) (*data.Frame, error) {
	_, span := tracing.DefaultTracer().Start(ctx, "GetXMLBackendResponse")
	defer span.End()
	frame := GetDummyFrame(query)
	columns := make([]jsonframer.ColumnSelector, 0, len(query.Columns))
	for _, c := range query.Columns {
		columns = append(columns, jsonframer.ColumnSelector{
			Selector:   c.Selector,
			Alias:      c.Text,
			Type:       c.Type,
			TimeFormat: c.TimeStampFormat,
		})
	}
	framerOptions := xmlframer.FramerOptions{
		FramerType:   string(jsonframer.FramerTypeGJSON),
		FrameName:    query.RefID,
		RootSelector: query.RootSelector,
		Columns:      columns,
	}
	if query.Parser == models.InfinityParserJQBackend {
		framerOptions.FramerType = string(jsonframer.FramerTypeJQ)
	}
	newFrame, err := xmlframer.ToFrame(inputString, framerOptions)
	if newFrame != nil {
		frame.Fields = append(frame.Fields, newFrame.Fields...)
	}
	if err != nil {
		err = backend.PluginError(err)
	}
	return frame, err
}
