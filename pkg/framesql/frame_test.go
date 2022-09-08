package framesql

import (
	"errors"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestEvaluateInFrame(t *testing.T) {
	tests := []struct {
		name       string
		expression string
		input      *data.Frame
		want       interface{}
		wantErr    error
	}{
		{
			wantErr: errors.New("empty/invalid expression."),
		},
		{
			input:      data.NewFrame("test", data.NewField("sample", nil, []*float64{toFP(1), toFP(2), toFP(0.5), toFP(1.5)})),
			expression: `count(sample)`,
			want:       float64(4),
		},
		{
			input:      data.NewFrame("test", data.NewField("sample", nil, []*float64{toFP(1), toFP(2), toFP(0.5), toFP(1.5)})),
			expression: `sum(sample)`,
			want:       float64(5),
		},
		{
			input:      data.NewFrame("test", data.NewField("sample", nil, []*float64{toFP(1), toFP(2), toFP(0.5), toFP(1.5)})),
			expression: `min(sample)`,
			want:       float64(0.5),
		},
		{
			input:      data.NewFrame("test", data.NewField("sample", nil, []*float64{toFP(1), toFP(2), toFP(0.5), toFP(1.5)})),
			expression: `max(sample)`,
			want:       float64(2),
		},
		{
			input:      data.NewFrame("test", data.NewField("hello 1st world!", nil, []*float64{toFP(1), toFP(2), toFP(0.5), toFP(1.5)})),
			expression: `mean(hello_1st_world_)`,
			want:       float64(1.25),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := EvaluateInFrame(tt.expression, tt.input)
			if tt.wantErr != nil {
				require.NotNil(t, err)
				assert.Equal(t, tt.wantErr, err)
				return
			}
			require.NoError(t, err)
			require.NotNil(t, got)
			assert.Equal(t, tt.want, got)
		})
	}
}

func toFP(v float64) *float64 {
	return &v
}
