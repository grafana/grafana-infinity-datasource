package main_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
)

func Test_main(t *testing.T) {
	t.Run("Plugin ID", func(t *testing.T) {
		assert.Equal(t, "yesoreyeram-infinity-datasource", infinity.PluginID)
	})
}
