package dataplane

import "github.com/grafana/grafana-plugin-sdk-go/data"

type fieldTypeCount struct {
	nullableFields    int
	nonNullableFields int
	unknownFields     int
	numericFields     int
	boolFields        int
	stringFields      int
	timeFields        int
	jsonFields        int
	enumFields        int
}

func getFieldTypesCount(frame *data.Frame) fieldTypeCount {
	res := fieldTypeCount{
		nullableFields:    0,
		nonNullableFields: 0,
		unknownFields:     0,
		numericFields:     0,
		boolFields:        0,
		stringFields:      0,
		timeFields:        0,
		jsonFields:        0,
	}
	for _, field := range frame.Fields {
		if field == nil {
			continue
		}
		if field.Nullable() {
			res.nullableFields++
		}
		if !field.Nullable() {
			res.nonNullableFields++
		}
		if field.Type().Numeric() {
			res.numericFields++
			continue
		}
		if field.Type().Time() {
			res.timeFields++
			continue
		}
		if field.Type().JSON() {
			res.jsonFields++
			continue
		}
		switch field.Type() {
		case data.FieldTypeBool,
			data.FieldTypeNullableBool:
			res.boolFields++
		case data.FieldTypeString,
			data.FieldTypeNullableString:
			res.stringFields++
		case data.FieldTypeEnum,
			data.FieldTypeNullableEnum:
			res.enumFields++
		default:
			res.unknownFields++
		}
	}
	return res
}

// CanBeNumericWide asserts if the data frame comply with numeric wide type
// https://grafana.com/developers/dataplane/numeric#numeric-wide-format-numericwide
func CanBeNumericWide(frame *data.Frame) bool {
	if frame == nil {
		return false
	}
	ftCount := getFieldTypesCount(frame)
	rowLen, err := frame.RowLen()
	if err != nil {
		return false
	}
	if rowLen <= 1 && (ftCount.numericFields+ftCount.boolFields) > 0 {
		return true
	}
	return false
}

// CanBeNumericLong asserts if the data frame comply with numeric long type
// https://grafana.com/developers/dataplane/numeric#numeric-long-format-numericlong-sql-table-like
func CanBeNumericLong(frame *data.Frame) bool {
	if frame == nil {
		return false
	}
	ftCount := getFieldTypesCount(frame)
	rowLen, err := frame.RowLen()
	if err != nil {
		return false
	}
	if rowLen == 1 && ftCount.numericFields > 0 && ftCount.stringFields == 0 {
		return true
	}
	if rowLen > 1 && ftCount.numericFields > 0 && ftCount.stringFields > 0 {
		return true
	}
	return false
}
