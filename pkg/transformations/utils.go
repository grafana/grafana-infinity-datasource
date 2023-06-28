package transformations

import "github.com/grafana/grafana-plugin-sdk-go/data"

// FieldExists checks if a field exist in a frame
// only field type and field name for uniqueness
func FieldExists(frame *data.Frame, field *data.Field) bool {
	for _, f := range frame.Fields {
		if field.Name == f.Name && field.Type() == f.Type() {
			return true
		}
	}
	return false
}
