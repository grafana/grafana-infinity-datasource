package transformations

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"gopkg.in/Knetic/govaluate.v3"
)

var ExpressionFunctions = map[string]govaluate.ExpressionFunction{
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
