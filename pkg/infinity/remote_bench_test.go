package infinity

import (
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
)

func BenchmarkApplyPaginationItemToQuery(b *testing.B) {
	query := models.Query{
		URL: "https://example.com/api?page=${__pagination.page}&size=${__pagination.size}",
		URLOptions: models.URLOptions{
			Body:                "Request body with ${__pagination.page} and ${__pagination.size}",
			BodyGraphQLQuery:    "query { items(page: ${__pagination.page}, size: ${__pagination.size}) }",
			BodyGraphQLVariables: `{"page": "${__pagination.page}", "size": "${__pagination.size}"}`,
			Headers: []models.URLOptionKeyValuePair{
				{Key: "X-Page-${__pagination.page}", Value: "value-${__pagination.page}"},
				{Key: "X-Size", Value: "${__pagination.size}"},
			},
			Params: []models.URLOptionKeyValuePair{
				{Key: "offset-${__pagination.page}", Value: "value-${__pagination.page}"},
				{Key: "limit", Value: "${__pagination.size}"},
			},
			BodyForm: []models.URLOptionKeyValuePair{
				{Key: "form-page-${__pagination.page}", Value: "value-${__pagination.page}"},
				{Key: "form-size", Value: "${__pagination.size}"},
			},
		},
	}

	b.Run("Replace", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			_ = ApplyPaginationItemToQuery(query, models.PaginationParamTypeReplace, "page", "1")
		}
	})

	b.Run("Query", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			_ = ApplyPaginationItemToQuery(query, models.PaginationParamTypeQuery, "page", "1")
		}
	})

	b.Run("Header", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			_ = ApplyPaginationItemToQuery(query, models.PaginationParamTypeHeader, "page", "1")
		}
	})
}

func BenchmarkApplyPaginationItemToQueryMultipleCalls(b *testing.B) {
	query := models.Query{
		URL: "https://example.com/api?page=${__pagination.page}&size=${__pagination.size}&offset=${__pagination.offset}",
		URLOptions: models.URLOptions{
			Body:                "Request body with ${__pagination.page} and ${__pagination.size} and ${__pagination.offset}",
			BodyGraphQLQuery:    "query { items(page: ${__pagination.page}, size: ${__pagination.size}, offset: ${__pagination.offset}) }",
			BodyGraphQLVariables: `{"page": "${__pagination.page}", "size": "${__pagination.size}", "offset": "${__pagination.offset}"}`,
			Headers: []models.URLOptionKeyValuePair{
				{Key: "X-Page-${__pagination.page}", Value: "value-${__pagination.page}"},
				{Key: "X-Size-${__pagination.size}", Value: "value-${__pagination.size}"},
				{Key: "X-Offset", Value: "${__pagination.offset}"},
			},
			Params: []models.URLOptionKeyValuePair{
				{Key: "offset-${__pagination.offset}", Value: "value-${__pagination.offset}"},
				{Key: "page-${__pagination.page}", Value: "value-${__pagination.page}"},
				{Key: "limit", Value: "${__pagination.size}"},
			},
			BodyForm: []models.URLOptionKeyValuePair{
				{Key: "form-page-${__pagination.page}", Value: "value-${__pagination.page}"},
				{Key: "form-size-${__pagination.size}", Value: "value-${__pagination.size}"},
				{Key: "form-offset", Value: "${__pagination.offset}"},
			},
		},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		q := query
		q = ApplyPaginationItemToQuery(q, models.PaginationParamTypeReplace, "page", "1")
		q = ApplyPaginationItemToQuery(q, models.PaginationParamTypeReplace, "size", "100")
		q = ApplyPaginationItemToQuery(q, models.PaginationParamTypeReplace, "offset", "0")
		_ = q
	}
}
