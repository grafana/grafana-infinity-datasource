package framesql

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetValuePointer(t *testing.T) {
	s := "foo"
	b := true
	f64 := float64(1)
	f32 := float32(1)
	i := int(1)
	i64 := int64(1)
	i32 := int32(1)
	i16 := int16(1)
	i8 := int8(1)
	tests := []struct {
		name  string
		input any
		want  any
	}{
		{input: nil, want: nil},
		{input: f64, want: &f64},
		{input: &f64, want: &f64},
		{input: f32, want: &f64},
		{input: &f32, want: &f64},
		{input: i, want: &f64},
		{input: &i, want: &f64},
		{input: i64, want: &f64},
		{input: &i64, want: &f64},
		{input: i32, want: &f64},
		{input: &i32, want: &f64},
		{input: i16, want: &f64},
		{input: &i16, want: &f64},
		{input: i8, want: &f64},
		{input: &i8, want: &f64},
		{input: s, want: &s},
		{input: &s, want: &s},
		{input: b, want: &b},
		{input: &b, want: &b},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := GetValuePointer(tt.input)
			require.Equal(t, tt.want, got)
		})
	}
}

func TestGetValue(t *testing.T) {
	f64 := float64(1)
	f32 := float32(1)
	i := int(1)
	i64 := int64(1)
	i32 := int32(1)
	i16 := int16(1)
	i8 := int8(1)
	s := "foo"
	b := true
	tests := []struct {
		name  string
		input any
		want  any
	}{
		{input: nil, want: nil},
		{input: f64, want: f64},
		{input: &f64, want: f64},
		{input: f32, want: f64},
		{input: &f32, want: f64},
		{input: i, want: f64},
		{input: &i, want: f64},
		{input: i64, want: f64},
		{input: &i64, want: f64},
		{input: i32, want: f64},
		{input: &i32, want: f64},
		{input: i16, want: f64},
		{input: &i16, want: f64},
		{input: i8, want: f64},
		{input: &i8, want: f64},
		{input: s, want: s},
		{input: &s, want: s},
		{input: b, want: b},
		{input: &b, want: b},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := GetValue(tt.input)
			require.Equal(t, tt.want, got)
		})
	}
}
