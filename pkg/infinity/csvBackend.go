package infinity

import (
	"context"
	"errors"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/infinity-libs/lib/go/csvframer"
	"github.com/grafana/infinity-libs/lib/go/gframer"
)

func GetCSVBackendResponse(ctx context.Context, responseString string, query models.Query) (*data.Frame, error) {
	_, span := tracing.DefaultTracer().Start(ctx, "GetCSVBackendResponse")
	defer span.End()
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
	csvOptions := csvframer.FramerOptions{
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
	newFrame, err := csvframer.ToFrame(responseString, csvOptions)
	if newFrame != nil {
		frame.Fields = append(frame.Fields, newFrame.Fields...)
	}
	if err != nil {
		if errors.Is(err, csvframer.ErrEmptyCsv) || errors.Is(err, csvframer.ErrReadingCsvResponse) {
			err = backend.DownstreamError(err)
		} else {
			err = backend.PluginError(err)
		}
	}
	return frame, err
}
