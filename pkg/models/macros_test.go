package models_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestInterPolateCombineValueMacros(t *testing.T) {
	tests := []struct {
		name          string
		query         string
		pluginContext backend.PluginContext
		want          string
		wantError     error
	}{
		{query: "foo", want: "foo"},
		{query: "$__combineValues", wantError: backend.DownstreamError(errors.New("insufficient arguments to combineValues macro"))},
		{query: "$__combineValues()", wantError: backend.DownstreamError(errors.New("insufficient arguments to combineValues macro"))},
		{query: "$__combineValues(a,b,c)", wantError: backend.DownstreamError(errors.New("insufficient arguments to combineValues macro"))},
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
			got, err := models.InterPolateMacros(tt.query, backend.TimeRange{
				From: time.Unix(0, 1500376552001*1e6).In(time.UTC),
				To:   time.Unix(0, 1500376552002*1e6).In(time.UTC),
			}, tt.pluginContext)
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
func TestInterPolateFromToMacros(t *testing.T) {
	tr := &backend.TimeRange{From: time.UnixMilli(1594671549254).UTC()}
	tests := []struct {
		name          string
		query         string
		pluginContext backend.PluginContext
		want          string
		wantError     error
		timeRange     *backend.TimeRange
	}{
		{query: "foo", want: "foo"},
		{query: "${__from}", want: "1500376552001"},
		{query: "${__from:date}", want: "2017-07-18T11:15:52.001Z"},
		{query: "${__from:date:iso}", want: "2017-07-18T11:15:52.001Z"},
		{query: "foo ${__from:date:YYYY:MM:DD:hh:mm} bar", want: "foo 2017:07:18:11:15 bar"},
		{query: "foo ${__to:date:YYYY-MM-DD:hh,mm} bar", want: "foo 2017-07-18:11,15 bar"},
		{query: "${__timeFrom}", want: "1594671549254", timeRange: tr},
		{query: "${__timeFrom:date:seconds}", want: "1594671549", timeRange: tr},
		{query: "${__timeFrom:date}", want: "2020-07-13T20:19:09.254Z", timeRange: tr},
		{query: "${__timeFrom:date:iso}", want: "2020-07-13T20:19:09.254Z", timeRange: tr},
		{query: "${__timeFrom:date:YYYY:MM:DD:hh:mm}", want: "2020:07:13:08:19", timeRange: tr},
		{query: "${__timeFrom:date:YYYY-MM-DD}", want: "2020-07-13", timeRange: tr},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tr := tt.timeRange
			if tr == nil {
				tr = &backend.TimeRange{
					From: time.Unix(0, 1500376552001*1e6).In(time.UTC),
					To:   time.Unix(0, 1500376552002*1e6).In(time.UTC),
				}
			}
			got, err := models.InterPolateMacros(tt.query, *tr, tt.pluginContext)
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
		name          string
		query         string
		from          int64
		to            int64
		pluginContext backend.PluginContext
		want          string
		wantError     error
	}{
		{query: "foo", want: "foo"},
		{query: "$__customInterval", want: ""},
		{query: "$__customInterval()", want: ""},
		{query: "$__customInterval(1d)", want: "1d"},
		{query: "$__customInterval(1m,1 MIN)", want: "1 MIN"},
		{query: "$__customInterval(1m,1 MIN,1d)", want: "1d"},
		{query: "$__customInterval(1min,1 MIN,1d)", wantError: backend.DownstreamError(errors.New("invalid customInterval macro"))},
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
			got, err := models.InterPolateMacros(tt.query, backend.TimeRange{From: time.UnixMilli(from), To: time.UnixMilli(to)}, tt.pluginContext)
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
func TestApplyMacros(t *testing.T) {
	tests := []struct {
		name          string
		query         models.Query
		pluginContext backend.PluginContext
		want          models.Query
		wantErr       error
	}{
		{
			query: models.Query{
				URL:  "foo_$__customInterval(1m,1 MIN)",
				UQL:  "UQL_$__customInterval(1m,1 MIN)",
				GROQ: "GROQ_$__customInterval(1m,1 MIN)",
				Data: "Data_$__customInterval(1m,1 MIN)",
				URLOptions: models.URLOptions{
					Body:                 "Body_$__customInterval(1m,1 MIN)",
					BodyGraphQLQuery:     "GraphQL_$__customInterval(1m,1 MIN)",
					BodyGraphQLVariables: "",
					Params: []models.URLOptionKeyValuePair{
						{Key: "p1", Value: "v1_$__customInterval(1m,1 MIN)"},
						{Key: "p2", Value: "v2"},
						{Key: "p3", Value: "v3_$__customInterval(1m,1 MIN)"},
					},
				},
				ComputedColumns: []models.InfinityColumn{
					{Selector: "'${__from:date:YYYY-MM-DDThh:mm:ss}' + 'Z'", Text: "from"},
					{Selector: "'${__to:date:YYYY-MM-DDThh:mm:ss}' + 'Z'", Text: "to"},
				},
				FilterExpression: "${__from}",
			},
			want: models.Query{
				URL:  "foo_1 MIN",
				UQL:  "UQL_1 MIN",
				GROQ: "GROQ_1 MIN",
				Data: "Data_1 MIN",
				URLOptions: models.URLOptions{
					Body:             "Body_1 MIN",
					BodyGraphQLQuery: "GraphQL_1 MIN",
					Params: []models.URLOptionKeyValuePair{
						{Key: "p1", Value: "v1_1 MIN"},
						{Key: "p2", Value: "v2"},
						{Key: "p3", Value: "v3_1 MIN"},
					},
				},
				ComputedColumns: []models.InfinityColumn{
					{Selector: "'2021-01-14T12:00:00' + 'Z'", Text: "from"},
					{Selector: "'2021-01-15T12:00:00' + 'Z'", Text: "to"},
				},
				FilterExpression: "1610582400000",
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := models.ApplyMacros(context.Background(), tt.query, backend.TimeRange{From: time.UnixMilli(1610582400000).UTC(), To: time.UnixMilli(1610668800000).UTC()}, tt.pluginContext)
			if tt.wantErr != nil {
				require.NotNil(t, err)
				assert.Equal(t, tt.wantErr, err)
				return
			}
			require.Nil(t, err)
			require.NotNil(t, got)
			assert.Equal(t, tt.want, got)
		})
	}
}
