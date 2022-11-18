package seriesgen

import (
	"math"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

type FieldSource string

const (
	FieldSourceCount FieldSource = "count"
	FieldSourceStep  FieldSource = "step"
)

type FieldGenType string

const (
	FieldGenString                FieldGenType = "string"
	FieldGenStringNullable        FieldGenType = "string-nullable"
	FieldGenStringExpression      FieldGenType = "string-expression"
	FieldGenFloat64               FieldGenType = "float64"
	FieldGenFloat64Nullable       FieldGenType = "float64-nullable"
	FieldGenFloat64Expression     FieldGenType = "float64-expression"
	FieldGenInt64                 FieldGenType = "int64"
	FieldGenInt64Nullable         FieldGenType = "int64-nullable"
	FieldGenInt64Expression       FieldGenType = "int64-expression"
	FieldGenBoolean               FieldGenType = "boolean"
	FieldGenBooleanNullable       FieldGenType = "boolean-nullable"
	FieldGenBooleanExpression     FieldGenType = "boolean-expression"
	FieldGenTimestamp             FieldGenType = "timestamp"
	FieldGenTimestampAuto         FieldGenType = "timestamp-auto"
	FieldGenTimestampSeconds      FieldGenType = "timestamp-seconds"
	FieldGenTimestampMilliSeconds FieldGenType = "timestamp-milliseconds"
	FieldGenTimestampExpression   FieldGenType = "timestamp-expression"
)

type GenerateFieldInput struct {
	Name      string            `json:"name"`
	Labels    data.Labels       `json:"labels"`
	Type      FieldGenType      `json:"genType"`
	TimeRange backend.TimeRange `json:"timeRange"`
	Source    FieldSource       `json:"genSource"`
	Count     int64             `json:"genCount"`
	Disabled  bool              `json:"disabled"`
	Config    *data.FieldConfig `json:"config"`
}

func GenerateField(input GenerateFieldInput) *data.Field {
	if input.Count < 1 {
		input.Count = 1
	}
	if input.Source == "" {
		input.Source = FieldSourceStep
	}
	fieldLength := GetFieldLength(input.Source, input.Count, input.TimeRange)
	fieldValues := make([]any, fieldLength)
	field := data.NewField(input.Name, input.Labels, fieldValues)
	return field
}

func GetFieldLength(source FieldSource, count int64, timeRange backend.TimeRange) int {
	fieldLength := 1
	if source == FieldSourceStep {
		diffSeconds := timeRange.To.Sub(timeRange.From).Seconds()
		fieldLength = int(math.Floor(diffSeconds / float64(count)))
	}
	if source == FieldSourceCount {
		fieldLength = int(count)
	}
	return fieldLength
}
