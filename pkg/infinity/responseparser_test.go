package infinity

import (
	"context"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/require"
)

func TestParserRegistry_FindParser(t *testing.T) {
	registry := NewParserRegistry()

	tests := []struct {
		name      string
		query     models.Query
		wantFound bool
	}{
		{
			name:      "JSON backend query",
			query:     models.Query{Type: models.QueryTypeJSON, Parser: models.InfinityParserBackend},
			wantFound: true,
		},
		{
			name:      "JSON jq-backend query",
			query:     models.Query{Type: models.QueryTypeJSON, Parser: models.InfinityParserJQBackend},
			wantFound: true,
		},
		{
			name:      "GraphQL backend query",
			query:     models.Query{Type: models.QueryTypeGraphQL, Parser: models.InfinityParserBackend},
			wantFound: true,
		},
		{
			name:      "CSV backend query",
			query:     models.Query{Type: models.QueryTypeCSV, Parser: models.InfinityParserBackend},
			wantFound: true,
		},
		{
			name:      "TSV backend query",
			query:     models.Query{Type: models.QueryTypeTSV, Parser: models.InfinityParserBackend},
			wantFound: true,
		},
		{
			name:      "XML backend query",
			query:     models.Query{Type: models.QueryTypeXML, Parser: models.InfinityParserBackend},
			wantFound: true,
		},
		{
			name:      "HTML backend query",
			query:     models.Query{Type: models.QueryTypeHTML, Parser: models.InfinityParserBackend},
			wantFound: true,
		},
		{
			name:      "Google Sheets query",
			query:     models.Query{Type: models.QueryTypeGSheets},
			wantFound: true,
		},
		{
			name:      "JSON simple parser (not backend)",
			query:     models.Query{Type: models.QueryTypeJSON, Parser: models.InfinityParserSimple},
			wantFound: false,
		},
		{
			name:      "UQL query type",
			query:     models.Query{Type: models.QueryTypeUQL, Parser: models.InfinityParserBackend},
			wantFound: false,
		},
		{
			name:      "GROQ query type",
			query:     models.Query{Type: models.QueryTypeGROQ, Parser: models.InfinityParserBackend},
			wantFound: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			parser, found := registry.FindParser(tt.query)
			require.Equal(t, tt.wantFound, found)
			if tt.wantFound {
				require.NotNil(t, parser)
			}
		})
	}
}

func TestParserRegistry_JSONParserHandlesString(t *testing.T) {
	parser := &JSONResponseParser{}
	query := models.Query{
		Type:   models.QueryTypeJSON,
		Parser: models.InfinityParserBackend,
		RefID:  "A",
	}

	// String input (inline source path)
	frame, err := parser.Parse(context.Background(), `[{"name":"alice"},{"name":"bob"}]`, query)
	require.NoError(t, err)
	require.NotNil(t, frame)
	require.Equal(t, 1, len(frame.Fields))
	require.Equal(t, 2, frame.Fields[0].Len())
}

func TestParserRegistry_CSVParserHandlesString(t *testing.T) {
	parser := &CSVResponseParser{}
	query := models.Query{
		Type:   models.QueryTypeCSV,
		Parser: models.InfinityParserBackend,
		RefID:  "A",
	}

	frame, err := parser.Parse(context.Background(), "name,age\nalice,30\nbob,25", query)
	require.NoError(t, err)
	require.NotNil(t, frame)
	require.Equal(t, 2, len(frame.Fields))
}

func TestParserRegistry_CSVParserNonStringReturnsEmpty(t *testing.T) {
	parser := &CSVResponseParser{}
	query := models.Query{
		Type:   models.QueryTypeCSV,
		Parser: models.InfinityParserBackend,
		RefID:  "A",
	}

	frame, err := parser.Parse(context.Background(), 12345, query)
	require.NoError(t, err)
	require.NotNil(t, frame)
	require.Equal(t, 0, len(frame.Fields))
}

func TestParserRegistry_XMLParserNonStringReturnsEmpty(t *testing.T) {
	parser := &XMLResponseParser{}
	query := models.Query{
		Type:   models.QueryTypeXML,
		Parser: models.InfinityParserBackend,
		RefID:  "A",
	}

	frame, err := parser.Parse(context.Background(), 12345, query)
	require.NoError(t, err)
	require.NotNil(t, frame)
	require.Equal(t, 0, len(frame.Fields))
}

func TestParserCanParse(t *testing.T) {
	tests := []struct {
		name     string
		parser   ResponseParser
		query    models.Query
		expected bool
	}{
		{
			name:     "JSONResponseParser matches JSON backend",
			parser:   &JSONResponseParser{},
			query:    models.Query{Type: models.QueryTypeJSON, Parser: models.InfinityParserBackend},
			expected: true,
		},
		{
			name:     "JSONResponseParser does not match CSV",
			parser:   &JSONResponseParser{},
			query:    models.Query{Type: models.QueryTypeCSV, Parser: models.InfinityParserBackend},
			expected: false,
		},
		{
			name:     "CSVResponseParser matches TSV backend",
			parser:   &CSVResponseParser{},
			query:    models.Query{Type: models.QueryTypeTSV, Parser: models.InfinityParserBackend},
			expected: true,
		},
		{
			name:     "XMLResponseParser matches HTML backend",
			parser:   &XMLResponseParser{},
			query:    models.Query{Type: models.QueryTypeHTML, Parser: models.InfinityParserBackend},
			expected: true,
		},
		{
			name:     "GoogleSheetsResponseParser matches GSheets",
			parser:   &GoogleSheetsResponseParser{},
			query:    models.Query{Type: models.QueryTypeGSheets},
			expected: true,
		},
		{
			name:     "GoogleSheetsResponseParser does not match JSON",
			parser:   &GoogleSheetsResponseParser{},
			query:    models.Query{Type: models.QueryTypeJSON},
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			require.Equal(t, tt.expected, tt.parser.CanParse(tt.query))
		})
	}
}
