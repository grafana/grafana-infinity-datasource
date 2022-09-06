package infinity

import (
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-framer/jsonFramer"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
)

func GetFrameForInlineSources(query querySrv.Query) (*data.Frame, error) {
	frame := GetDummyFrame(query)
	if query.Type == querySrv.QueryTypeJSONBackend {
		columns := []jsonFramer.ColumnSelector{}
		for _, c := range query.Columns {
			columns = append(columns, jsonFramer.ColumnSelector{
				Selector: c.Selector,
				Alias:    c.Text,
				Type:     c.Type,
			})
		}
		newFrame, err := jsonFramer.JsonStringToFrame(query.Data, jsonFramer.JSONFramerOptions{
			FrameName:    query.RefID,
			RootSelector: query.RootSelector,
			Columns:      columns,
		})
		if err != nil {
			backend.Logger.Error("error building frame", "error", err.Error())
			frame.Meta.Custom = &CustomMeta{
				Query: query,
				Error: err.Error(),
			}
			return newFrame, err
		}
		if newFrame != nil {
			frame.Fields = append(frame.Fields, newFrame.Fields...)
		}
	}
	return frame, nil
}
