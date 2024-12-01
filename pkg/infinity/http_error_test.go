package infinity_test

import (
	"io"
	"net/http"
	"strings"
	"testing"

	i "github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseErrorResponse(t *testing.T) {
	tests := []struct {
		name    string
		res     *http.Response
		wantErr string
	}{
		{
			name:    "No response",
			wantErr: "unsuccessful HTTP response",
		},
		{
			name: "Internal server error with plain text response and no mime header",
			res: &http.Response{
				StatusCode: http.StatusInternalServerError,
				Body:       io.NopCloser(strings.NewReader("foo")),
			},
			wantErr: "unsuccessful HTTP response\nHTTP status code: 500 Internal Server Error",
		},
		{
			name: "Internal server error with text error message and mime header",
			res: &http.Response{
				StatusCode: http.StatusInternalServerError,
				Header:     map[string][]string{"Content-Type": {"text/plain"}},
				Body:       io.NopCloser(strings.NewReader("A text error message")),
			},
			wantErr: "unsuccessful HTTP response\nHTTP status code: 500 Internal Server Error\nError message from HTTP response: A text error message",
		},
		{
			name: "Internal server error with HTML content",
			res: &http.Response{
				StatusCode: http.StatusInternalServerError,
				Header:     map[string][]string{"Content-Type": {"text/html"}},
				Body:       io.NopCloser(strings.NewReader("<>html</>")),
			},
			wantErr: "unsuccessful HTTP response\nHTTP status code: 500 Internal Server Error",
		},
		{
			name: "Internal server error with empty JSON object",
			res: &http.Response{
				StatusCode: http.StatusInternalServerError,
				Body:       io.NopCloser(strings.NewReader("{}")),
			},
			wantErr: "unsuccessful HTTP response\nHTTP status code: 500 Internal Server Error",
		},
		{
			name: "Internal server error with empty JSON array",
			res: &http.Response{
				StatusCode: http.StatusInternalServerError,
				Body:       io.NopCloser(strings.NewReader("[]")),
			},
			wantErr: "unsuccessful HTTP response\nHTTP status code: 500 Internal Server Error",
		},
		{
			name: "Internal server error with JSON message",
			res: &http.Response{
				StatusCode: http.StatusInternalServerError,
				Body:       io.NopCloser(strings.NewReader(`{ "message" : "foo" }`)),
			},
			wantErr: "unsuccessful HTTP response\nHTTP status code: 500 Internal Server Error\nError message from HTTP response: foo",
		},
		{
			name: "Internal server error with JSON traceId",
			res: &http.Response{
				StatusCode: http.StatusInternalServerError,
				Body:       io.NopCloser(strings.NewReader(`{ "traceId" : "bar" }`)),
			},
			wantErr: "unsuccessful HTTP response\nHTTP status code: 500 Internal Server Error\nTraceID from HTTP response: bar",
		},
		{
			name: "Internal server error with JSON message and traceId",
			res: &http.Response{
				StatusCode: http.StatusInternalServerError,
				Body:       io.NopCloser(strings.NewReader(`{ "error" : "foo", "traceId" : "bar" }`)),
			},
			wantErr: "unsuccessful HTTP response\nHTTP status code: 500 Internal Server Error\nError message from HTTP response: foo\nTraceID from HTTP response: bar",
		},
		{
			name: "Invalid JSON content response",
			res: &http.Response{
				StatusCode: http.StatusInternalServerError,
				Body:       io.NopCloser(strings.NewReader(`{ "error" : "foo", "traceId" : "bar" `)),
			},
			wantErr: "unsuccessful HTTP response\nHTTP status code: 500 Internal Server Error",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotErr := i.ParseErrorResponse(tt.res)
			require.NotNil(t, gotErr)
			require.NotNil(t, tt.wantErr)
			assert.Equal(t, tt.wantErr, gotErr.Error())
		})
	}
}
