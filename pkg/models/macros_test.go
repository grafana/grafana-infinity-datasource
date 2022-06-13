package models

import (
	"errors"
	"testing"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/require"
)

func TestInterPolateCombineValueMacros(t *testing.T) {
	tests := []struct {
		name      string
		query     string
		want      string
		wantError error
	}{
		{query: "foo", want: "foo"},
		{query: "$__combineValues", wantError: errors.New("insufficient arguments to combineValues macro")},
		{query: "$__combineValues()", wantError: errors.New("insufficient arguments to combineValues macro")},
		{query: "$__combineValues(a,b,c)", wantError: errors.New("insufficient arguments to combineValues macro")},
		{query: "$__combineValues(a,b,c,*)", want: ""},
		{query: "$__combineValues(a,b,c,d)", want: "adb"},
		{query: "$__combineValues(a,b,__space,d,e)", want: "adb aeb"},
		{query: "$__combineValues(a,b, ,d,e)", want: "adb aeb"},
		{query: "$__combineValues(__open,__close, OR ,foo,bar)", want: "(foo) OR (bar)"},
		{query: "$__combineValues(,, OR ,foo,bar)", want: "foo OR bar"},
		{query: "hello $__combineValues(,, OR ,foo,bar) $__combineValues(,, OR ,foo,bar) world", want: "hello foo OR bar foo OR bar world"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := InterPolateMacros(tt.query, backend.TimeRange{
				From: time.Unix(0, 1500376552001*1e6),
				To:   time.Unix(0, 1500376552002*1e6),
			})
			if tt.wantError != nil {
				require.NotNil(t, err)
				require.Equal(t, tt.wantError, err)
				return
			}
			require.Nil(t, err)
			require.Equal(t, tt.want, got)
		})
	}
}
func TestInterPolateCustomIntervalMacros(t *testing.T) {
	tests := []struct {
		name      string
		query     string
		from      int64
		to        int64
		want      string
		wantError error
	}{
		{query: "foo", want: "foo"},
		{query: "$__customInterval", want: ""},
		{query: "$__customInterval()", want: ""},
		{query: "$__customInterval(1d)", want: "1d"},
		{query: "$__customInterval(1m,1 MIN)", want: "1 MIN"},
		{query: "$__customInterval(1m,1 MIN,1d)", want: "1d"},
		{query: "$__customInterval(1min,1 MIN,1d)", wantError: errors.New("invalid customInterval macro")},
		{query: "$__customInterval(2d,2 DAYS,1d)", want: "2 DAYS"},
		{query: "$__customInterval(5m,5 MINUTES,1d,1 DAY,10d,10 days,1d)", want: "1 DAY"},
		{query: "foo $__customInterval(5m,5 MINUTES,1d,1 DAY,10d,10 days,1d) $__customInterval(2d,2 DAYS,1d) bar", want: "foo 1 DAY 2 DAYS bar"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			from := tt.from
			to := tt.to
			if from == 0 {
				from = 1610582400000 // Unix ms:  1610582400000 // Thu Jan 14 2021 00:00:00 GMT+0000 (Greenwich Mean Time)
			}
			if to == 0 {
				to = 1610668800000 // Unix ms:  1610668800000 // Fri Jan 15 2021 00:00:00 GMT+0000 (Greenwich Mean Time)
			}
			got, err := InterPolateMacros(tt.query, backend.TimeRange{From: time.UnixMilli(from), To: time.UnixMilli(to)})
			if tt.wantError != nil {
				require.NotNil(t, err)
				require.Equal(t, tt.wantError, err)
				return
			}
			require.Nil(t, err)
			require.Equal(t, tt.want, got)
		})
	}
}
