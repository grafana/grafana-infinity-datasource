package framesql

import (
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"gopkg.in/Knetic/govaluate.v3"
)

func EvaluateInFrame(expression string, input *data.Frame) (any, error) {
	if strings.TrimSpace(expression) == "" {
		return nil, errors.New(strings.TrimSpace(fmt.Sprintf("empty/invalid expression. %s", expression)))
	}
	parsedExpression, err := govaluate.NewEvaluableExpressionWithFunctions(expression, expressionFunctions)
	if err != nil {
		return nil, err
	}
	frameLen, _ := input.RowLen()
	parameters := map[string]any{"frame": input, "recordsCount": frameLen}
	if input != nil {
		for _, field := range input.Fields {
			parameters[SlugifyFieldName(field.Name)] = field
			parameters[field.Name] = field
		}
	}
	result, err := parsedExpression.Evaluate(parameters)
	return result, err
}

var expressionFunctions = map[string]govaluate.ExpressionFunction{
	"count": func(arguments ...any) (any, error) {
		if len(arguments) < 1 {
			return nil, errors.New("invalid arguments to count method")
		}
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		return float64(field.Len()), nil
	},
	"first": func(arguments ...any) (any, error) {
		if len(arguments) < 1 {
			return nil, errors.New("invalid arguments to first method")
		}
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		if v, ok := field.At(0).(*float64); ok {
			return *v, nil
		}
		if v, ok := field.At(0).(*int); ok {
			return *v, nil
		}
		if v, ok := field.At(0).(*string); ok {
			return *v, nil
		}
		if v, ok := field.At(0).(*bool); ok {
			return *v, nil
		}
		return field.At(0), nil
	},
	"last": func(arguments ...any) (any, error) {
		if len(arguments) < 1 {
			return nil, errors.New("invalid arguments to last method")
		}
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		if v, ok := field.At(field.Len() - 1).(*float64); ok {
			return *v, nil
		}
		if v, ok := field.At(field.Len() - 1).(*int); ok {
			return *v, nil
		}
		if v, ok := field.At(field.Len() - 1).(*string); ok {
			return *v, nil
		}
		if v, ok := field.At(field.Len() - 1).(*bool); ok {
			return *v, nil
		}
		return nil, errors.New("unable to find first value")
	},
	"sum": func(arguments ...any) (any, error) {
		if len(arguments) < 1 {
			return nil, errors.New("invalid arguments to sum method")
		}
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		sum := float64(0)
		for i := 0; i < field.Len(); i++ {
			if v, ok := toFloat64p(field.At(i)); ok && v != nil {
				sum += *v
			}

		}
		return sum, nil
	},
	"min": func(arguments ...any) (any, error) {
		if len(arguments) < 1 {
			return nil, errors.New("invalid arguments to min method")
		}
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		var min *float64
		for i := 0; i < field.Len(); i++ {
			if v, ok := toFloat64p(field.At(i)); ok && v != nil {
				if min == nil || *v < *min {
					min = v
				}
			}
		}
		return *min, nil
	},
	"max": func(arguments ...any) (any, error) {
		if len(arguments) < 1 {
			return nil, errors.New("invalid arguments to max method")
		}
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		var max *float64
		for i := 0; i < field.Len(); i++ {
			if v, ok := toFloat64p(field.At(i)); ok && v != nil {
				if max == nil || *v > *max {
					max = v
				}
			}
		}
		return *max, nil
	},
	"mean": func(arguments ...any) (any, error) {
		if len(arguments) < 1 {
			return nil, errors.New("invalid arguments to mean method")
		}
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		sum := float64(0)
		for i := 0; i < field.Len(); i++ {
			if v, ok := toFloat64p(field.At(i)); ok && v != nil {
				sum += *v
			}

		}
		if field.Len() < 1 {
			return 0, nil
		}
		return sum / float64(field.Len()), nil
	},
}

func SlugifyFieldName(input string) string {
	re, _ := regexp.Compile(`[^\w]`)
	input = strings.TrimSpace(re.ReplaceAllString(strings.ToLower(strings.TrimSpace(input)), "_"))
	return input
}

func toFloat64p(input any) (*float64, bool) {
	if v, ok := input.(*float64); ok {
		return v, true
	}
	if v, ok := input.(float64); ok {
		return &v, true
	}
	if v, ok := input.(*float32); ok {
		v1 := float64(*v)
		return &v1, true
	}
	if v, ok := input.(float32); ok {
		v1 := float64(v)
		return &v1, true
	}
	if v, ok := input.(*int); ok {
		v1 := float64(*v)
		return &v1, true
	}
	if v, ok := input.(int); ok {
		v1 := float64(v)
		return &v1, true
	}
	if v, ok := input.(*int64); ok {
		v1 := float64(*v)
		return &v1, true
	}
	if v, ok := input.(int64); ok {
		v1 := float64(v)
		return &v1, true
	}
	if v, ok := input.(*int32); ok {
		v1 := float64(*v)
		return &v1, true
	}
	if v, ok := input.(int32); ok {
		v1 := float64(v)
		return &v1, true
	}
	return nil, false
}
