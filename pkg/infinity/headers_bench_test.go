package infinity

import (
	"context"
	"net/http"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
)

func BenchmarkApplyContentTypeHeader(b *testing.B) {
	ctx := context.Background()
	settings := models.InfinitySettings{}

	b.Run("RawBody", func(b *testing.B) {
		query := models.Query{
			URLOptions: models.URLOptions{
				Method:          "POST",
				BodyType:        "raw",
				BodyContentType: "application/json",
			},
		}
		for i := 0; i < b.N; i++ {
			req, _ := http.NewRequestWithContext(ctx, "POST", "http://example.com", nil)
			_ = ApplyContentTypeHeader(ctx, query, settings, req, true)
		}
	})

	b.Run("FormData", func(b *testing.B) {
		query := models.Query{
			URLOptions: models.URLOptions{
				Method:   "POST",
				BodyType: "form-data",
				BodyForm: []models.URLOptionKeyValuePair{
					{Key: "field1", Value: "value1"},
					{Key: "field2", Value: "value2"},
					{Key: "field3", Value: "value3"},
					{Key: "field4", Value: "value4"},
					{Key: "field5", Value: "value5"},
				},
			},
		}
		for i := 0; i < b.N; i++ {
			req, _ := http.NewRequestWithContext(ctx, "POST", "http://example.com", nil)
			_ = ApplyContentTypeHeader(ctx, query, settings, req, true)
		}
	})

	b.Run("FormDataLarge", func(b *testing.B) {
		bodyForm := make([]models.URLOptionKeyValuePair, 20)
		for i := 0; i < 20; i++ {
			bodyForm[i] = models.URLOptionKeyValuePair{
				Key:   "field" + string(rune(i)),
				Value: "value" + string(rune(i)),
			}
		}
		query := models.Query{
			URLOptions: models.URLOptions{
				Method:   "POST",
				BodyType: "form-data",
				BodyForm: bodyForm,
			},
		}
		for i := 0; i < b.N; i++ {
			req, _ := http.NewRequestWithContext(ctx, "POST", "http://example.com", nil)
			_ = ApplyContentTypeHeader(ctx, query, settings, req, true)
		}
	})

	b.Run("URLEncoded", func(b *testing.B) {
		query := models.Query{
			URLOptions: models.URLOptions{
				Method:   "POST",
				BodyType: "x-www-form-urlencoded",
			},
		}
		for i := 0; i < b.N; i++ {
			req, _ := http.NewRequestWithContext(ctx, "POST", "http://example.com", nil)
			_ = ApplyContentTypeHeader(ctx, query, settings, req, true)
		}
	})

	b.Run("GraphQL", func(b *testing.B) {
		query := models.Query{
			URLOptions: models.URLOptions{
				Method:   "POST",
				BodyType: "graphql",
			},
		}
		for i := 0; i < b.N; i++ {
			req, _ := http.NewRequestWithContext(ctx, "POST", "http://example.com", nil)
			_ = ApplyContentTypeHeader(ctx, query, settings, req, true)
		}
	})
}

func BenchmarkApplyHeadersFromQuery(b *testing.B) {
	ctx := context.Background()
	settings := models.InfinitySettings{
		SecureQueryFields: map[string]string{
			"key1": "value1",
			"key2": "value2",
		},
	}

	b.Run("FewHeaders", func(b *testing.B) {
		query := models.Query{
			URLOptions: models.URLOptions{
				Headers: []models.URLOptionKeyValuePair{
					{Key: "X-Custom-1", Value: "value1"},
					{Key: "X-Custom-2", Value: "value2"},
				},
			},
		}
		for i := 0; i < b.N; i++ {
			req, _ := http.NewRequestWithContext(ctx, "GET", "http://example.com", nil)
			_ = ApplyHeadersFromQuery(ctx, query, settings, req, true)
		}
	})

	b.Run("ManyHeaders", func(b *testing.B) {
		headers := make([]models.URLOptionKeyValuePair, 10)
		for i := 0; i < 10; i++ {
			headers[i] = models.URLOptionKeyValuePair{
				Key:   "X-Custom-Header-" + string(rune(i)),
				Value: "value-" + string(rune(i)),
			}
		}
		query := models.Query{
			URLOptions: models.URLOptions{
				Headers: headers,
			},
		}
		for i := 0; i < b.N; i++ {
			req, _ := http.NewRequestWithContext(ctx, "GET", "http://example.com", nil)
			_ = ApplyHeadersFromQuery(ctx, query, settings, req, true)
		}
	})
}
