package infinity

import (
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type InfinityQuery struct {
}

func GetQuery(query backend.DataQuery) (InfinityQuery, error) {
	return InfinityQuery{}, ErrorNotImplemented
}
