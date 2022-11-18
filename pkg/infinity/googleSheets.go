package infinity

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-framer/gframer"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
)

type Spreadsheet struct {
	Sheets     []*Sheet `json:"sheets,omitempty"`
	NullFields []string `json:"-"`
}

type Sheet struct {
	Data       []*GridData `json:"data,omitempty"`
	NullFields []string    `json:"-"`
}

type GridData struct {
	RowData    []*RowData `json:"rowData,omitempty"`
	NullFields []string   `json:"-"`
}

type RowData struct {
	Values     []*CellData `json:"values,omitempty"`
	NullFields []string    `json:"-"`
}

type CellData struct {
	FormattedValue string   `json:"formattedValue,omitempty"`
	NullFields     []string `json:"-"`
}

func GetGoogleSheetsResponse(urlResponseObject any, query querySrv.Query) (*data.Frame, error) {
	frame := GetDummyFrame(query)
	sheetsString, ok := urlResponseObject.(string)
	if !ok {
		backend.Logger.Error("error getting response for query", "error", "invalid response received from google sheets")
		frame.Meta.Custom = &CustomMeta{
			Query: query,
			Error: "invalid response received from google sheets",
		}
		return frame, errors.New("invalid response received from google sheets")
	}
	sheet := &Spreadsheet{}
	if err := json.Unmarshal([]byte(sheetsString), &sheet); err != nil {
		backend.Logger.Error("error getting response for query", "error", "invalid response received from google sheets")
		frame.Meta.Custom = &CustomMeta{
			Query: query,
			Error: "invalid response received from google sheets",
		}
		return frame, errors.New("invalid response received from google sheets")
	}
	if sheet != nil && len(sheet.Sheets) > 0 && len(sheet.Sheets[0].Data) > 0 {
		parsedCSV := [][]string{}
		for _, d := range sheet.Sheets[0].Data {
			for _, r := range d.RowData {
				isValidRow := false
				rowItem := []string{}
				for _, v := range r.Values {
					if v.FormattedValue != "" {
						isValidRow = true
					}
					rowItem = append(rowItem, v.FormattedValue)
				}
				if isValidRow {
					parsedCSV = append(parsedCSV, rowItem)
				}
			}
		}
		if len(parsedCSV) > 0 {
			records := parsedCSV[1:]
			header := parsedCSV[0]
			framerOptions := gframer.FramerOptions{}
			for idx, h := range header {
				colum := gframer.ColumnSelector{Selector: h, Alias: h}
				newHeader := strings.TrimSpace(h)
				if h == "" {
					newHeader = fmt.Sprintf("Field %d", idx+1)
					header[idx] = newHeader
					colum.Selector = newHeader
					colum.Alias = newHeader
				}
				for _, col := range query.Columns {
					if col.Selector == strings.TrimSpace(newHeader) {
						colum.Type = col.Type
						colum.TimeFormat = col.TimeStampFormat
						if col.Text != "" {
							header[idx] = col.Text
							colum.Alias = col.Text
						}
					}
				}
				framerOptions.Columns = append(framerOptions.Columns, colum)
			}
			out := []any{}
			for _, row := range records {
				item := map[string]any{}
				for colId, col := range header {
					if colId < len(row) {
						item[col] = row[colId]
					}
				}
				out = append(out, item)
			}
			return gframer.ToDataFrame(out, framerOptions)
		}
	}
	return frame, nil
}
