package infinity

import (
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type InfinityConfig struct{}

func (ic *InfinityConfig) validate() error {
	return ErrorNotImplemented
}

func GetSettings(s backend.DataSourceInstanceSettings) (*InfinityConfig, error) {
	return &InfinityConfig{}, ErrorNotImplemented
}
