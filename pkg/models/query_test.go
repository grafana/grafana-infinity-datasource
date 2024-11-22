package models_test

import (
	"context"
	"net/http"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLoadQuery(t *testing.T) {
	tests := []struct {
		name      string
		queryJSON string
		settings  models.InfinitySettings
		want      models.Query
		wantErr   error
	}{
		{
			name: "should parse all the props correctly",
			queryJSON: `{
				"type"			: "json",
				"source"		: "url",
				"referenceName" : "foo.csv",
				"global_query_id" 	: "hello",
				"parser"		: "backend",
				"summarizeExpression": "sum(id)/10",
				"summarizeBy" : "none",
				"summarizeAlias": "something",
				"filterExpression": "id > 3 && id < 8",
				"url"			: "https://foo.com" ,
				"url_options"	: {
					"method"  			: 	"POST",
					"headers" 			:	[{"key":"h1","value":"hv1"}],
					"params"			:	[{"key":"p1","value":"pv1"}],
					"body_form" 		: 	[{"key":"f1","value":"fv1"}],
					"data"				:	"foo",
					"body_type" 		: 	"form-data",
					"body_content_type" : 	"application/xml",
					"body_graphql_query": 	"bar"
				},
				"azContainerName"	: "my-azContainerName",
				"azBlobName"		: "my-azBlobName",
				"data" 			: "my-inline-data",
				"root_selector" : "my-root_selector",
				"columns" 				: [{"selector":"s","text":"t","type":"string","timestampFormat":"2006"}],
				"computed_columns" 		: [{"selector":"s1","text":"t1"}],
				"filters" 		: [{"field":"ff1","operator":"fo1","value":["fa1","fb1"]}],
				"format" 		: "dataframe",
				"json_options" 	: {
					"root_is_not_array" : true,
					"columnar"			: true
				},
				"csv_options"	: {
					"delimiter" 			:	";",
					"skip_empty_lines" 		:	true,
					"skip_lines_with_error"	: 	true,
					"relax_column_count" 	: 	true,
					"columns"				: 	"a,b",
					"comment" 				: 	"#"
				},
				"uql" 		: "my-uql-query",
				"groq"		: "my-groq-query",
				"expression" 	: "my-expression",
				"seriesCount" 	: 20,
				"alias" 		: "my-alias",
				"dataOverrides" : [{"override":"ov1","operator":"op1","values":["ov1"]}]
			}`,
			want: models.Query{
				Type:          models.QueryTypeJSON,
				Source:        "url",
				GlobalQueryID: "hello",
				URL:           "https://foo.com",
				URLOptions: models.URLOptions{
					Method:           http.MethodPost,
					BodyType:         "form-data",
					BodyContentType:  "application/xml",
					Body:             "foo",
					Params:           []models.URLOptionKeyValuePair{{Key: "p1", Value: "pv1"}},
					Headers:          []models.URLOptionKeyValuePair{{Key: "h1", Value: "hv1"}},
					BodyForm:         []models.URLOptionKeyValuePair{{Key: "f1", Value: "fv1"}},
					BodyGraphQLQuery: "bar",
				},
				Data:                "my-inline-data",
				AzBlobContainerName: "my-azContainerName",
				AzBlobName:          "my-azBlobName",
				RefName:             "foo.csv",
				Parser:              "backend",
				SummarizeExpression: "sum(id)/10",
				SummarizeBy:         "none",
				SummarizeAlias:      "something",
				FilterExpression:    "id > 3 && id < 8",
				RootSelector:        "my-root_selector",
				Columns:             []models.InfinityColumn{{Selector: "s", Text: "t", Type: "string", TimeStampFormat: "2006"}},
				ComputedColumns:     []models.InfinityColumn{{Selector: "s1", Text: "t1"}},
				Filters:             []models.InfinityFilter{{Field: "ff1", Operator: "fo1", Value: []string{"fa1", "fb1"}}},
				Format:              "dataframe",
				JSONOptions: models.InfinityJSONOptions{
					RootIsNotArray: true,
					ColumnNar:      true,
				},
				CSVOptions: models.InfinityCSVOptions{
					Delimiter:          ";",
					SkipEmptyLines:     true,
					SkipLinesWithError: true,
					RelaxColumnCount:   true,
					Columns:            "a,b",
					Comment:            "#",
				},
				UQL:           "my-uql-query",
				GROQ:          "my-groq-query",
				Expression:    "my-expression",
				SeriesCount:   20,
				Alias:         "my-alias",
				DataOverrides: []models.InfinityDataOverride{{Override: "ov1", Operator: "op1", Values: []string{"ov1"}}},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			q := &backend.DataQuery{JSON: []byte(tt.queryJSON)}
			got, err := models.LoadQuery(context.Background(), *q, backend.PluginContext{}, tt.settings)
			if tt.wantErr != nil {
				require.NotNil(t, err)
				assert.Equal(t, tt.wantErr, err)
				return
			}
			require.Nil(t, err)
			require.NotNil(t, got)
			assert.Equal(t, tt.want, got)
		})
	}
}
