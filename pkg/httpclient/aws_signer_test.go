package httpclient

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetSigV4Signer(t *testing.T) {
	t.Run("uses s3 specific signing for s3 service", func(t *testing.T) {
		url := "https://example-bucket.s3.eu-west-1.amazonaws.com/folder%2Fobject.txt"

		got := signedRequest(t, getSigV4Signer("s3"), "s3", url)
		expected := signedRequest(t, s3Signer{HTTPSigner: v4.NewSigner(func(signer *v4.SignerOptions) {
			signer.DisableURIPathEscaping = true
		})}, "s3", url)
		defaultS3 := signedRequest(t, v4.NewSigner(), "s3", url)

		assert.Equal(t, expected.Header.Get("Authorization"), got.Header.Get("Authorization"))
		assert.Equal(t, emptyPayloadSHA256Hash, got.Header.Get("X-Amz-Content-Sha256"))
		assert.Contains(t, got.Header.Get("Authorization"), "SignedHeaders=host;x-amz-content-sha256;x-amz-date")
		assert.NotEqual(t, expected.Header.Get("Authorization"), defaultS3.Header.Get("Authorization"))
		assert.Empty(t, defaultS3.Header.Get("X-Amz-Content-Sha256"))
	})

	t.Run("uses default signing for non-s3 services", func(t *testing.T) {
		url := "https://monitoring.us-east-1.amazonaws.com/"

		got := signedRequest(t, getSigV4Signer("monitoring"), "monitoring", url)
		expected := signedRequest(t, v4.NewSigner(), "monitoring", url)

		assert.Equal(t, expected.Header.Get("Authorization"), got.Header.Get("Authorization"))
		assert.Empty(t, got.Header.Get("X-Amz-Content-Sha256"))
		assert.NotContains(t, got.Header.Get("Authorization"), "x-amz-content-sha256")
	})
}

const emptyPayloadSHA256Hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

func signedRequest(t *testing.T, signer v4.HTTPSigner, service, rawURL string) *http.Request {
	t.Helper()

	req, err := http.NewRequest(http.MethodGet, rawURL, nil)
	require.NoError(t, err)

	err = signer.SignHTTP(
		context.Background(),
		aws.Credentials{
			AccessKeyID:     "test-access-key",
			SecretAccessKey: "test-secret-key",
		},
		req,
		emptyPayloadSHA256Hash,
		service,
		"eu-west-1",
		time.Unix(1717910400, 0).UTC(),
	)
	require.NoError(t, err)

	return req
}
