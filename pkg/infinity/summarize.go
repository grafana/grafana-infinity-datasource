package infinity

import (
	"errors"
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/framesql"
)

func GetSummaryFrame(frame *data.Frame, expression string, by string) (*data.Frame, error) {
	if strings.TrimSpace(expression) == "" {
		return frame, nil
	}
	if strings.TrimSpace(by) != "" {
		return GetSummarizeByFrame(frame, expression, by)
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

func GetSummarizeByFrame(frame *data.Frame, expression, by string) (*data.Frame, error) {
	var byField *data.Field
	var byFieldIndex int = -1
	for idx, field := range frame.Fields {
		if field.Name == by || framesql.SlugifyFieldName(field.Name) == by {
			byField = field
			byFieldIndex = idx
			break
		}
	}
	if byField == nil {
		return frame, errors.New("summarize by field not found. Not applying summarize")
	}
	uniqueValuesArray := []any{}
	uniqueValues := map[any]bool{}
	for i := 0; i < byField.Len(); i++ {
		if !uniqueValues[framesql.GetValue(byField.At(i))] {
			uniqueValuesArray = append(uniqueValuesArray, framesql.GetValue(byField.At(i)))
		}
		uniqueValues[framesql.GetValue(byField.At(i))] = true
	}
	summarizeFrame := data.NewFrame("summary")
	nameField := framesql.ConvertFieldValuesToField(uniqueValuesArray, by)
	summarizeFrame.Fields = append(summarizeFrame.Fields, nameField)
	values := []any{}
	for _, item := range uniqueValuesArray {
		filteredFrame := frame.EmptyCopy()
		rowLen, err := frame.RowLen()
		if err != nil {
			return frame, err
		}
		for inRowIdx := 0; inRowIdx < rowLen; inRowIdx++ {
			if frame.Fields[byFieldIndex].Name == by || framesql.SlugifyFieldName(frame.Fields[byFieldIndex].Name) == by {
				if framesql.GetValue(frame.Fields[byFieldIndex].At(inRowIdx)) == framesql.GetValue(item) {
					filteredFrame.AppendRow(frame.RowCopy(inRowIdx)...)
				}
			}
		}
		oFrame, err := GetSummaryFrame(filteredFrame, expression, "")
		if err != nil {
			return frame, fmt.Errorf("unable to summarize. %w", err)
		}
		values = append(values, framesql.GetValue(oFrame.Fields[0].At(0)))
	}
	valueField := framesql.ConvertFieldValuesToField(values, by)
	if valueField == nil {
		return frame, errors.New("invalid summarize by operation. Not applying summarize")
	}
	valueField.Name = expression
	summarizeFrame.Fields = append(summarizeFrame.Fields, valueField)
	return summarizeFrame, nil
}
