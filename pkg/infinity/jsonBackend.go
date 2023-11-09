package infinity

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
	"github.com/yesoreyeram/grafana-plugins/lib/go/jsonframer"
)

func GetJSONBackendResponse(ctx context.Context, urlResponseObject any, query models.Query) (*data.Frame, error) {
	_, span := tracing.DefaultTracer().Start(ctx, "GetJSONBackendResponse")
	defer span.End()
	frame := GetDummyFrame(query)
	responseString, err := json.Marshal(urlResponseObject)
	if err != nil {
		backend.Logger.Error("error json parsing root data", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{Query: query, Error: err.Error()}
		return frame, fmt.Errorf("error parsing json root data")
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
	return frame, err
}
