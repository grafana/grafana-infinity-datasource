package query

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type QueryType string

const (
	QueryTypeJSON         QueryType = "json"
	QueryTypeCSV          QueryType = "csv"
	QueryTypeTSV          QueryType = "tsv"
	QueryTypeXML          QueryType = "xml"
	QueryTypeGraphQL      QueryType = "graphql"
	QueryTypeHTML         QueryType = "html"
	QueryTypeUQL          QueryType = "uql"
	QueryTypeGROQ         QueryType = "groq"
	QueryTypeGoogleSheets QueryType = "google-sheets"
)

type Query struct {
	RefID               string                 `json:"refId"`
	Type                QueryType              `json:"type"`   // 'json' | 'json-backend' | 'csv' | 'tsv' | 'xml' | 'graphql' | 'html' | 'uql' | 'groq' | 'series' | 'global' | 'google-sheets'
	Format              string                 `json:"format"` // 'table' | 'timeseries' | 'dataframe' | 'as-is' | 'node-graph-nodes' | 'node-graph-edges'
	Source              string                 `json:"source"` // 'url' | 'inline' | 'random-walk' | 'expression'
	URL                 string                 `json:"url"`
	URLOptions          URLOptions             `json:"url_options"`
	Data                string                 `json:"data"`
	Parser              string                 `json:"parser"` // 'simple' | 'backend' | 'sqlite' | 'uql' | 'groq'
	SummarizeExpression string                 `json:"summarizeExpression"`
	UQL                 string                 `json:"uql"`
	GROQ                string                 `json:"groq"`
	SQLiteQuery         string                 `json:"sqlite_query"`
	CSVOptions          InfinityCSVOptions     `json:"csv_options"`
	JSONOptions         InfinityJSONOptions    `json:"json_options"`
	RootSelector        string                 `json:"root_selector"`
	Columns             []InfinityColumn       `json:"columns"`
	Filters             []InfinityFilter       `json:"filters"`
	SeriesCount         int64                  `json:"seriesCount"`
	Expression          string                 `json:"expression"`
	Alias               string                 `json:"alias"`
	DataOverrides       []InfinityDataOverride `json:"dataOverrides"`
	GlobalQueryID       string                 `json:"global_query_id"`
	QueryMode           string                 `json:"query_mode"`
	Spreadsheet         string                 `json:"spreadsheet"`
	SheetName           string                 `json:"sheetName"`
	SheetRange          string                 `json:"range"`
}

type URLOptionKeyValuePair struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type URLOptions struct {
	Method           string                  `json:"method"` // 'GET' | 'POST'
	Params           []URLOptionKeyValuePair `json:"params"`
	Headers          []URLOptionKeyValuePair `json:"headers"`
	Body             string                  `json:"data"`
	BodyType         string                  `json:"body_type"`
	BodyContentType  string                  `json:"body_content_type"`
	BodyForm         []URLOptionKeyValuePair `json:"body_form"`
	BodyGraphQLQuery string                  `json:"body_graphql_query"`
	// BodyGraphQLVariables string           `json:"body_graphql_variables"`
}

type InfinityCSVOptions struct {
	Delimiter          string `json:"delimiter"`
	SkipEmptyLines     bool   `json:"skip_empty_lines"`
	SkipLinesWithError bool   `json:"skip_lines_with_error"`
	RelaxColumnCount   bool   `json:"relax_column_count"`
	Columns            string `json:"columns"`
	Comment            string `json:"comment"`
}

type InfinityJSONOptions struct {
	RootIsNotArray bool `json:"root_is_not_array"`
	ColumnNar      bool `json:"columnar"`
}

type InfinityColumn struct {
	Selector        string `json:"selector"`
	Text            string `json:"text"`
	Type            string `json:"type"` // "string" | "number" | "timestamp" | "timestamp_epoch" | "timestamp_epoch_s"
	TimeStampFormat string `json:"timestampFormat"`
}

type InfinityFilter struct {
	Field    string   `json:"field"`
	Operator string   `json:"operator"`
	Value    []string `json:"value"`
}

type InfinityDataOverride struct {
	Values   []string `json:"values"`
	Operator string   `json:"operator"`
	Override string   `json:"override"`
}

func ApplyDefaultsToQuery(query Query) Query {
	if query.Type == "" {
		query.Type = QueryTypeJSON
		if query.Source == "" {
			query.Source = "url"
		}
	}
	if query.Type == QueryTypeJSON && query.Source == "inline" && query.Data == "" {
		query.Data = "[]"
	}
	if query.Type == QueryTypeJSON && query.Source == "url" && query.URL == "" {
		query.URL = "https://jsonplaceholder.typicode.com/users"
	}
	if query.Source == "url" && strings.ToUpper(query.URLOptions.Method) == "POST" {
		if query.URLOptions.BodyType == "" {
			query.URLOptions.BodyType = "raw"
			if query.Type == QueryTypeGraphQL {
				query.URLOptions.BodyType = "graphql"
				query.URLOptions.BodyContentType = "application/json"
				if query.URLOptions.BodyGraphQLQuery == "" {
					query.URLOptions.BodyGraphQLQuery = query.URLOptions.Body
				}
			}
		}
		if query.URLOptions.BodyContentType == "" {
			query.URLOptions.BodyContentType = "text/plain"
		}
	}
	if query.Type == QueryTypeJSON && query.Parser == "uql" && query.UQL == "" {
		query.UQL = "parse-json"
	}
	if query.Type == QueryTypeCSV && query.Parser == "uql" && query.UQL == "" {
		query.UQL = "parse-csv"
	}
	if query.Type == QueryTypeTSV && query.Parser == "uql" && query.UQL == "" {
		query.UQL = `parse-csv --delimiter "\t"`
	}
	if query.Type == QueryTypeXML && query.Parser == "uql" && query.UQL == "" {
		query.UQL = "parse-xml"
	}
	if query.Type == QueryTypeJSON && query.Parser == "groq" && query.GROQ == "" {
		query.GROQ = "*"
	}
	if query.Columns == nil {
		query.Columns = []InfinityColumn{}
	}
	return query
}

func LoadQuery(backendQuery backend.DataQuery, pluginContext backend.PluginContext) (Query, error) {
	var query Query
	err := json.Unmarshal(backendQuery.JSON, &query)
	if err != nil {
		return query, fmt.Errorf("error while parsing the query json. %s", err.Error())
	}
	query = ApplyDefaultsToQuery(query)
	return ApplyMacros(query, backendQuery.TimeRange, pluginContext)
}
