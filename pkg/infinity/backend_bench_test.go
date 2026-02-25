package infinity

import (
	"context"
	"fmt"
	"strconv"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
)

func BenchmarkGetJSONBackendResponse(b *testing.B) {
	ctx := context.Background()

	b.Run("SmallJSON", func(b *testing.B) {
		data := map[string]interface{}{
			"items": []map[string]interface{}{
				{"id": 1, "name": "Item 1"},
				{"id": 2, "name": "Item 2"},
				{"id": 3, "name": "Item 3"},
			},
		}
		query := models.Query{
			RefID:        "A",
			RootSelector: "items",
			Columns: []models.InfinityColumn{
				{Selector: "id", Text: "ID", Type: "number"},
				{Selector: "name", Text: "Name", Type: "string"},
			},
			Parser: models.InfinityParserBackend,
		}
		for i := 0; i < b.N; i++ {
			_, _ = GetJSONBackendResponse(ctx, data, query)
		}
	})

	b.Run("MediumJSON", func(b *testing.B) {
		items := make([]map[string]interface{}, 100)
		for i := 0; i < 100; i++ {
			items[i] = map[string]interface{}{
				"id":          i,
				"name":        "Item " + strconv.Itoa(i),
				"value":       i * 100,
				"description": "Description for item " + strconv.Itoa(i),
			}
		}
		data := map[string]interface{}{
			"items": items,
		}
		query := models.Query{
			RefID:        "A",
			RootSelector: "items",
			Columns: []models.InfinityColumn{
				{Selector: "id", Text: "ID", Type: "number"},
				{Selector: "name", Text: "Name", Type: "string"},
				{Selector: "value", Text: "Value", Type: "number"},
				{Selector: "description", Text: "Description", Type: "string"},
			},
			Parser: models.InfinityParserBackend,
		}
		for i := 0; i < b.N; i++ {
			_, _ = GetJSONBackendResponse(ctx, data, query)
		}
	})

	b.Run("LargeJSON", func(b *testing.B) {
		items := make([]map[string]interface{}, 1000)
		for i := 0; i < 1000; i++ {
			items[i] = map[string]interface{}{
				"id":          i,
				"name":        "Item " + strconv.Itoa(i),
				"value":       i * 100,
				"description": "Description for item " + strconv.Itoa(i),
				"category":    "Category " + strconv.Itoa(i%10),
				"status":      "active",
			}
		}
		data := map[string]interface{}{
			"items": items,
		}
		query := models.Query{
			RefID:        "A",
			RootSelector: "items",
			Columns: []models.InfinityColumn{
				{Selector: "id", Text: "ID", Type: "number"},
				{Selector: "name", Text: "Name", Type: "string"},
				{Selector: "value", Text: "Value", Type: "number"},
				{Selector: "description", Text: "Description", Type: "string"},
				{Selector: "category", Text: "Category", Type: "string"},
				{Selector: "status", Text: "Status", Type: "string"},
			},
			Parser: models.InfinityParserBackend,
		}
		for i := 0; i < b.N; i++ {
			_, _ = GetJSONBackendResponse(ctx, data, query)
		}
	})

	b.Run("ManyColumns", func(b *testing.B) {
		data := map[string]interface{}{
			"items": []map[string]interface{}{
				{
					"col1": 1, "col2": 2, "col3": 3, "col4": 4, "col5": 5,
					"col6": 6, "col7": 7, "col8": 8, "col9": 9, "col10": 10,
					"col11": 11, "col12": 12, "col13": 13, "col14": 14, "col15": 15,
					"col16": 16, "col17": 17, "col18": 18, "col19": 19, "col20": 20,
				},
			},
		}
		columns := make([]models.InfinityColumn, 20)
		for i := 0; i < 20; i++ {
			columns[i] = models.InfinityColumn{
				Selector: "col" + strconv.Itoa(i+1),
				Text:     "Column " + strconv.Itoa(i+1),
				Type:     "number",
			}
		}
		query := models.Query{
			RefID:        "A",
			RootSelector: "items",
			Columns:      columns,
			Parser:       models.InfinityParserBackend,
		}
		for i := 0; i < b.N; i++ {
			_, _ = GetJSONBackendResponse(ctx, data, query)
		}
	})
}

func BenchmarkGetCSVBackendResponse(b *testing.B) {
	ctx := context.Background()

	b.Run("SmallCSV", func(b *testing.B) {
		csvData := "id,name,value\n1,Item1,100\n2,Item2,200\n3,Item3,300"
		query := models.Query{
			RefID: "A",
			Columns: []models.InfinityColumn{
				{Selector: "id", Text: "ID", Type: "number"},
				{Selector: "name", Text: "Name", Type: "string"},
				{Selector: "value", Text: "Value", Type: "number"},
			},
			Type: models.QueryTypeCSV,
		}
		for i := 0; i < b.N; i++ {
			_, _ = GetCSVBackendResponse(ctx, csvData, query)
		}
	})

	b.Run("MediumCSV", func(b *testing.B) {
		csvData := "id,name,value,description\n"
		for i := 0; i < 100; i++ {
			csvData += fmt.Sprintf("%d,ItemName,%d,Description\n", i, i*100)
		}
		query := models.Query{
			RefID: "A",
			Columns: []models.InfinityColumn{
				{Selector: "id", Text: "ID", Type: "number"},
				{Selector: "name", Text: "Name", Type: "string"},
				{Selector: "value", Text: "Value", Type: "number"},
				{Selector: "description", Text: "Description", Type: "string"},
			},
			Type: models.QueryTypeCSV,
		}
		for i := 0; i < b.N; i++ {
			_, _ = GetCSVBackendResponse(ctx, csvData, query)
		}
	})

	b.Run("ManyColumns", func(b *testing.B) {
		csvData := "c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,c11,c12,c13,c14,c15,c16,c17,c18,c19,c20\n"
		csvData += "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20\n"
		columns := make([]models.InfinityColumn, 20)
		for i := 0; i < 20; i++ {
			columns[i] = models.InfinityColumn{
				Selector: "c" + strconv.Itoa(i+1),
				Text:     "Column" + strconv.Itoa(i+1),
				Type:     "number",
			}
		}
		query := models.Query{
			RefID:   "A",
			Columns: columns,
			Type:    models.QueryTypeCSV,
		}
		for i := 0; i < b.N; i++ {
			_, _ = GetCSVBackendResponse(ctx, csvData, query)
		}
	})
}
