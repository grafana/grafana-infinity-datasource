package infinity

const (
	QueryTypeJSON    = "json"
	QueryTypeCSV     = "csv"
	QueryTypeTSV     = "tsv"
	QueryTypeXML     = "xml"
	QueryTypeGraphQL = "graphql"
	QueryTypeHTML    = "html"
	QueryTypeUQL     = "uql"
	QueryTypeGROQ    = "groq"
)

type Query struct {
	RefID         string              `json:"refId"`
	Type          string              `json:"type"`   // 'json' | 'csv' | 'tsv' | 'xml' | 'graphql' | 'html' | 'uql' | 'groq' | 'series' | 'global'
	Format        string              `json:"format"` // 'table' | 'timeseries' | 'dataframe' | 'as-is' | 'node-graph-nodes' | 'node-graph-edges'
	Source        string              `json:"source"` // 'url' | 'inline' | 'random-walk' | 'expression'
	URL           string              `json:"url"`
	URLOptions    URLOptions          `json:"url_options"`
	Data          string              `json:"data"`
	UQL           string              `json:"uql"`
	GROQ          string              `json:"groq"`
	CSVOptions    InfinityCSVOptions  `json:"csv_options"`
	JSONOptions   InfinityJSONOptions `json:"json_options"`
	RootSelector  string              `json:"root_selector"`
	Columns       []InfinityColumn    `json:"columns"`
	Filters       []InfinityFilter    `json:"filters"`
	SeriesCount   int64               `json:"seriesCount"`
	Expression    string              `json:"expression"`
	Alias         string              `json:"alias"`
	GlobalQueryID string              `json:"global_query_id"`
	QueryMode     string              `json:"query_mode"`
}

type URLOptionKeyValuePair struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}
type URLOptions struct {
	Data    string                  `json:"data"`
	Method  string                  `json:"method"` // 'GET' | 'POST'
	Params  []URLOptionKeyValuePair `json:"params"`
	Headers []URLOptionKeyValuePair `json:"headers"`
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
	Selector string `json:"selector"`
	Text     string `json:"text"`
	Type     string `json:"type"` // "string" | "number" | "timestamp" | "timestamp_epoch" | "timestamp_epoch_s"
}
type InfinityFilter struct {
	Field    string   `json:"field"`
	Operator string   `json:"operator"`
	Value    []string `json:"value"`
}
