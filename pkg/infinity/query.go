package infinity

type URLOptions struct {
	Data   string `json:"data"`
	Method string `json:"method"`
}

type InfinityColumn struct {
	Selector string `json:"selector"`
	Text     string `json:"text"`
	Type     string `json:"type"`
}

type Filter struct {
	Field    string   `json:"field"`
	Operator string   `json:"operator"`
	Value    []string `json:"value"`
}

type Query struct {
	RefID string `json:"refId"`

	Type         string           `json:"type"`
	Format       string           `json:"format"`
	Source       string           `json:"source"`
	URL          string           `json:"url"`
	URLOptions   URLOptions       `json:"url_options"`
	Data         string           `json:"data"`
	RootSelector string           `json:"root_selector"`
	Columns      []InfinityColumn `json:"columns"`
	Filters      []Filter         `json:"filters"`
	SeriesCount  int64            `json:"seriesCount"`
	Expression   string           `json:"expression"`
	Alias        string           `json:"alias"`

	GlobalQueryID string `json:"global_query_id"`
	QueryMode     string `json:"query_mode"`
}
