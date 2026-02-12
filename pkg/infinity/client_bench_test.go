package infinity

import (
	"strconv"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
)

func BenchmarkCanAllowURL(b *testing.B) {
	allowedUrls := []string{
		"https://api.example.com",
		"https://data.example.com",
		"https://api2.example.com",
		"https://service.example.com",
		"https://backend.example.com",
	}

	testURL := "https://api.example.com/v1/data"

	b.Run("SingleHost", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			_ = CanAllowURL(testURL, allowedUrls)
		}
	})

	b.Run("EmptyList", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			_ = CanAllowURL(testURL, []string{})
		}
	})
}

func BenchmarkGetAllowedHosts(b *testing.B) {
	b.Run("SmallList", func(b *testing.B) {
		allowedUrls := []string{
			"https://api.example.com",
			"https://data.example.com",
		}
		for i := 0; i < b.N; i++ {
			_, _ = GetAllowedHosts(allowedUrls)
		}
	})

	b.Run("MediumList", func(b *testing.B) {
		allowedUrls := []string{
			"https://api.example.com",
			"https://data.example.com",
			"https://api2.example.com",
			"https://service.example.com",
			"https://backend.example.com",
			"https://api3.example.com",
			"https://cache.example.com",
			"https://cdn.example.com",
			"https://static.example.com",
			"https://assets.example.com",
		}
		for i := 0; i < b.N; i++ {
			_, _ = GetAllowedHosts(allowedUrls)
		}
	})

	b.Run("LargeList", func(b *testing.B) {
		allowedUrls := make([]string, 50)
		for i := 0; i < 50; i++ {
			allowedUrls[i] = "https://api" + strconv.Itoa(i) + ".example.com"
		}
		for i := 0; i < b.N; i++ {
			_, _ = GetAllowedHosts(allowedUrls)
		}
	})
}

func BenchmarkGetQueryBody(b *testing.B) {
	b.Run("Raw", func(b *testing.B) {
		query := models.Query{
			URLOptions: models.URLOptions{
				Method:   "POST",
				BodyType: "raw",
				Body:     `{"key": "value", "data": "test"}`,
			},
		}
		for i := 0; i < b.N; i++ {
			_ = GetQueryBody(b.Context(), query)
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
			_ = GetQueryBody(b.Context(), query)
		}
	})

	b.Run("URLEncoded", func(b *testing.B) {
		query := models.Query{
			URLOptions: models.URLOptions{
				Method:   "POST",
				BodyType: "x-www-form-urlencoded",
				BodyForm: []models.URLOptionKeyValuePair{
					{Key: "field1", Value: "value1"},
					{Key: "field2", Value: "value2"},
					{Key: "field3", Value: "value3"},
				},
			},
		}
		for i := 0; i < b.N; i++ {
			_ = GetQueryBody(b.Context(), query)
		}
	})

	b.Run("GraphQL", func(b *testing.B) {
		query := models.Query{
			URLOptions: models.URLOptions{
				Method:               "POST",
				BodyType:             "graphql",
				BodyGraphQLQuery:     "query { user(id: 1) { name email } }",
				BodyGraphQLVariables: `{"userId": 1, "filter": "active"}`,
			},
		}
		for i := 0; i < b.N; i++ {
			_ = GetQueryBody(b.Context(), query)
		}
	})
}

func BenchmarkRemoveBOMContent(b *testing.B) {
	b.Run("WithBOM", func(b *testing.B) {
		input := []byte("\xef\xbb\xbf{\"key\": \"value\"}")
		for i := 0; i < b.N; i++ {
			_ = removeBOMContent(input)
		}
	})

	b.Run("WithoutBOM", func(b *testing.B) {
		input := []byte("{\"key\": \"value\"}")
		for i := 0; i < b.N; i++ {
			_ = removeBOMContent(input)
		}
	})

	b.Run("LargeWithBOM", func(b *testing.B) {
		input := make([]byte, 10240)
		copy(input, []byte("\xef\xbb\xbf"))
		for i := 3; i < len(input); i++ {
			input[i] = byte('a')
		}
		for i := 0; i < b.N; i++ {
			_ = removeBOMContent(input)
		}
	})
}
