package transformations

import (
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/framesql"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
	"gopkg.in/Knetic/govaluate.v3"
)

func GetFrameWithComputedColumns(frame *data.Frame, columns []models.InfinityColumn) (*data.Frame, error) {
	var err error
	frameLen := frame.Rows()
	for _, column := range columns {
		if strings.TrimSpace(column.Selector) == "" {
			continue
		}
		out := []any{}
		parsedExpression, err := govaluate.NewEvaluableExpressionWithFunctions(column.Selector, ExpressionFunctions)
		if err != nil {
			return frame, err
		}
		for i := 0; i < frameLen; i++ {
			parameters := map[string]any{"frame": frame, "null": nil, "nil": nil, "rowIndex": i, "recordsCount": frameLen}
			for _, field := range frame.Fields {
				v := framesql.GetValue(field.At(i))
				parameters[framesql.SlugifyFieldName(field.Name)] = v
				parameters[field.Name] = v
			}
			result, err := parsedExpression.Evaluate(parameters)
			if err != nil {
				out = append(out, nil)
				continue
			}
			out = append(out, result)
		}
		if out != nil && len(out) == frame.Rows() {
			newFieldName := column.Text
			if newFieldName == "" {
				newFieldName = column.Selector
			}
			newField := framesql.ConvertFieldValuesToField(out, newFieldName)
			frame.Fields = append(frame.Fields, newField)
		}
	}
	return frame, err
}
