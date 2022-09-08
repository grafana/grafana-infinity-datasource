package framesql

import (
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"gopkg.in/Knetic/govaluate.v3"
)

var expressionFunctions = map[string]govaluate.ExpressionFunction{
	"count": func(arguments ...interface{}) (interface{}, error) {
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		return float64(field.Len()), nil
	},
	"first": func(arguments ...interface{}) (interface{}, error) {
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		if v, ok := field.At(0).(*float64); ok {
			return *v, nil
		}
		return nil, errors.New("unable to find first value")
	},
	"last": func(arguments ...interface{}) (interface{}, error) {
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		if v, ok := field.At(field.Len() - 1).(*float64); ok {
			return *v, nil
		}
		return nil, errors.New("unable to find first value")
	},
	"sum": func(arguments ...interface{}) (interface{}, error) {
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		sum := float64(0)
		for i := 0; i < field.Len(); i++ {
			if v, ok := field.At(i).(*float64); ok {
				sum += *v
			}

		}
		return sum, nil
	},
	"min": func(arguments ...interface{}) (interface{}, error) {
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		var min *float64
		for i := 0; i < field.Len(); i++ {
			if v, ok := field.At(i).(*float64); ok {
				if min == nil || *v < *min {
					min = v
				}
			}
		}
		return *min, nil
	},
	"max": func(arguments ...interface{}) (interface{}, error) {
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		var max *float64
		for i := 0; i < field.Len(); i++ {
			if v, ok := field.At(i).(*float64); ok {
				if max == nil || *v > *max {
					max = v
				}
			}
		}
		return *max, nil
	},
	"mean": func(arguments ...interface{}) (interface{}, error) {
		field, ok := arguments[0].(*data.Field)
		if !ok {
			return nil, errors.New("first argument is not a valid field")
		}
		sum := float64(0)
		for i := 0; i < field.Len(); i++ {
			if v, ok := field.At(i).(*float64); ok {
				sum += *v
			}

		}
		if field.Len() < 1 {
			return 0, nil
		}
		return sum / float64(field.Len()), nil
	},
}

func EvaluateInFrame(expression string, input *data.Frame) (interface{}, error) {
	if strings.TrimSpace(expression) == "" {
		return nil, errors.New(strings.TrimSpace(fmt.Sprintf("empty/invalid expression. %s", expression)))
	}
	parsedExpression, err := govaluate.NewEvaluableExpressionWithFunctions(expression, expressionFunctions)
	if err != nil {
		return nil, err
	}
	parameters := map[string]interface{}{
		"frame": input,
	}
	if input != nil {
		for _, field := range input.Fields {
			parameters[slugifyFieldName(field.Name)] = field
		}
	}
	result, err := parsedExpression.Evaluate(parameters)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func slugifyFieldName(input string) string {
	re, _ := regexp.Compile(`[^\w]`)
	input = strings.TrimSpace(re.ReplaceAllString(strings.ToLower(strings.TrimSpace(input)), "_"))
	return input
}
