package infinity

import (
	"context"

	"github.com/gorilla/mux"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
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
	client Client
}

func NewDatasource() datasource.ServeOpts {
	instance := &InfinityDatasource{
		im: datasource.NewInstanceManager(getInstance),
	}
	router := mux.NewRouter()
	router.HandleFunc("/proxy", instance.proxyHandler)
	return datasource.ServeOpts{
		CheckHealthHandler:  instance,
		QueryDataHandler:    instance,
		CallResourceHandler: httpadapter.New(router),
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
	client, err := NewClient(*settings)
	if err != nil {
		return nil, err
	}
	return &InfintiyInstance{
		client: *client,
	}, nil
}
