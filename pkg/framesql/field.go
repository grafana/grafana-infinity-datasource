package framesql

import (
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/data"
)

func ConvertFieldValuesToField(input []any, name string) *data.Field {
	field := EmptyField(input, name)
	for idx, item := range input {
		if item != nil {
			field.Set(idx, GetValuePointer(item))
		}
	}
	return field
}

func EmptyField(input []any, fieldName string) *data.Field {
	for _, i := range input {
		if i == nil {
			continue
		}
		switch i.(type) {
		case string, *string:
			return data.NewField(fieldName, nil, make([]*string, len(input)))
		case float64, float32, int, int64, int32, *float64, *float32, *int, *int64, *int32:
			return data.NewField(fieldName, nil, make([]*float64, len(input)))
		case bool, *bool:
			return data.NewField(fieldName, nil, make([]*bool, len(input)))
		case time.Time, *time.Time:
			return data.NewField(fieldName, nil, make([]*time.Time, len(input)))
		default:
			continue
		}
	}
	return data.NewField(fieldName, nil, make([]*string, len(input)))
}
