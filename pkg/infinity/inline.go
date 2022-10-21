package infinity

import (
	"errors"
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-framer/jsonFramer"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
)

func GetFrameForInlineSources(query querySrv.Query) (*data.Frame, error) {
	frame := GetDummyFrame(query)
	if query.Type == querySrv.QueryTypeGROQ || query.Type == querySrv.QueryTypeUQL || query.Type == querySrv.QueryTypeHTML || query.Type == querySrv.QueryTypeXML {
		return frame, nil
	}
	if query.Parser != "backend" {
		return frame, nil
	}
	switch query.Type {
	case querySrv.QueryTypeCSV, querySrv.QueryTypeTSV:
		return GetCSVBackendResponse(query.Data, query)
	case querySrv.QueryTypeJSON, querySrv.QueryTypeGraphQL:
		columns := []jsonFramer.ColumnSelector{}
		for _, c := range query.Columns {
			columns = append(columns, jsonFramer.ColumnSelector{
				Selector:   c.Selector,
				Alias:      c.Text,
				Type:       c.Type,
				TimeFormat: c.TimeStampFormat,
			})
		}
		newFrame, err := jsonFramer.JsonStringToFrame(query.Data, jsonFramer.JSONFramerOptions{
			FrameName:    query.RefID,
			RootSelector: query.RootSelector,
			Columns:      columns,
		})
		if err != nil {
			return frame, err
		}
		if newFrame != nil {
			frame.Fields = append(frame.Fields, newFrame.Fields...)
		}
		frame, err = GetFrameWithComputedColumns(frame, query.ComputedColumns)
		if err != nil {
			return frame, fmt.Errorf("error getting computed column. %w", err)
		}
		frame, err = ApplyFilter(frame, query.FilterExpression)
		if err != nil {
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
	default:
		return frame, errors.New("unknown backend query type")
	}
}
