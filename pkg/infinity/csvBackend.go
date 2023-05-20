package infinity

import (
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-framer/csvFramer"
	"github.com/yesoreyeram/grafana-framer/gframer"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
)

func GetCSVBackendResponse(responseString string, query models.Query) (*data.Frame, error) {
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
	if query.Type == models.QueryTypeTSV {
		csvOptions.Delimiter = "\t"
	}
	newFrame, err := csvFramer.CsvStringToFrame(responseString, csvOptions)
	if newFrame != nil {
		frame.Fields = append(frame.Fields, newFrame.Fields...)
	}
	return frame, err
}
