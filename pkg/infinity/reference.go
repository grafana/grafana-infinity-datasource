package infinity

import (
	"context"
	"errors"
	"strings"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/errorsource"
)

func UpdateQueryWithReferenceData(ctx context.Context, query models.Query, settings models.InfinitySettings) (models.Query, error) {
	if query.Source == "reference" {
		for _, item := range settings.ReferenceData {
			if strings.EqualFold(item.Name, query.RefName) {
				query.Source = "inline"
				query.Data = item.Data
				return query, nil
			}
		}
		return query, errorsource.DownstreamError(errors.New("error getting reference data. Either empty or not defined"), false)
	}
	return query, nil
}
