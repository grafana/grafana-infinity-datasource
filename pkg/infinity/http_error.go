package infinity

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime"
	"net/http"
	"strings"
)

// HTTPResponseError represents an error response from an HTTP request.
type HTTPResponseError struct {
	StatusCode int    // HTTP status code
	Message    string // Extracted error message from the HTTP response if any
	TraceID    string // Extracted trace ID from the HTTP response if any
}

// Error implements the error interface for HTTPResponseError.
func (h *HTTPResponseError) Error() string {
	err := ErrUnsuccessfulHTTPResponseStatus
	if h.StatusCode >= http.StatusBadRequest {
		err = errors.Join(err, fmt.Errorf("HTTP status code: %d %s", h.StatusCode, http.StatusText(h.StatusCode)))
	}
	if h.Message != "" {
		err = errors.Join(err, fmt.Errorf("Error message from HTTP response: %s", h.Message))
	}
	if h.TraceID != "" {
		err = errors.Join(err, fmt.Errorf("TraceID from HTTP response: %s", h.TraceID))
	}
	return err.Error()
}

// ParseErrorResponse parses the HTTP response and extracts relevant error information.
// It reads the response body and attempts to determine the error message and trace ID
// based on the content type of the response. It handles various content types such as
// JSON, plain text, and others. If the response body contains a recognizable error message
// or trace ID, it populates the HTTPResponseError struct with this information.
func ParseErrorResponse(res *http.Response) error {
	err := &HTTPResponseError{}
	if res == nil {
		return err
	}
	err.StatusCode = res.StatusCode
	bodyBytes, responseReadErr := io.ReadAll(res.Body)
	if responseReadErr != nil {
		return err
	}
	mediaType, _, _ := mime.ParseMediaType(res.Header.Get("Content-Type"))
	mediaType = strings.ToLower(mediaType)
	for _, key := range []string{"text/html", "text/xml", "application/html", "application/xml", "application/xhtml+xml", "application/rss+xml", "image/svg+xml", "application/octet-stream"} {
		if strings.Contains(mediaType, key) {
			return err
		}
	}
	if strings.Contains(mediaType, "text/plain") {
		if errMsg := strings.TrimSpace(string(bodyBytes)); errMsg != "" {
			err.Message = errMsg
		}
		return err
	}
	var out map[string]any
	unmarshalErr := json.Unmarshal(bodyBytes, &out)
	if unmarshalErr != nil {
		return err
	}
	for _, key := range []string{"trace_id", "traceId", "traceID"} {
		if traceId, ok := out[key].(string); ok && traceId != "" {
			err.TraceID = traceId
		}
	}
	for _, key := range []string{"error", "message", "status"} {
		if errMsg, ok := out[key].(string); ok && errMsg != "" {
			err.Message = errMsg
		}
	}
	return err
}
