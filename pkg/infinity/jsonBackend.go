package infinity

import (
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-framer/jsonFramer"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
)

func GetJSONBackendResponse(urlResponseObject interface{}, query querySrv.Query) (*data.Frame, error) {
	frame := GetDummyFrame(query)
	responseString, err := json.Marshal(urlResponseObject)
	if err != nil {
		backend.Logger.Error("error json parsing root data", "error", err.Error())
		return frame, fmt.Errorf("error parsing json root data")
	}
	newFrame, err := jsonFramer.JsonStringToFrame(string(responseString), jsonFramer.JSONFramerOptions{
		FrameName:    query.RefID,
		RootSelector: query.RootSelector,
		Columns:      []jsonFramer.ColumnSelector{},
	})
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
	return frame, err
}
