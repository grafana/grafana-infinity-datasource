package infinity

import (
	"context"
	"errors"
	"strings"

	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
)

func UpdateQueryWithReferenceData(ctx context.Context, query querySrv.Query, settings models.InfinitySettings) (querySrv.Query, error) {
	if query.Source == "reference" {
		for _, item := range settings.ReferenceData {
			if strings.EqualFold(item.Name, query.RefName) {
				query.Source = "inline"
				query.Data = item.Data
				return query, nil
			}
		}
		return query, errors.New("error getting reference data. Either empty or not defined")
	}
	return query, nil
}
