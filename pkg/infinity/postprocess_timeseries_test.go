package infinity

import (
	"context"
	"testing"
	"time"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/stretchr/testify/require"
)

func TestPostProcessFrameTimeSeriesUnsortedLongFrame(t *testing.T) {
	ts := func(s string) time.Time {
		v, err := time.Parse("2006-01-02 15:04", s)
		require.NoError(t, err)
		return v
	}
	// Rows from #1661: the last one is earlier than the rows before it.
	frame := data.NewFrame("response",
		data.NewField("time", nil, []time.Time{
			ts("2025-10-09 00:55"), ts("2025-10-16 16:52"), ts("2025-10-29 14:52"),
			ts("2025-11-09 00:55"), ts("2025-11-16 16:52"), ts("2025-11-29 14:52"),
			ts("2025-12-09 00:55"), ts("2025-12-16 16:52"), ts("2025-12-29 14:52"),
			ts("2025-10-18 14:58"),
		}),
		data.NewField("environ", nil, []string{"amd", "amd", "amd", "amd", "amd", "amd", "amd", "amd", "amd", "amd"}),
		data.NewField("node", nil, []string{
			"pine-n50", "pine-n51", "pine-n52", "pine-n50", "pine-n51", "pine-n52", "pine-n50", "pine-n51", "pine-n52", "pine-n53",
		}),
		data.NewField("perf", nil, []float64{93, 92, 91, 92, 90, 91, 89, 92, 89, 90}),
	)
	require.Equal(t, data.TimeSeriesTypeLong, frame.TimeSeriesSchema().Type)

	got, err := PostProcessFrame(context.Background(), frame, models.Query{Format: "timeseries"})
	require.NoError(t, err)
	require.Equal(t, data.TimeSeriesTypeWide, got.TimeSeriesSchema().Type)

	nodes := map[string]bool{}
	for _, field := range got.Fields[1:] {
		nodes[field.Labels["node"]] = true
	}
	require.Equal(t, map[string]bool{"pine-n50": true, "pine-n51": true, "pine-n52": true, "pine-n53": true}, nodes)

	timeField := got.Fields[0]
	for i := 1; i < timeField.Len(); i++ {
		require.False(t, timeField.At(i).(time.Time).Before(timeField.At(i-1).(time.Time)), "time must be ascending")
	}
}

func TestSortLongFrameByTime(t *testing.T) {
	t0 := time.Unix(0, 0).UTC()
	t1 := t0.Add(time.Minute)
	t2 := t0.Add(2 * time.Minute)
	t.Run("keeps an already sorted frame as is", func(t *testing.T) {
		frame := data.NewFrame("f",
			data.NewField("time", nil, []time.Time{t0, t1}),
			data.NewField("value", nil, []float64{1, 2}),
		)
		require.Same(t, frame, sortLongFrameByTime(frame))
	})
	t.Run("sorts rows and puts null times last", func(t *testing.T) {
		frame := data.NewFrame("f",
			data.NewField("time", nil, []*time.Time{&t2, nil, &t0, &t1}),
			data.NewField("value", data.Labels{"a": "b"}, []float64{3, 9, 1, 2}),
		)
		frame.RefID = "A"
		got := sortLongFrameByTime(frame)
		require.Equal(t, "A", got.RefID)
		require.Equal(t, data.Labels{"a": "b"}, got.Fields[1].Labels)
		require.Equal(t, []float64{1, 2, 3, 9}, []float64{
			got.Fields[1].At(0).(float64), got.Fields[1].At(1).(float64), got.Fields[1].At(2).(float64), got.Fields[1].At(3).(float64),
		})
		require.Nil(t, got.Fields[0].At(3))
	})
}
