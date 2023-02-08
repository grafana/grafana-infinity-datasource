package infinity

import (
	"fmt"
	"strings"

	xj "github.com/basgys/goxml2json"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-framer/jsonFramer"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
)

func GetXMLBackendResponse(inputString string, query models.Query) (*data.Frame, error) {
	frame := GetDummyFrame(query)
	columns := []jsonFramer.ColumnSelector{}
	for _, c := range query.Columns {
		columns = append(columns, jsonFramer.ColumnSelector{
			Selector:   c.Selector,
			Alias:      c.Text,
			Type:       c.Type,
			TimeFormat: c.TimeStampFormat,
		})
	}
	xml := strings.NewReader(inputString)
	jsonValue, err := xj.Convert(xml)
	if err != nil {
		backend.Logger.Error("error converting XML to frame", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{Query: query, Error: err.Error()}
		return frame, err
	}
	newFrame, err := jsonFramer.JsonStringToFrame(jsonValue.String(), jsonFramer.JSONFramerOptions{
		FrameName:    query.RefID,
		RootSelector: query.RootSelector,
		Columns:      columns,
	})
	frame.Meta = &data.FrameMeta{Custom: &CustomMeta{Query: query}}
	if err != nil {
		backend.Logger.Error("error getting response for query", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{Query: query, Error: err.Error()}
		return frame, err
	}
	if newFrame != nil {
		frame.Fields = append(frame.Fields, newFrame.Fields...)
	}
	frame, err = GetFrameWithComputedColumns(frame, query.ComputedColumns)
	if err != nil {
		backend.Logger.Error("error getting computed column", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{Query: query, Error: err.Error()}
		return frame, err
	}
	frame, err = ApplyFilter(frame, query.FilterExpression)
	if err != nil {
		backend.Logger.Error("error applying filter", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{Query: query, Error: err.Error()}
		return frame, fmt.Errorf("error applying filter. %w", err)
	}
	if strings.TrimSpace(query.SummarizeExpression) != "" {
		return GetSummaryFrame(frame, query.SummarizeExpression, query.SummarizeBy)
	}
	if query.Format == "timeseries" && frame.TimeSeriesSchema().Type == data.TimeSeriesTypeLong {
		if wFrame, err := data.LongToWide(frame, &data.FillMissing{Mode: data.FillModeNull}); err == nil {
			return wFrame, err
		}
	}
	return frame, nil
}
