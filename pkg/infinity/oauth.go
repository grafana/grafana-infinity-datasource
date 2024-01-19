package infinity

import (
	"context"
	"net/http"
	"net/url"
	"strings"

	"github.com/grafana/grafana-aws-sdk/pkg/sigv4"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/icholy/digest"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"
	"golang.org/x/oauth2/jwt"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
)

func ApplyOAuthClientCredentials(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) *http.Client {
	_, span := tracing.DefaultTracer().Start(ctx, "ApplyOAuthClientCredentials")
	defer span.End()
	if settings.AuthenticationMethod == models.AuthenticationMethodOAuth && settings.OAuth2Settings.OAuth2Type == models.AuthOAuthTypeClientCredentials {
		oauthConfig := clientcredentials.Config{
			ClientID:       settings.OAuth2Settings.ClientID,
			ClientSecret:   settings.OAuth2Settings.ClientSecret,
			TokenURL:       settings.OAuth2Settings.TokenURL,
			Scopes:         []string{},
			EndpointParams: url.Values{},
			AuthStyle:      settings.OAuth2Settings.AuthStyle,
		}
		for _, scope := range settings.OAuth2Settings.Scopes {
			if scope != "" {
				oauthConfig.Scopes = append(oauthConfig.Scopes, scope)
			}
		}
		for k, v := range settings.OAuth2Settings.EndpointParams {
			if k != "" && v != "" {
				oauthConfig.EndpointParams.Set(k, v)
			}
		}
		ctx := context.WithValue(context.Background(), oauth2.HTTPClient, httpClient)
		httpClient = oauthConfig.Client(ctx)
	}
	return httpClient
}
func ApplyOAuthJWT(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) *http.Client {
	_, span := tracing.DefaultTracer().Start(ctx, "ApplyOAuthJWT")
	defer span.End()
	if settings.AuthenticationMethod == models.AuthenticationMethodOAuth && settings.OAuth2Settings.OAuth2Type == models.AuthOAuthJWT {
		jwtConfig := jwt.Config{
			Email:        settings.OAuth2Settings.Email,
			TokenURL:     settings.OAuth2Settings.TokenURL,
			PrivateKey:   []byte(strings.ReplaceAll(settings.OAuth2Settings.PrivateKey, "\\n", "\n")),
			PrivateKeyID: settings.OAuth2Settings.PrivateKeyID,
			Subject:      settings.OAuth2Settings.Subject,
			Scopes:       []string{},
		}
		for _, scope := range settings.OAuth2Settings.Scopes {
			if scope != "" {
				jwtConfig.Scopes = append(jwtConfig.Scopes, scope)
			}
		}
		ctx := context.WithValue(context.Background(), oauth2.HTTPClient, httpClient)
		httpClient = jwtConfig.Client(ctx)
	}
	return httpClient
}
func ApplyDigestAuth(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) *http.Client {
	_, span := tracing.DefaultTracer().Start(ctx, "ApplyDigestAuth")
	defer span.End()
	if settings.AuthenticationMethod == models.AuthenticationMethodDigestAuth {
		a := digest.Transport{Username: settings.UserName, Password: settings.Password, Transport: httpClient.Transport}
		httpClient.Transport = &a
	}
	return httpClient
}
func ApplyAWSAuth(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) *http.Client {
	ctx, span := tracing.DefaultTracer().Start(ctx, "ApplyAWSAuth")
	defer span.End()
	if settings.AuthenticationMethod == models.AuthenticationMethodAWS {
		tempHttpClient := getBaseHTTPClient(ctx, settings)
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
		conf := &sigv4.Config{
			AuthType:  string(authType),
			Region:    region,
			Service:   service,
			AccessKey: settings.AWSAccessKey,
			SecretKey: settings.AWSSecretKey,
		}
		rt, _ := sigv4.New(conf, sigv4.RoundTripperFunc(func(req *http.Request) (*http.Response, error) {
			req.Header.Add("Accept", "application/json")
			return tempHttpClient.Do(req)
		}))
		httpClient.Transport = rt
	}
	return httpClient
}
