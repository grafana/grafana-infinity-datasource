package infinity

import (
	"context"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/stretchr/testify/require"
)

func TestPostProcessFrameNodeGraphArcColors(t *testing.T) {
	newFrame := func() *data.Frame {
		return data.NewFrame("response",
			data.NewField("id", nil, []string{"id1", "id2"}),
			data.NewField("arc__1", nil, []float64{0.3, 0.8}),
			data.NewField("arc__2", nil, []float64{0.7, 0.2}),
			data.NewField("arc__1_color", nil, []string{"red", "red"}),
			data.NewField("arc__2_color", nil, []*string{nil, strPtr("blue")}),
			data.NewField("arc__10", nil, []float64{0, 0}),
		)
	}
	t.Run("node graph format moves arc colors into field config", func(t *testing.T) {
		got, err := PostProcessFrame(context.Background(), newFrame(), models.Query{Format: "node-graph-nodes"})
		require.NoError(t, err)
		names := []string{}
		for _, field := range got.Fields {
			names = append(names, field.Name)
		}
		require.Equal(t, []string{"id", "arc__1", "arc__2", "arc__10"}, names)
		require.Equal(t, "1", got.Fields[1].Config.DisplayName)
		require.Equal(t, map[string]interface{}{"mode": "fixed", "fixedColor": "red"}, got.Fields[1].Config.Color)
		require.Equal(t, map[string]interface{}{"mode": "fixed", "fixedColor": "blue"}, got.Fields[2].Config.Color)
		require.Nil(t, got.Fields[3].Config)
	})
	t.Run("other formats keep the color fields", func(t *testing.T) {
		got, err := PostProcessFrame(context.Background(), newFrame(), models.Query{Format: "table"})
		require.NoError(t, err)
		require.Len(t, got.Fields, 6)
	})
}

func strPtr(s string) *string { return &s }
