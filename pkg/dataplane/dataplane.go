package dataplane

import "github.com/grafana/grafana-plugin-sdk-go/data"

type fieldTypeCount struct {
	unknownFields int
	numericFields int
	boolFields    int
	stringFields  int
	timeFields    int
	jsonFields    int
	enumFields    int
}

func getFieldTypesCount(frame *data.Frame) fieldTypeCount {
	res := fieldTypeCount{
		unknownFields: 0,
		numericFields: 0,
		boolFields:    0,
		stringFields:  0,
		timeFields:    0,
		jsonFields:    0,
	}
	for _, field := range frame.Fields {
		switch field.Type() {
		case data.FieldTypeFloat64,
			data.FieldTypeFloat32,
			data.FieldTypeNullableFloat64,
			data.FieldTypeNullableFloat32,
			data.FieldTypeInt64,
			data.FieldTypeInt32,
			data.FieldTypeInt16,
			data.FieldTypeInt8,
			data.FieldTypeNullableInt64,
			data.FieldTypeNullableInt32,
			data.FieldTypeNullableInt16,
			data.FieldTypeNullableInt8,
			data.FieldTypeUint64,
			data.FieldTypeUint32,
			data.FieldTypeUint16,
			data.FieldTypeUint8,
			data.FieldTypeNullableUint64,
			data.FieldTypeNullableUint32,
			data.FieldTypeNullableUint16,
			data.FieldTypeNullableUint8:
			res.numericFields++
		case data.FieldTypeBool,
			data.FieldTypeNullableBool:
			res.boolFields++
		case data.FieldTypeString,
			data.FieldTypeNullableString:
			res.stringFields++
		case data.FieldTypeTime,
			data.FieldTypeNullableTime:
			res.timeFields++
		case data.FieldTypeJSON,
			data.FieldTypeNullableJSON:
			res.jsonFields++
		case data.FieldTypeEnum,
			data.FieldTypeNullableEnum:
			res.enumFields++
		default:
			res.unknownFields++
		}
	}
	return res
}

// IsNumericWideFrame asserts if the data frame comply with numeric wide type
// https://grafana.com/developers/dataplane/numeric#numeric-wide-format-numericwide
func IsNumericWideFrame(frame *data.Frame) bool {
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

// IsNumericLongFrame asserts if the data frame comply with numeric long type
// https://grafana.com/developers/dataplane/numeric#numeric-long-format-numericlong-sql-table-like
func IsNumericLongFrame(frame *data.Frame) bool {
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
