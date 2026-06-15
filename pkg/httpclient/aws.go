package httpclient

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"

	"github.com/grafana/grafana-aws-sdk/pkg/awsauth"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
)

func isAwsAuthConfigured(settings models.InfinitySettings) bool {
	return settings.AuthenticationMethod == models.AuthenticationMethodAWS
}

func applyAWSAuth(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) (*http.Client, error) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "ApplyAWSAuth")
	defer span.End()
	if isAwsAuthConfigured(settings) {
		tempHttpClient, err := getBaseHTTPClient(ctx, settings)
		if err != nil {
			return tempHttpClient, err
		}
		authType := settings.AWSSettings.AuthType
		if authType == "" {
			authType = models.AWSAuthTypeKeys
		}
		region := settings.AWSSettings.Region
		if region == "" {
			region = "us-east-2"
		}
		service := settings.AWSSettings.Service
		if service == "" {
			service = "monitoring"
		}
		httpOptions := httpclient.Options{
			SigV4: &httpclient.SigV4Config{
				AccessKey: settings.AWSAccessKey,
				SecretKey: settings.AWSSecretKey,
				AuthType:  string(authType),
				Region:    region,
				Service:   service,
			},
		}
		acceptHeaderMiddleware := func(req *http.Request) (*http.Response, error) {
			req.Header.Add("Accept", "application/json")
			return tempHttpClient.Do(req)
		}
		httpClient.Transport = awsauth.NewSignerRoundTripper(httpOptions, httpclient.RoundTripperFunc(acceptHeaderMiddleware), getSigV4Signer(service))
	}
	return httpClient, nil
}

func getSigV4Signer(service string) v4.HTTPSigner {
	if strings.EqualFold(strings.TrimSpace(service), "s3") {
		return s3Signer{
			HTTPSigner: v4.NewSigner(func(signer *v4.SignerOptions) {
				signer.DisableURIPathEscaping = true
			}),
		}
	}

	return v4.NewSigner()
}

type s3Signer struct {
	v4.HTTPSigner
}

func (s s3Signer) SignHTTP(ctx context.Context, credentials aws.Credentials, req *http.Request, payloadHash, service, region string, signingTime time.Time, optFns ...func(*v4.SignerOptions)) error {
	req.Header.Set("X-Amz-Content-Sha256", payloadHash)
	return s.HTTPSigner.SignHTTP(ctx, credentials, req, payloadHash, service, region, signingTime, optFns...)
}
