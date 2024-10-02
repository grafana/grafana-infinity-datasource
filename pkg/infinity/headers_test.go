package infinity

import (
	"strings"
	"testing"
)

func TestGetQueryReqHeader(t *testing.T) {
	tests := []struct {
		name           string
		requestHeaders map[string]string
		headerName     string
		expected       string
	}{
		{
			name: "Authorization header exact match",
			requestHeaders: map[string]string{
				headerKeyAuthorization: "Bearer token",
			},
			headerName: headerKeyAuthorization,
			expected:   "Bearer token",
		},
		{
			name: "Authorization header case insensitive match",
			requestHeaders: map[string]string{
				strings.ToLower(headerKeyAuthorization): "Bearer token",
			},
			headerName: headerKeyAuthorization,
			expected:   "Bearer token",
		},
		{
			name: "X-Id-Token header exact match",
			requestHeaders: map[string]string{
				headerKeyIdToken: "some-id-token",
			},
			headerName: headerKeyIdToken,
			expected:   "some-id-token",
		},
		{
			name: "X-Id-Token header case insensitive match",
			requestHeaders: map[string]string{
				strings.ToLower(headerKeyIdToken): "some-id-token",
			},
			headerName: headerKeyIdToken,
			expected:   "some-id-token",
		},
		{
			name: "X-Id-Token header case with ID capitalization",
			requestHeaders: map[string]string{
				"X-ID-Token": "some-id-token",
			},
			headerName: headerKeyIdToken,
			expected:   "some-id-token",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := getQueryReqHeader(tt.requestHeaders, tt.headerName)
			if got != tt.expected {
				t.Errorf("getQueryReqHeader() = %v, expected %v", got, tt.expected)
			}
		})
	}
}