package infinity

import (
	"errors"
	"fmt"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/infinity-libs/lib/go/framesql"
	"github.com/grafana/infinity-libs/lib/go/transformations"
	"github.com/stretchr/testify/require"
)

func TestAddErrorSourceToTransformError(t *testing.T) {
tests := []struct {
		name            string
		inputError      error
		expectedMessage string
		isDownstream    bool
	}{
		{
			name:            "Downstream error - ErrSummarizeByFieldNotFound",
			inputError:      transformations.ErrSummarizeByFieldNotFound,
			isDownstream:    true,
		},
		{
			name:            "Downstream error - ErrNotUniqueFieldNames",
			inputError:      transformations.ErrNotUniqueFieldNames,
			isDownstream:    true,
		},
		{
			name:            "Downstream error joined - ErrNotUniqueFieldNames",
			inputError:      errors.Join(transformations.ErrNotUniqueFieldNames, fmt.Errorf("some random error")),
			isDownstream:    true,
		},
		{
			name:            "Downstream error joined - ErrExpressionNotFoundInFields",
			inputError:      errors.Join(framesql.ErrExpressionNotFoundInFields, fmt.Errorf("some random error")),
			isDownstream:    true,
		},
				{
			name:            "Downstream error joined - ErrInvalidFilterExpression",
			inputError:      errors.Join(transformations.ErrInvalidFilterExpression, fmt.Errorf("some random error")),
			isDownstream:    true,
		},
		{
			name:            "Non-Downstream error",
			inputError:      errors.New("some random error"),
			isDownstream:    false,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			resultError := addErrorSourceToTransformError(test.inputError)
			require.Equal(t, test.isDownstream, backend.IsDownstreamError(resultError))
		})
	}
}