package models_test

import (
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/assert"
)

func TestIsSensitiveHeader(t *testing.T) {
	tests := []struct {
		name      string
		headerKey string
		want      bool
	}{
		{name: "Content-Length is sensitive", headerKey: "Content-Length", want: true},
		{name: "content-length lowercase is sensitive", headerKey: "content-length", want: true},
		{name: "CONTENT-LENGTH uppercase is sensitive", headerKey: "CONTENT-LENGTH", want: true},
		{name: "Host is sensitive", headerKey: "Host", want: true},
		{name: "Transfer-Encoding is sensitive", headerKey: "Transfer-Encoding", want: true},
		{name: "Connection is sensitive", headerKey: "Connection", want: true},
		{name: "Keep-Alive is sensitive", headerKey: "Keep-Alive", want: true},
		{name: "Upgrade is sensitive", headerKey: "Upgrade", want: true},
		{name: "Proxy-Authorization is sensitive", headerKey: "Proxy-Authorization", want: true},
		{name: "Te is sensitive", headerKey: "Te", want: true},
		{name: "Trailer is sensitive", headerKey: "Trailer", want: true},
		{name: "X-Forwarded-For is sensitive", headerKey: "X-Forwarded-For", want: true},
		{name: "Expect is sensitive", headerKey: "Expect", want: true},
		{name: "Content-Length with spaces is sensitive", headerKey: "  Content-Length  ", want: true},
		{name: "Accept is not sensitive", headerKey: "Accept", want: false},
		{name: "Content-Type is not sensitive", headerKey: "Content-Type", want: false},
		{name: "Authorization is not sensitive", headerKey: "Authorization", want: false},
		{name: "X-Custom-Header is not sensitive", headerKey: "X-Custom-Header", want: false},
		{name: "empty string is not sensitive", headerKey: "", want: false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, models.IsSensitiveHeader(tt.headerKey))
		})
	}
}
