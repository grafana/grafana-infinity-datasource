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

		got := signedAuthorizationHeader(t, getSigV4Signer("s3"), "s3", url)
		expected := signedAuthorizationHeader(t, v4.NewSigner(func(signer *v4.SignerOptions) {
			signer.DisableURIPathEscaping = true
		}), "s3", url)
		defaultS3 := signedAuthorizationHeader(t, v4.NewSigner(), "s3", url)

		assert.Equal(t, expected, got)
		assert.NotEqual(t, expected, defaultS3)
	})

	t.Run("uses default signing for non-s3 services", func(t *testing.T) {
		url := "https://monitoring.us-east-1.amazonaws.com/"

		got := signedAuthorizationHeader(t, getSigV4Signer("monitoring"), "monitoring", url)
		expected := signedAuthorizationHeader(t, v4.NewSigner(), "monitoring", url)

		assert.Equal(t, expected, got)
	})
}

func signedAuthorizationHeader(t *testing.T, signer v4.HTTPSigner, service, rawURL string) string {
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
		"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
		service,
		"eu-west-1",
		time.Unix(1717910400, 0).UTC(),
	)
	require.NoError(t, err)

	return req.Header.Get("Authorization")
}
