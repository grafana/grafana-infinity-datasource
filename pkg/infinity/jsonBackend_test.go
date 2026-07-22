package infinity

import (
	"context"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/infinity-libs/lib/go/jsonframer"
	"github.com/stretchr/testify/require"
)

func TestGetJSONBackendResponseNoResults(t *testing.T) {
	urlResponseObject := map[string]any{"foo": "bar"}
	query := models.Query{
		Parser:       models.InfinityParserBackend,
		RootSelector: "items",
		RefID:        "A",
	}
	_, err := GetJSONBackendResponse(context.Background(), urlResponseObject, query)
	require.NotNil(t, err)
	require.ErrorIs(t, err, jsonframer.ErrEvaluatingJSONata)
	require.True(t, backend.IsDownstreamError(err))
}
