package transformations

import "github.com/grafana/grafana-plugin-sdk-go/data"

type LimitOptions struct {
	LimitField int `json:"limitField,omitempty"`
}

func Limit(input []*data.Frame, options LimitOptions) ([]*data.Frame, error) {
	limit := options.LimitField
	if limit <= 0 {
		limit = 10
	}
	for _, frame := range input {
		if frame != nil {
			rowsCount := frame.Rows()
			for i := limit; i < rowsCount; i++ {
				frame.DeleteRow(limit)
			}
		}
	}
	return input, nil
}
