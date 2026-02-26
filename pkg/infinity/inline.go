package infinity

import (
	"context"
	"errors"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

func GetFrameForInlineSources(ctx context.Context, query models.Query) (*data.Frame, error) {
	frame := GetDummyFrame(query)
	if query.Type == models.QueryTypeGROQ || query.Type == models.QueryTypeUQL {
		return frame, nil
	}
	if query.Parser != models.InfinityParserBackend && query.Parser != models.InfinityParserJQBackend {
		return frame, nil
	}
	registry := NewParserRegistry()
	if parser, ok := registry.FindParser(query); ok {
		frame, err := parser.Parse(ctx, query.Data, query)
		if err != nil {
			return frame, err
		}
		return PostProcessFrame(ctx, frame, query)
	}
	return frame, backend.DownstreamError(errors.New("unknown backend query type"))
}
