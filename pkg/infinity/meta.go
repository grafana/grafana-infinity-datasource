package infinity

import (
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
)

type CustomMeta struct {
	Query                  querySrv.Query `json:"query"`
	Data                   interface{}    `json:"data"`
	ResponseCodeFromServer int            `json:"responseCodeFromServer"`
	Duration               time.Duration  `json:"duration"`
	Error                  string         `json:"error"`
}

func GetDummyFrame(query querySrv.Query) *data.Frame {
	frameName := query.RefID
	if frameName == "" {
		frameName = "response"
	}
	frame := data.NewFrame(frameName)
	frame.Meta = &data.FrameMeta{
		ExecutedQueryString: "This feature is not available for this type of query yet",
		Custom: &CustomMeta{
			Query:                  query,
			Data:                   query.Data,
			ResponseCodeFromServer: 0,
			Error:                  "",
		},
	}
	return frame
}
