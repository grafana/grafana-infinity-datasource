package models

import (
	"crypto/x509"
	"encoding/pem"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const testRSAPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAuKf0TA7Y2OBrWl/louAYYtE3qsUXXz3J/E4r61TZNw/S7Vaz
us+/utxsgzMhTXMpnO3FDeILXMlMFM72JJjMwtSEQ5ZgIcOpxRoYWV8q6LllGTaF
tXqokXuvq0NlGId/1+MkNX8gX4+1vkHYxQ0reraSC59kdR8CZPbnbeqRtNCxlBEg
KD7tIAGwY0RdpoE/j7a3RX/mSWxv5RiSM0YTFKx+0i/pFUBdpe2bGObrCtLlpdl6
D7lXwLM/3rPuwuPcBN7OtxAlOb8BStThG6nAXI210c+odBSXCDzL7c7PZS6JGXtl
Lb4pjeHIN4PXUWIXuFJlAcbaYP1Bza4r3AiTRwIDAQABAoIBACgpEydVlVD54i9K
Kwn0/ijDwv0nl3E14Y+3urKYhhOFJAVNdZJ8K4Fq/ki8npIXKWZBijl+P6Vi/GKM
LpmACAyZptiCRI8jXHGLPt91JMJvy+6jXoo9TpsxkN/JLRwcIDBmbNIbv4E5Irhp
3sjgl+O9AF95v6H/aAhocKYFvcHawMSTsGU++okI7FyDqQgaam7f+MmazpWM6DOX
cvdzIHvl3FmvApfuBZsGWPpcWcVqXrFWQiOZAvp9cgJLfesklGRSDq3I4ttG0ZYS
pslFShelazzX2ngbUA5GXpJfsGKVXWNV3kOYietJLwZ8uLJMkPDBBwjZB0vdL8Dz
AqEkxuUCgYEA7i/SfJwwR+ZVbojuABvIobguo21t5RawvsM1E714PgTR8uoFSFtr
y41Lc+3uVZqgNv621S2jQknqHrBBLdk8aPonI6UKIrxf3i1PR8akaM01ed1PwMnR
ATE2S1eqruOZb8x1/e6EO29qT6Vs+TP78OhiqvTqUfIcoiPnRELoCu0CgYEAxndE
ACTExNFL0fgUXmPo0mg2zacr0ctDTFQ/R7NO3uUVY78VmZ+kUbT9SNcNvSTnr6xD
kOwyAIfwdo+0UIW/tFSABtDDSK94JAGdr7+LEcQ/QyAmp1KDTmaFrKOkijd/9bev
FVa43+ykdNmKbmHXfvvL6tVMrPwTADLNR3yLbIMCgYEAsCp+q9t5ejRKC68LGNlz
0ui+1fEhzsaxguYuY6NHQ9ec0OV1csbrO2oN3HimRnpO9V3/LDzM+0Jf/sKt8pMx
sxMRz7NJg9d/sHwinxu0ji741mFxk02xYAhd9+unOiLsYVwACQhYlP0azD22E7r3
JH88OuVaSbGgq+uSKVKy/SECgYEAmHdJQz779yO+tqh5pWXll7a921GA5WPc6IeU
MZX7klq1CvLiOimdR7PeHRYxFMyEPL3/DheV9jh4r+yIHpARjQyZaiL40x8SEb84
D6r7wINeAkhxyXsnKpSyPsVcg15NrEwXcjI0Rrp6QNZadaAut/viVR7WD9J7Glzs
vO1eAtcCgYEAkStplP9m3IM65eg+OdMqVD4CPohTfmfL/wzailB9QzTy9SNaEvfV
JIoTknAYsX8acOy3XzTdA+mN139mLnG+Tpu1bbjcJLihtPieo5NVWBi/jZedo0Ex
l7aV0Ij7+2S+ynhQUspKZ+fu3Ng+UuMauX9RpkMsfxRyKuj4WrOMVfI=
-----END RSA PRIVATE KEY-----`

func Test_normalizePEMContent(t *testing.T) {
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
			got := normalizePEMContent(tt.input)
			assert.Equal(t, tt.want, got)
		})
	}
}

func Test_normalizePEMContent_pemParseable(t *testing.T) {
	tests := []struct {
		name  string
		input string
	}{
		{
			name:  "key with unix line endings should be PEM-parseable",
			input: testRSAPrivateKey,
		},
		{
			name:  "key with escaped unix line endings should be PEM-parseable",
			input: strings.ReplaceAll(testRSAPrivateKey, "\n", `\n`),
		},
		{
			name:  "key with actual CRLF line endings should be PEM-parseable",
			input: strings.ReplaceAll(testRSAPrivateKey, "\n", "\r\n"),
		},
		{
			name:  "key with escaped CRLF line endings should be PEM-parseable",
			input: strings.ReplaceAll(testRSAPrivateKey, "\n", `\r\n`),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			normalized := normalizePEMContent(tt.input)
			block, _ := pem.Decode([]byte(normalized))
			require.NotNil(t, block, "pem.Decode should succeed after normalization")
			_, err := x509.ParsePKCS1PrivateKey(block.Bytes)
			assert.NoError(t, err, "key should be parseable after normalization")
		})
	}
}
