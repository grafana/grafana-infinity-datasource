package infinity

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
)

type InfinityDatasource struct {
	im instancemgmt.InstanceManager
}

func (ds *InfinityDatasource) getDatasourceInstance(ctx context.Context, pluginCtx backend.PluginContext) (*InfintiyInstance, error) {
	s, err := ds.im.Get(pluginCtx)
	if err != nil {
		return nil, err
	}
	return s.(*InfintiyInstance), nil
}

type InfintiyInstance struct {
	settings InfinityConfig
}

func NewDatasource() datasource.ServeOpts {
	instance := &InfinityDatasource{
		im: datasource.NewInstanceManager(getInstance),
	}
	return datasource.ServeOpts{
		CheckHealthHandler:  instance,
		QueryDataHandler:    instance,
		CallResourceHandler: instance,
	}
}

func getInstance(s backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	settings, err := GetSettings(s)
	if err != nil {
		return nil, err
	}
	err = settings.validate()
	if err != nil {
		return nil, err
	}
	return &InfintiyInstance{
		settings: *settings,
	}, nil
}
