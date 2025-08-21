package infinity

import (
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/require"
)

func TestApplyPaginationItemToQuery(t *testing.T) {
	t.Run(string(models.PaginationParamTypeQuery), func(t *testing.T) {
		tests := []struct {
			name       string
			query      models.Query
			fieldName  string
			fieldValue string
			want       models.Query
		}{
			{
				name:       "should add pagination params to query url params",
				query:      models.Query{URLOptions: models.URLOptions{Params: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}}}},
				fieldName:  "hello",
				fieldValue: "world",
				want:       models.Query{URLOptions: models.URLOptions{Params: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}, {Key: "hello", Value: "world"}}}},
			},
			{
				name:       "should not override existing pagination params to query url params",
				query:      models.Query{URLOptions: models.URLOptions{Params: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}}}},
				fieldName:  "foo",
				fieldValue: "baz",
				want:       models.Query{URLOptions: models.URLOptions{Params: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}, {Key: "foo", Value: "baz"}}}},
			},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				got := ApplyPaginationItemToQuery(tt.query, "", tt.fieldName, tt.fieldValue)
				require.Equal(t, tt.want, got)
			})
		}
	})
	t.Run(string(models.PaginationParamTypeHeader), func(t *testing.T) {
		tests := []struct {
			name       string
			query      models.Query
			fieldName  string
			fieldValue string
			want       models.Query
		}{
			{
				name:       "should add pagination params to header",
				query:      models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}}}},
				fieldName:  "hello",
				fieldValue: "world",
				want:       models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}, {Key: "hello", Value: "world"}}}},
			},
			{
				name:       "should not override existing pagination params to header",
				query:      models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}}}},
				fieldName:  "foo",
				fieldValue: "baz",
				want:       models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}, {Key: "foo", Value: "baz"}}}},
			},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeHeader, tt.fieldName, tt.fieldValue)
				require.Equal(t, tt.want, got)
			})
		}
	})
	t.Run(string(models.PaginationParamTypeBodyData), func(t *testing.T) {
		tests := []struct {
			name       string
			query      models.Query
			fieldName  string
			fieldValue string
			want       models.Query
		}{
			{
				name:       "should add pagination params to body params",
				query:      models.Query{URLOptions: models.URLOptions{BodyForm: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}}}},
				fieldName:  "hello",
				fieldValue: "world",
				want:       models.Query{URLOptions: models.URLOptions{BodyForm: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}, {Key: "hello", Value: "world"}}}},
			},
			{
				name:       "should not override existing pagination params to body params",
				query:      models.Query{URLOptions: models.URLOptions{BodyForm: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}}}},
				fieldName:  "foo",
				fieldValue: "baz",
				want:       models.Query{URLOptions: models.URLOptions{BodyForm: []models.URLOptionKeyValuePair{{Key: "foo", Value: "bar"}, {Key: "foo", Value: "baz"}}}},
			},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeBodyData, tt.fieldName, tt.fieldValue)
				require.Equal(t, tt.want, got)
			})
		}
	})
	t.Run(string(models.PaginationParamTypeBodyJson), func(t *testing.T) {
		t.Skip() // TODO: NOT IMPLEMENTED YET
		tests := []struct {
			name       string
			query      models.Query
			fieldName  string
			fieldValue string
			want       models.Query
		}{}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeBodyJson, tt.fieldName, tt.fieldValue)
				require.Equal(t, tt.want, got)
			})
		}
	})
	t.Run(string(models.PaginationParamTypeReplace), func(t *testing.T) {
		t.Run("replace params in URL", func(t *testing.T) {
			tests := []struct {
				name       string
				query      models.Query
				fieldName  string
				fieldValue string
				want       models.Query
			}{
				{
					name:       "should replace pagination params in URL path",
					query:      models.Query{URL: "https://abc.com/hello/page/${__pagination.page}"},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URL: "https://abc.com/hello/page/3"},
				},
				{
					name:       "should replace all pagination params in URL path",
					query:      models.Query{URL: "https://abc.com/hello/page/${__pagination.page}/page_num/${__pagination.page}"},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URL: "https://abc.com/hello/page/3/page_num/3"},
				},
			}
			for _, tt := range tests {
				t.Run(tt.name, func(t *testing.T) {
					got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeReplace, tt.fieldName, tt.fieldValue)
					require.Equal(t, tt.want, got)
				})
			}
		})
		t.Run("replace params in URL POST Body", func(t *testing.T) {
			tests := []struct {
				name       string
				query      models.Query
				fieldName  string
				fieldValue string
				want       models.Query
			}{
				{
					name:       "should replace pagination params in URL POST body",
					query:      models.Query{URLOptions: models.URLOptions{Body: `{ "page" : ${__pagination.page} }`}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{Body: `{ "page" : 3 }`}},
				},
				{
					name:       "should replace all pagination params in URL POST body",
					query:      models.Query{URLOptions: models.URLOptions{Body: `{ "page" : ${__pagination.page}, "page_num" : ${__pagination.page} }`}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{Body: `{ "page" : 3, "page_num" : 3 }`}},
				},
			}
			for _, tt := range tests {
				t.Run(tt.name, func(t *testing.T) {
					got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeReplace, tt.fieldName, tt.fieldValue)
					require.Equal(t, tt.want, got)
				})
			}
		})
		t.Run("replace params in URL POST Body GraphQL Query", func(t *testing.T) {
			tests := []struct {
				name       string
				query      models.Query
				fieldName  string
				fieldValue string
				want       models.Query
			}{
				{
					name:       "should replace pagination params in URL GraphQL Query",
					query:      models.Query{URLOptions: models.URLOptions{BodyGraphQLQuery: `{ "page" : ${__pagination.page} }`}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{BodyGraphQLQuery: `{ "page" : 3 }`}},
				},
				{
					name:       "should replace all pagination params in URL GraphQL Query",
					query:      models.Query{URLOptions: models.URLOptions{BodyGraphQLQuery: `{ "page" : ${__pagination.page}, "page_num" : ${__pagination.page} }`}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{BodyGraphQLQuery: `{ "page" : 3, "page_num" : 3 }`}},
				},
			}
			for _, tt := range tests {
				t.Run(tt.name, func(t *testing.T) {
					got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeReplace, tt.fieldName, tt.fieldValue)
					require.Equal(t, tt.want, got)
				})
			}
		})
		t.Run("replace params in URL POST Body GraphQL Variables", func(t *testing.T) {
			tests := []struct {
				name       string
				query      models.Query
				fieldName  string
				fieldValue string
				want       models.Query
			}{
				{
					name:       "should replace pagination params in URL GraphQL Variables",
					query:      models.Query{URLOptions: models.URLOptions{BodyGraphQLVariables: `{ "page" : ${__pagination.page} }`}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{BodyGraphQLVariables: `{ "page" : 3 }`}},
				},
				{
					name:       "should replace all pagination params in URL  GraphQL Variables",
					query:      models.Query{URLOptions: models.URLOptions{BodyGraphQLVariables: `{ "page" : ${__pagination.page}, "page_num" : ${__pagination.page} }`}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{BodyGraphQLVariables: `{ "page" : 3, "page_num" : 3 }`}},
				},
			}
			for _, tt := range tests {
				t.Run(tt.name, func(t *testing.T) {
					got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeReplace, tt.fieldName, tt.fieldValue)
					require.Equal(t, tt.want, got)
				})
			}
		})
		t.Run("replace params in URL Headers", func(t *testing.T) {
			tests := []struct {
				name       string
				query      models.Query
				fieldName  string
				fieldValue string
				want       models.Query
			}{
				{
					name:       "should replace pagination params in URL headers",
					query:      models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "page", Value: "${__pagination.page}"}}}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "page", Value: "3"}}}},
				},
				{
					name:       "should replace all pagination params in URL headers",
					query:      models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "page", Value: "${__pagination.page}"}, {Key: "page_num", Value: "${__pagination.page}"}}}},
					fieldName:  "page",
					fieldValue: "3",
					want:       models.Query{URLOptions: models.URLOptions{Headers: []models.URLOptionKeyValuePair{{Key: "page", Value: "3"}, {Key: "page_num", Value: "3"}}}},
				},
			}
			for _, tt := range tests {
				t.Run(tt.name, func(t *testing.T) {
					got := ApplyPaginationItemToQuery(tt.query, models.PaginationParamTypeReplace, tt.fieldName, tt.fieldValue)
					require.Equal(t, tt.want, got)
				})
			}
		})
	})
}
