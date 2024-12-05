package models

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type QueryType string

const (
	QueryTypeJSON            QueryType = "json"
	QueryTypeCSV             QueryType = "csv"
	QueryTypeTSV             QueryType = "tsv"
	QueryTypeXML             QueryType = "xml"
	QueryTypeGraphQL         QueryType = "graphql"
	QueryTypeHTML            QueryType = "html"
	QueryTypeUQL             QueryType = "uql"
	QueryTypeGROQ            QueryType = "groq"
	QueryTypeGSheets         QueryType = "google-sheets"
	QueryTypeTransformations QueryType = "transformations"
)

type InfinityParser string

const (
	InfinityParserSimple  InfinityParser = "simple"
	InfinityParserBackend InfinityParser = "backend"
	InfinityParserUQL     InfinityParser = "uql"
	InfinityParserGROQ    InfinityParser = "groq"
)

type PaginationMode string

const (
	PaginationModeNone   PaginationMode = "none"
	PaginationModeOffset PaginationMode = "offset"
	PaginationModePage   PaginationMode = "page"
	PaginationModeCursor PaginationMode = "cursor"
	PaginationModeList   PaginationMode = "list"
)

type PaginationParamType string

const (
	PaginationParamTypeQuery    PaginationParamType = "query"
	PaginationParamTypeHeader   PaginationParamType = "header"
	PaginationParamTypeBodyData PaginationParamType = "body_data"
	PaginationParamTypeBodyJson PaginationParamType = "body_json"
	PaginationParamTypeReplace  PaginationParamType = "replace"
)

type Transformation string

const (
	NoOpTransformation             Transformation = "noop"
	LimitTransformation            Transformation = "limit"
	FilterExpressionTransformation Transformation = "filterExpression"
	SummarizeTransformation        Transformation = "summarize"
	ComputedColumnTransformation   Transformation = "computedColumn"
)

type TransformationItem struct {
	Type     Transformation `json:"type,omitempty"`
	Disabled bool           `json:"disabled,omitempty"`
	Limit    struct {
		LimitField int `json:"limitField,omitempty"`
	} `json:"limit,omitempty"`
	FilterExpression struct {
		Expression string `json:"expression,omitempty"`
	} `json:"filterExpression,omitempty"`
	Summarize struct {
		Expression string `json:"expression,omitempty"`
		By         string `json:"by,omitempty"`
		Alias      string `json:"alias,omitempty"`
	} `json:"summarize,omitempty"`
	ComputedColumn struct {
		Expression string `json:"expression,omitempty"`
		Alias      string `json:"alias,omitempty"`
	} `json:"computedColumn,omitempty"`
}

type Query struct {
	RefID                              string                 `json:"refId"`
	Type                               QueryType              `json:"type"`   // 'json' | 'json-backend' | 'csv' | 'tsv' | 'xml' | 'graphql' | 'html' | 'uql' | 'groq' | 'series' | 'global' | 'google-sheets'
	Format                             string                 `json:"format"` // 'table' | 'timeseries' | 'logs' | 'dataframe' | 'as-is' | 'node-graph-nodes' | 'node-graph-edges'
	Source                             string                 `json:"source"` // 'url' | 'inline' | 'azure-blob' | 'reference' | 'random-walk' | 'expression'
	RefName                            string                 `json:"referenceName,omitempty"`
	URL                                string                 `json:"url"`
	URLOptions                         URLOptions             `json:"url_options"`
	Data                               string                 `json:"data"`
	Parser                             InfinityParser         `json:"parser"` // 'simple' | 'backend' | 'uql' | 'groq'
	FilterExpression                   string                 `json:"filterExpression"`
	SummarizeExpression                string                 `json:"summarizeExpression"`
	SummarizeBy                        string                 `json:"summarizeBy"`
	SummarizeAlias                     string                 `json:"summarizeAlias"`
	UQL                                string                 `json:"uql"`
	GROQ                               string                 `json:"groq"`
	CSVOptions                         InfinityCSVOptions     `json:"csv_options"`
	JSONOptions                        InfinityJSONOptions    `json:"json_options"`
	RootSelector                       string                 `json:"root_selector"`
	Columns                            []InfinityColumn       `json:"columns"`
	ComputedColumns                    []InfinityColumn       `json:"computed_columns"`
	Filters                            []InfinityFilter       `json:"filters"`
	SeriesCount                        int64                  `json:"seriesCount"`
	Expression                         string                 `json:"expression"`
	Alias                              string                 `json:"alias"`
	DataOverrides                      []InfinityDataOverride `json:"dataOverrides"`
	GlobalQueryID                      string                 `json:"global_query_id"`
	QueryMode                          string                 `json:"query_mode"`
	Spreadsheet                        string                 `json:"spreadsheet,omitempty"`
	SheetName                          string                 `json:"sheetName,omitempty"`
	SheetRange                         string                 `json:"range,omitempty"`
	AzBlobContainerName                string                 `json:"azContainerName,omitempty"`
	AzBlobName                         string                 `json:"azBlobName,omitempty"`
	PageMode                           PaginationMode         `json:"pagination_mode,omitempty"`
	PageMaxPages                       int                    `json:"pagination_max_pages,omitempty"`
	PageParamSizeFieldName             string                 `json:"pagination_param_size_field_name,omitempty"`
	PageParamSizeFieldType             PaginationParamType    `json:"pagination_param_size_field_type,omitempty"`
	PageParamSizeFieldVal              int                    `json:"pagination_param_size_value,omitempty"`
	PageParamOffsetFieldName           string                 `json:"pagination_param_offset_field_name,omitempty"`
	PageParamOffsetFieldType           PaginationParamType    `json:"pagination_param_offset_field_type,omitempty"`
	PageParamOffsetFieldVal            int                    `json:"pagination_param_offset_value,omitempty"`
	PageParamPageFieldName             string                 `json:"pagination_param_page_field_name,omitempty"`
	PageParamPageFieldType             PaginationParamType    `json:"pagination_param_page_field_type,omitempty"`
	PageParamPageFieldVal              int                    `json:"pagination_param_page_value,omitempty"`
	PageParamCursorFieldName           string                 `json:"pagination_param_cursor_field_name,omitempty"`
	PageParamCursorFieldType           PaginationParamType    `json:"pagination_param_cursor_field_type,omitempty"`
	PageParamCursorFieldExtractionPath string                 `json:"pagination_param_cursor_extraction_path,omitempty"`
	PageParamListFieldName             string                 `json:"pagination_param_list_field_name,omitempty"`
	PageParamListFieldType             PaginationParamType    `json:"pagination_param_list_field_type,omitempty"`
	PageParamListFieldValue            string                 `json:"pagination_param_list_value,omitempty"`
	Transformations                    []TransformationItem   `json:"transformations,omitempty"`
}

type URLOptionKeyValuePair struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type URLOptions struct {
	Method               string                  `json:"method"` // 'GET' | 'POST'
	Params               []URLOptionKeyValuePair `json:"params"`
	Headers              []URLOptionKeyValuePair `json:"headers"`
	Body                 string                  `json:"data"`
	BodyType             string                  `json:"body_type"`
	BodyContentType      string                  `json:"body_content_type"`
	BodyForm             []URLOptionKeyValuePair `json:"body_form"`
	BodyGraphQLQuery     string                  `json:"body_graphql_query"`
	BodyGraphQLVariables string                  `json:"body_graphql_variables"`
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
	Type            string `json:"type"` // "string" | "number" | "timestamp" | "timestamp_epoch" | "timestamp_epoch_s" | "boolean"
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

func ApplyDefaultsToQuery(ctx context.Context, query Query, settings InfinitySettings) Query {
	if query.Type == "" {
		query.Type = QueryTypeJSON
		if query.Source == "" {
			query.Source = "url"
		}
	}
	if query.Type == QueryTypeJSON && query.Source == "inline" && query.Data == "" {
		query.Data = "[]"
	}
	if query.Source == "url" && query.URL == "" && strings.TrimSpace(settings.URL) == "" {
		switch query.Type {
		case QueryTypeJSON, QueryTypeCSV, QueryTypeTSV, QueryTypeXML, QueryTypeHTML:
			query.URL = fmt.Sprintf("https://raw.githubusercontent.com/grafana/grafana-infinity-datasource/main/testdata/users.%s", strings.ToLower(string(query.Type)))
		case QueryTypeGraphQL, QueryTypeUQL, QueryTypeGROQ:
			query.URL = "https://raw.githubusercontent.com/grafana/grafana-infinity-datasource/main/testdata/users.json"
		}
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
	if query.Type == QueryTypeJSON && query.Parser == InfinityParserUQL && query.UQL == "" {
		query.UQL = "parse-json"
	}
	if query.Type == QueryTypeCSV && query.Parser == InfinityParserUQL && query.UQL == "" {
		query.UQL = "parse-csv"
	}
	if query.Type == QueryTypeTSV && query.Parser == InfinityParserUQL && query.UQL == "" {
		query.UQL = `parse-csv --delimiter "\t"`
	}
	if query.Type == QueryTypeXML && query.Parser == InfinityParserUQL && query.UQL == "" {
		query.UQL = "parse-xml"
	}
	if query.Type == QueryTypeJSON && query.Parser == InfinityParserGROQ && query.GROQ == "" {
		query.GROQ = "*"
	}
	if query.Columns == nil {
		query.Columns = []InfinityColumn{}
	}
	if query.ComputedColumns == nil {
		query.ComputedColumns = []InfinityColumn{}
	}
	if query.Parser == InfinityParserBackend && query.Source == "url" && !(query.PageMode == "" || query.PageMode == PaginationModeNone) {
		if query.PageMode != PaginationModeNone {
			if query.PageMaxPages <= 0 {
				query.PageMaxPages = 1
			}
			if query.PageMaxPages >= 5 {
				query.PageMaxPages = 5
			}
			if query.PageParamSizeFieldName == "" {
				query.PageParamSizeFieldName = "limit"
			}
			if query.PageParamSizeFieldType == "" {
				query.PageParamSizeFieldType = PaginationParamTypeQuery
			}
			if query.PageParamSizeFieldVal == 0 {
				query.PageParamSizeFieldVal = 1000
			}
		}
		if query.PageMode == PaginationModeOffset {
			if query.PageParamOffsetFieldName == "" {
				query.PageParamOffsetFieldName = "offset"
			}
			if query.PageParamOffsetFieldType == "" {
				query.PageParamOffsetFieldType = PaginationParamTypeQuery
			}
			if query.PageParamOffsetFieldVal == 0 {
				query.PageParamOffsetFieldVal = 0
			}
		}
		if query.PageMode == PaginationModePage {
			if query.PageParamPageFieldName == "" {
				query.PageParamPageFieldName = "page"
			}
			if query.PageParamPageFieldType == "" {
				query.PageParamPageFieldType = PaginationParamTypeQuery
			}
			if query.PageParamPageFieldVal == 0 {
				query.PageParamPageFieldVal = 1
			}
		}
		if query.PageMode == PaginationModeCursor {
			if query.PageParamCursorFieldName == "" {
				query.PageParamCursorFieldName = "cursor"
			}
			if query.PageParamCursorFieldType == "" {
				query.PageParamCursorFieldType = PaginationParamTypeQuery
			}
		}
	}
	for i, t := range query.Transformations {
		if t.Type == "" {
			query.Transformations[i].Type = NoOpTransformation
		}
	}
	return query
}

func LoadQuery(ctx context.Context, backendQuery backend.DataQuery, pluginContext backend.PluginContext, settings InfinitySettings) (Query, error) {
	var query Query
	err := json.Unmarshal(backendQuery.JSON, &query)
	if err != nil {
		return query, backend.DownstreamError(fmt.Errorf("error while parsing the query json. %w", err))
	}
	query = ApplyDefaultsToQuery(ctx, query, settings)
	if query.PageMode == PaginationModeList && strings.TrimSpace(query.PageParamListFieldName) == "" {
		// Downstream error as user input is not correct
		return query, backend.DownstreamError(errors.New("pagination_param_list_field_name cannot be empty"))
	}
	return ApplyMacros(ctx, query, backendQuery.TimeRange, pluginContext)
}
