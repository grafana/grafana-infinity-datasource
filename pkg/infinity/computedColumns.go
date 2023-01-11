package infinity

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/framesql"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
	"gopkg.in/Knetic/govaluate.v3"
)

var expressionFunctions = map[string]govaluate.ExpressionFunction{
	"trim": func(arguments ...any) (any, error) {
		if len(arguments) < 1 {
			return nil, errors.New("invalid arguments to trim method")
		}
		if arg, ok := arguments[0].(*string); ok {
			return strings.TrimSpace(*arg), nil
		}
		if arg, ok := arguments[0].(string); ok {
			return strings.TrimSpace(arg), nil
		}
		return "", nil
	},
	"tolower": func(arguments ...any) (any, error) {
		if len(arguments) < 1 {
			return nil, errors.New("invalid arguments to tolower method")
		}
		if arg, ok := arguments[0].(*string); ok {
			return strings.ToLower(*arg), nil
		}
		if arg, ok := arguments[0].(string); ok {
			return strings.ToLower(arg), nil
		}
		return "", nil
	},
	"toupper": func(arguments ...any) (any, error) {
		if len(arguments) < 1 {
			return nil, errors.New("invalid arguments to toupper method")
		}
		if arg, ok := arguments[0].(*string); ok {
			return strings.ToUpper(*arg), nil
		}
		if arg, ok := arguments[0].(string); ok {
			return strings.ToUpper(arg), nil
		}
		return "", nil
	},
	"startswith": func(arguments ...any) (any, error) {
		if len(arguments) < 2 {
			return nil, errors.New("invalid arguments to startswith method")
		}
		var first *string
		var second *string
		if arg, ok := arguments[0].(*string); ok {
			first = arg
		}
		if arg, ok := arguments[0].(string); ok {
			first = &arg
		}
		if arg, ok := arguments[1].(*string); ok {
			second = arg
		}
		if arg, ok := arguments[1].(string); ok {
			second = &arg
		}
		if first != nil && second != nil {
			return strings.HasPrefix(*first, *second), nil
		}
		return false, nil
	},
	"endswith": func(arguments ...any) (any, error) {
		if len(arguments) < 2 {
			return nil, errors.New("invalid arguments to endswith method")
		}
		var first *string
		var second *string
		if arg, ok := arguments[0].(*string); ok {
			first = arg
		}
		if arg, ok := arguments[0].(string); ok {
			first = &arg
		}
		if arg, ok := arguments[1].(*string); ok {
			second = arg
		}
		if arg, ok := arguments[1].(string); ok {
			second = &arg
		}
		if first != nil && second != nil {
			return strings.HasSuffix(*first, *second), nil
		}
		return false, nil
	},
	"contains": func(arguments ...any) (any, error) {
		if len(arguments) < 2 {
			return nil, errors.New("invalid arguments to endswith method")
		}
		var first *string
		var second *string
		if arg, ok := arguments[0].(*string); ok {
			first = arg
		}
		if arg, ok := arguments[0].(string); ok {
			first = &arg
		}
		if arg, ok := arguments[1].(*string); ok {
			second = arg
		}
		if arg, ok := arguments[1].(string); ok {
			second = &arg
		}
		if first != nil && second != nil {
			return strings.Contains(*first, *second), nil
		}
		return false, nil
	},
	"replace": func(arguments ...any) (any, error) {
		if len(arguments) < 3 {
			return nil, errors.New("invalid arguments to endswith method")
		}
		var first *string
		var second *string
		var third *string
		if arg, ok := arguments[0].(*string); ok {
			first = arg
		}
		if arg, ok := arguments[0].(string); ok {
			first = &arg
		}
		if arg, ok := arguments[1].(*string); ok {
			second = arg
		}
		if arg, ok := arguments[1].(string); ok {
			second = &arg
		}
		if arg, ok := arguments[2].(*string); ok {
			third = arg
		}
		if arg, ok := arguments[2].(string); ok {
			third = &arg
		}

		if first != nil && second != nil && third != nil {
			return strings.ReplaceAll(*first, *second, *third), nil
		}
		return "", nil
	},
	"replace_all": func(arguments ...any) (any, error) {
		if len(arguments) < 3 {
			return nil, errors.New("invalid arguments to endswith method")
		}
		var first *string
		var second *string
		var third *string
		if arg, ok := arguments[0].(*string); ok {
			first = arg
		}
		if arg, ok := arguments[0].(string); ok {
			first = &arg
		}
		if arg, ok := arguments[1].(*string); ok {
			second = arg
		}
		if arg, ok := arguments[1].(string); ok {
			second = &arg
		}
		if arg, ok := arguments[2].(*string); ok {
			third = arg
		}
		if arg, ok := arguments[2].(string); ok {
			third = &arg
		}
		if first != nil && second != nil && third != nil {
			return strings.ReplaceAll(*first, *second, *third), nil
		}
		return "", nil
	},
	"guid": func(arguments ...any) (any, error) {
		id := uuid.New()
		return id.String(), nil
	},
	"uuid": func(arguments ...any) (any, error) {
		id := uuid.New()
		return id.String(), nil
	},
}

func GetFrameWithComputedColumns(frame *data.Frame, columns []querySrv.InfinityColumn) (*data.Frame, error) {
	var err error
	frameLen := frame.Rows()
	for _, column := range columns {
		if strings.TrimSpace(column.Selector) == "" {
			continue
		}
		out := []any{}
		parsedExpression, err := govaluate.NewEvaluableExpressionWithFunctions(column.Selector, expressionFunctions)
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
