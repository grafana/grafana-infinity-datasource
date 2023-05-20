package transformations

import (
	"errors"

	"github.com/grafana/grafana-plugin-sdk-go/data"
)

type MergeFramesOptions struct {
}

// Merge transformation used to merge multiple dataframe of same structure into single frame
// Requirement: Fields length should be same across the frame
// Requirement: Field names for all the input frames must be same
// Requirement: Fields must not have labels. Any labels for the fields will be ignored
// Requirement: Field must be in same order. (??)
// Ref: https://github.com/grafana/grafana/blob/v9.5.2/packages/grafana-data/src/transformations/transformers/merge.ts
func Merge(inputFrames []*data.Frame, option MergeFramesOptions) (*data.Frame, error) {
	if len(inputFrames) < 1 {
		return nil, errors.New("no frames supplied for merge frame transformation")
	}
	outFrame := inputFrames[0]
	for frameId, frame := range inputFrames {
		if frameId == 0 {
			continue
		}
		if len(outFrame.Fields) != len(frame.Fields) {
			return nil, errors.New("unable to merge fields due to different fields")
		}
		for fi, f := range frame.Fields {
			if f.Name != outFrame.Fields[fi].Name {
				return nil, errors.New("unable to merge field due to different field names")
			}
			if f.Type() != outFrame.Fields[fi].Type() {
				return nil, errors.New("unable to merge fields due to different field types")
			}
		}
		for rowId := 0; rowId < frame.Rows(); rowId++ {
			fieldValues := []any{}
			for fieldId := range frame.Fields {
				fieldValues = append(fieldValues, frame.At(fieldId, rowId))
			}
			outFrame.AppendRow(fieldValues...)
		}
	}
	// // TODO: Perform proper merging. Check for field names match, field length, field type, field order, field labels etc
	// // https://github.com/grafana/grafana/blob/v9.5.2/packages/grafana-data/src/transformations/transformers/merge.ts
	// emptyFrame := data.NewFrame(firstFrame.Name).SetMeta(firstFrame.Meta)
	// emptyFrame.RefID = firstFrame.RefID
	// for _, frame := range input {
	// 	for _, field := range frame.Fields {
	// 		if !fieldExists(emptyFrame, field) {
	// 			newField := data.NewFieldFromFieldType(field.Type(), 0)
	// 			newField.Name = field.Name
	// 			emptyFrame.Fields = append(emptyFrame.Fields, newField)
	// 		}
	// 	}
	// }
	// //
	return outFrame, nil
}
