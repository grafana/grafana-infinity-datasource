package infinity

import (
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
	"github.com/yesoreyeram/grafana-plugins/lib/go/jsonframer"
	"github.com/yesoreyeram/grafana-plugins/lib/go/xmlframer"
)

func GetXMLBackendResponse(inputString string, query models.Query) (*data.Frame, error) {
	frame := GetDummyFrame(query)
	columns := []jsonframer.ColumnSelector{}
	for _, c := range query.Columns {
		columns = append(columns, jsonframer.ColumnSelector{
			Selector:   c.Selector,
			Alias:      c.Text,
			Type:       c.Type,
			TimeFormat: c.TimeStampFormat,
		})
	}
	newFrame, err := xmlframer.ToFrame(inputString, xmlframer.FramerOptions{
		FrameName:    query.RefID,
		RootSelector: query.RootSelector,
		Columns:      columns,
	})
	if newFrame != nil {
		frame.Fields = append(frame.Fields, newFrame.Fields...)
	}
	return frame, err
}
