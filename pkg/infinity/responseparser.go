package infinity

import (
	"context"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

// ResponseParser defines the contract for parsing raw response data into Grafana data frames.
// Each format (JSON, CSV, XML, Google Sheets) implements this interface, enabling new parsers
// to be added without modifying dispatch logic.
type ResponseParser interface {
	// Parse converts raw response data into a Grafana data frame.
	// The response parameter type varies by parser: any for JSON, string for CSV/XML.
	Parse(ctx context.Context, response any, query models.Query) (*data.Frame, error)

	// CanParse reports whether this parser can handle the given query type and parser combination.
	CanParse(query models.Query) bool
}

// ParserRegistry holds registered parsers and provides lookup by query type.
type ParserRegistry struct {
	parsers []ResponseParser
}

// NewParserRegistry creates a registry pre-populated with the standard parsers.
func NewParserRegistry() *ParserRegistry {
	return &ParserRegistry{
		parsers: []ResponseParser{
			&JSONResponseParser{},
			&CSVResponseParser{},
			&XMLResponseParser{},
			&GoogleSheetsResponseParser{},
		},
	}
}

// FindParser returns the first parser that can handle the given query.
func (r *ParserRegistry) FindParser(query models.Query) (ResponseParser, bool) {
	for _, p := range r.parsers {
		if p.CanParse(query) {
			return p, true
		}
	}
	return nil, false
}

// JSONResponseParser handles JSON and GraphQL query types with backend/jq-backend parsers.
type JSONResponseParser struct{}

func (p *JSONResponseParser) CanParse(query models.Query) bool {
	return isBackendQuery(query) && (query.Type == models.QueryTypeJSON || query.Type == models.QueryTypeGraphQL)
}

func (p *JSONResponseParser) Parse(ctx context.Context, response any, query models.Query) (*data.Frame, error) {
	// When response is already a string (e.g., from inline sources), pass it directly
	// to the JSON framer to avoid double-serialization via json.Marshal.
	if responseString, ok := response.(string); ok {
		return getJSONFrameFromString(ctx, responseString, query)
	}
	return GetJSONBackendResponse(ctx, response, query)
}

// CSVResponseParser handles CSV and TSV query types with backend/jq-backend parsers.
type CSVResponseParser struct{}

func (p *CSVResponseParser) CanParse(query models.Query) bool {
	return isBackendQuery(query) && (query.Type == models.QueryTypeCSV || query.Type == models.QueryTypeTSV)
}

func (p *CSVResponseParser) Parse(ctx context.Context, response any, query models.Query) (*data.Frame, error) {
	responseString, ok := response.(string)
	if !ok {
		return GetDummyFrame(query), nil
	}
	return GetCSVBackendResponse(ctx, responseString, query)
}

// XMLResponseParser handles XML and HTML query types with backend/jq-backend parsers.
type XMLResponseParser struct{}

func (p *XMLResponseParser) CanParse(query models.Query) bool {
	return isBackendQuery(query) && (query.Type == models.QueryTypeXML || query.Type == models.QueryTypeHTML)
}

func (p *XMLResponseParser) Parse(ctx context.Context, response any, query models.Query) (*data.Frame, error) {
	responseString, ok := response.(string)
	if !ok {
		return GetDummyFrame(query), nil
	}
	return GetXMLBackendResponse(ctx, responseString, query)
}

// GoogleSheetsResponseParser handles Google Sheets query types.
type GoogleSheetsResponseParser struct{}

func (p *GoogleSheetsResponseParser) CanParse(query models.Query) bool {
	return query.Type == models.QueryTypeGSheets
}

func (p *GoogleSheetsResponseParser) Parse(ctx context.Context, response any, query models.Query) (*data.Frame, error) {
	return GetGoogleSheetsResponse(ctx, response, query)
}
