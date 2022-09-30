package infinity

import (
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-framer/csvFramer"
	"github.com/yesoreyeram/grafana-framer/gframer"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/framesql"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
)

func GetCSVBackendResponse(responseString string, query querySrv.Query) (*data.Frame, error) {
	frame := GetDummyFrame(query)
	columns := []gframer.ColumnSelector{}
	for _, c := range query.Columns {
		columns = append(columns, gframer.ColumnSelector{
			Selector:   c.Selector,
			Alias:      c.Text,
			Type:       c.Type,
			TimeFormat: c.TimeStampFormat,
		})
	}
	csvOptions := csvFramer.CSVFramerOptions{
		FrameName:          query.RefID,
		Columns:            columns,
		Comment:            query.CSVOptions.Comment,
		Delimiter:          query.CSVOptions.Delimiter,
		SkipLinesWithError: query.CSVOptions.SkipLinesWithError,
		RelaxColumnCount:   query.CSVOptions.RelaxColumnCount,
	}
	if query.CSVOptions.Columns != "" && query.CSVOptions.Columns != "-" && query.CSVOptions.Columns != "none" {
		responseString = query.CSVOptions.Columns + "\n" + responseString
	}
	if query.CSVOptions.Columns == "-" || query.CSVOptions.Columns == "none" {
		csvOptions.NoHeaders = true
	}
	if query.Type == querySrv.QueryTypeTSV {
		csvOptions.Delimiter = "\t"
	}
	newFrame, err := csvFramer.CsvStringToFrame(responseString, csvOptions)
	frame.Meta = &data.FrameMeta{
		Custom: &CustomMeta{
			Query: query,
		},
	}
	if err != nil {
		backend.Logger.Error("error getting response for query", "error", err.Error())
		frame.Meta.Custom = &CustomMeta{
			Query: query,
			Error: err.Error(),
		}
		return frame, err
	}
	if newFrame != nil {
		frame.Fields = append(frame.Fields, newFrame.Fields...)
	}
	if strings.TrimSpace(query.SummarizeExpression) != "" {
		summary, err := framesql.EvaluateInFrame(query.SummarizeExpression, frame)
		if err != nil {
			backend.Logger.Error("error evaluating summarize expression", "error", err.Error())
			frame.Meta.Custom = &CustomMeta{
				Data:  responseString,
				Query: query,
				Error: err.Error(),
			}
			return frame, err
		}
		switch t := summary.(type) {
		case float64:
			v := summary.(float64)
			summaryFrame := &data.Frame{
				Name:   frame.Name,
				RefID:  frame.RefID,
				Fields: []*data.Field{data.NewField("summary", nil, []*float64{&v})},
			}
			summaryFrame.SetMeta(frame.Meta)
			return summaryFrame, nil
		default:
			fmt.Print(t)
		}
	}
	if query.Format == "timeseries" && frame.TimeSeriesSchema().Type == data.TimeSeriesTypeLong {
		if wFrame, err := data.LongToWide(frame, &data.FillMissing{Mode: data.FillModeNull}); err == nil {
			return wFrame, err
		}
	}
	return frame, err
}
