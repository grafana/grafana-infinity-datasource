package framesql

import (
	"time"
)

func GetValue(input any) any {
	if v, ok := input.(*float64); ok {
		if v == nil {
			return 0
		}
		v1 := float64(*v)
		return v1
	}
	if v, ok := input.(*float32); ok {
		if v == nil {
			return 0
		}
		v1 := float64(*v)
		return v1
	}
	if v, ok := input.(float32); ok {
		return float64(v)
	}
	if v, ok := input.(*int); ok {
		if v == nil {
			return 0
		}
		v1 := float64(*v)
		return v1
	}
	if v, ok := input.(int); ok {
		return float64(v)
	}
	if v, ok := input.(*int64); ok {
		if v == nil {
			return 0
		}
		v1 := float64(*v)
		return v1
	}
	if v, ok := input.(int64); ok {
		return float64(v)
	}
	if v, ok := input.(*int32); ok {
		if v == nil {
			return 0
		}
		v1 := float64(*v)
		return v1
	}
	if v, ok := input.(int32); ok {
		return float64(v)
	}
	if v, ok := input.(*int16); ok {
		if v == nil {
			return 0
		}
		v1 := float64(*v)
		return v1
	}
	if v, ok := input.(int16); ok {
		return float64(v)
	}
	if v, ok := input.(*int8); ok {
		if v == nil {
			return 0
		}
		v1 := float64(*v)
		return v1
	}
	if v, ok := input.(int8); ok {
		return float64(v)
	}
	if v, ok := input.(*string); ok {
		if v == nil {
			return ""
		}
		v1 := *v
		return v1
	}
	if v, ok := input.(*bool); ok {
		if v == nil {
			return false
		}
		return *v
	}
	if v, ok := input.(*time.Time); ok {
		if v == nil {
			return time.Unix(0, 0)
		}
		return *v
	}
	return input
}

func GetValuePointer(input any) any {
	if input == nil {
		return nil
	}
	if v, ok := input.(float64); ok {
		v1 := &v
		return v1
	}
	if v, ok := input.(*float64); ok {
		return v
	}
	if v, ok := input.(float32); ok {
		v1 := float64(v)
		return &v1
	}
	if v, ok := input.(*float32); ok {
		v1 := float64(*v)
		return &v1
	}
	if v, ok := input.(int); ok {
		v1 := float64(v)
		return &v1
	}
	if v, ok := input.(*int); ok {
		v1 := float64(*v)
		return &v1
	}
	if v, ok := input.(int64); ok {
		v1 := float64(v)
		return &v1
	}
	if v, ok := input.(*int64); ok {
		v1 := float64(*v)
		return &v1
	}
	if v, ok := input.(int32); ok {
		v1 := float64(v)
		return &v1
	}
	if v, ok := input.(*int32); ok {
		v1 := float64(*v)
		return &v1
	}
	if v, ok := input.(int16); ok {
		v1 := float64(v)
		return &v1
	}
	if v, ok := input.(*int16); ok {
		v1 := float64(*v)
		return &v1
	}
	if v, ok := input.(int8); ok {
		v1 := float64(v)
		return &v1
	}
	if v, ok := input.(*int8); ok {
		v1 := float64(*v)
		return &v1
	}
	if v, ok := input.(string); ok {
		return &v
	}
	if v, ok := input.(*string); ok {
		return v
	}
	if v, ok := input.(bool); ok {
		return &v
	}
	if v, ok := input.(*bool); ok {
		return v
	}
	if v, ok := input.(time.Time); ok {
		return &v
	}
	if v, ok := input.(*time.Time); ok {
		return v
	}
	return input
}
