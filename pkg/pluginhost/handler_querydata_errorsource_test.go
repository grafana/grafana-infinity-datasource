package pluginhost

import (
	"errors"
	"fmt"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/infinity-libs/lib/go/jsonframer"
	"github.com/stretchr/testify/require"
)

func TestIsDownstreamError(t *testing.T) {
	tests := []struct {
		name         string
		inputError   error
		isDownstream bool
	}{
		{
			name:         "joined ErrEvaluatingJSONata with no results found",
			inputError:   errors.Join(jsonframer.ErrEvaluatingJSONata, errors.New("no results found")),
			isDownstream: true,
		},
		{
			name:         "wrapped ErrInvalidRootSelector",
			inputError:   fmt.Errorf("error converting json data to frame: %w", jsonframer.ErrInvalidRootSelector),
			isDownstream: true,
		},
		{
			name:         "joined ErrExecutingJQ",
			inputError:   errors.Join(jsonframer.ErrExecutingJQ, errors.New("boom")),
			isDownstream: true,
		},
		{
			name:         "wrapped ErrInvalidJQSelector",
			inputError:   fmt.Errorf("error converting json data to frame: %w", jsonframer.ErrInvalidJQSelector),
			isDownstream: true,
		},
		{
			name:         "backend downstream error",
			inputError:   backend.DownstreamError(errors.New("x")),
			isDownstream: true,
		},
		{
			name:         "plain plugin error",
			inputError:   errors.New("some plugin bug"),
			isDownstream: false,
		},
		{
			name:         "nil error",
			inputError:   nil,
			isDownstream: false,
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			require.Equal(t, test.isDownstream, isDownstreamError(test.inputError))
		})
	}
}
