package infinity

import (
	"github.com/grafana/grafana-plugin-sdk-go/data"
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

func GetFrameFromGoogleSheetsResponse(query querySrv.Query, urlResponseObject interface{}) (*data.Frame, error) {
	frame := data.NewFrame("response")
	return frame, nil
}
