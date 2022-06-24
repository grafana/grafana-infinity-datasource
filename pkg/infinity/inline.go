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
		newFrame, err := jsonFramer.JsonStringToFrame(query.Data, jsonFramer.JSONFramerOptions{
			FrameName:    query.RefID,
			RootSelector: query.RootSelector,
			Columns:      []jsonFramer.ColumnSelector{},
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
