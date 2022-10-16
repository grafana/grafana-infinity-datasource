package infinity

import (
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/framesql"
)

func GetSummaryFrame(frame *data.Frame, expression string) (*data.Frame, error) {
	if strings.TrimSpace(expression) == "" {
		return frame, nil
	}
	summary, err := framesql.EvaluateInFrame(expression, frame)
	summaryFrame := &data.Frame{Name: frame.Name, RefID: frame.RefID, Fields: []*data.Field{}}
	if err != nil {
		return frame, fmt.Errorf("error evaluating summarize expression. %w. Not applying summarize expression", err)
	}
	switch t := summary.(type) {
	case float64:
		v := summary.(float64)
		summaryFrame.Fields = append(summaryFrame.Fields, data.NewField("summary", nil, []*float64{&v}))
	case *float64:
		v := summary.(*float64)
		summaryFrame.Fields = append(summaryFrame.Fields, data.NewField("summary", nil, []*float64{v}))
	case float32:
		v := summary.(float32)
		summaryFrame.Fields = append(summaryFrame.Fields, data.NewField("summary", nil, []*float32{&v}))
	case *float32:
		v := summary.(*float32)
		summaryFrame.Fields = append(summaryFrame.Fields, data.NewField("summary", nil, []*float32{v}))
	case int:
		v := summary.(int)
		summaryFrame.Fields = append(summaryFrame.Fields, data.NewField("summary", nil, []*int{&v}))
	case *int:
		v := summary.(*int)
		summaryFrame.Fields = append(summaryFrame.Fields, data.NewField("summary", nil, []*int{v}))
	case int64:
		v := summary.(int64)
		summaryFrame.Fields = append(summaryFrame.Fields, data.NewField("summary", nil, []*int64{&v}))
	case *int64:
		v := summary.(*int64)
		summaryFrame.Fields = append(summaryFrame.Fields, data.NewField("summary", nil, []*int64{v}))
	case string:
		v := summary.(string)
		summaryFrame.Fields = append(summaryFrame.Fields, data.NewField("summary", nil, []*string{&v}))
	case *string:
		v := summary.(*string)
		summaryFrame.Fields = append(summaryFrame.Fields, data.NewField("summary", nil, []*string{v}))
	case bool:
		v := summary.(bool)
		summaryFrame.Fields = append(summaryFrame.Fields, data.NewField("summary", nil, []*bool{&v}))
	case *bool:
		v := summary.(*bool)
		summaryFrame.Fields = append(summaryFrame.Fields, data.NewField("summary", nil, []*bool{v}))
	default:
		err = fmt.Errorf("unsupported format. %v", t)
	}
	summaryFrame.SetMeta(frame.Meta)
	return summaryFrame, err
}
