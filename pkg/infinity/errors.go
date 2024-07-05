package infinity

import (
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

func ErrorSourceFromFrameMeta(frame *data.Frame) *backend.ErrorSource {
	if frame == nil || frame.Meta == nil || frame.Meta.Custom == nil {
		return nil
	}
	if meta, ok := frame.Meta.Custom.(CustomMeta); ok {
		return meta.ErrorSource
	}
	return nil
}
