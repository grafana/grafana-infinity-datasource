package infinity

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-framer/jsonFramer"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/framesql"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
)

func GetJSONBackendResponse(urlResponseObject interface{}, query querySrv.Query) (*data.Frame, error) {
	frame := GetDummyFrame(query)
	responseString, err := json.Marshal(urlResponseObject)
	if err != nil {
		backend.Logger.Error("error json parsing root data", "error", err.Error())
		return frame, fmt.Errorf("error parsing json root data")
	}
	columns := []jsonFramer.ColumnSelector{}
	for _, c := range query.Columns {
		columns = append(columns, jsonFramer.ColumnSelector{
			Selector: c.Selector,
			Alias:    c.Text,
			Type:     c.Type,
		})
	}
	newFrame, err := jsonFramer.JsonStringToFrame(string(responseString), jsonFramer.JSONFramerOptions{
		FrameName:    query.RefID,
		RootSelector: query.RootSelector,
		Columns:      columns,
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
	if strings.TrimSpace(query.SummarizeExpression) != "" {
		summary, err := framesql.EvaluateInFrame(query.SummarizeExpression, frame)
		if err != nil {
			backend.Logger.Error("error evaluating summarize expression", "error", err.Error())
			frame.Meta.Custom = &CustomMeta{
				Data:  urlResponseObject,
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
