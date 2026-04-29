package httpclient

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_normalizePrivateKey(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  string
	}{
		{
			name:  "unix line endings should remain unchanged",
			input: "-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n",
			want:  "-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n",
		},
		{
			name:  "escaped unix line endings should be converted",
			input: `-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n`,
			want:  "-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n",
		},
		{
			name:  "windows CRLF line endings should be normalized",
			input: "-----BEGIN RSA PRIVATE KEY-----\r\nMIIE...\r\n-----END RSA PRIVATE KEY-----\r\n",
			want:  "-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n",
		},
		{
			name:  "escaped windows CRLF line endings should be normalized",
			input: `-----BEGIN RSA PRIVATE KEY-----\r\nMIIE...\r\n-----END RSA PRIVATE KEY-----\r\n`,
			want:  "-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n",
		},
		{
			name:  "standalone carriage returns should be stripped",
			input: "-----BEGIN RSA PRIVATE KEY-----\rMIIE...\r-----END RSA PRIVATE KEY-----\r",
			want:  "-----BEGIN RSA PRIVATE KEY-----MIIE...-----END RSA PRIVATE KEY-----",
		},
		{
			name:  "escaped standalone carriage returns should be stripped",
			input: `-----BEGIN RSA PRIVATE KEY-----\rMIIE...\r-----END RSA PRIVATE KEY-----\r`,
			want:  "-----BEGIN RSA PRIVATE KEY-----MIIE...-----END RSA PRIVATE KEY-----",
		},
		{
			name:  "empty string should remain unchanged",
			input: "",
			want:  "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := normalizePrivateKey(tt.input)
			assert.Equal(t, tt.want, got)
		})
	}
}
