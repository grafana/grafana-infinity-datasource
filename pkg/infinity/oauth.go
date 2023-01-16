package infinity

import (
	"context"
	"net/http"
	"net/url"
	"strings"

	"github.com/grafana/grafana-aws-sdk/pkg/sigv4"
	dac "github.com/xinsnake/go-http-digest-auth-client"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"
	"golang.org/x/oauth2/jwt"

	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
)

func ApplyOAuthClientCredentials(httpClient *http.Client, settings models.InfinitySettings) *http.Client {
	if settings.AuthenticationMethod == models.AuthenticationMethodOAuth && settings.OAuth2Settings.OAuth2Type == models.AuthOAuthTypeClientCredentials {
		oauthConfig := clientcredentials.Config{
			ClientID:       settings.OAuth2Settings.ClientID,
			ClientSecret:   settings.OAuth2Settings.ClientSecret,
			TokenURL:       settings.OAuth2Settings.TokenURL,
			Scopes:         []string{},
			EndpointParams: url.Values{},
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
func ApplyOAuthJWT(httpClient *http.Client, settings models.InfinitySettings) *http.Client {
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
func ApplyDigestAuth(httpClient *http.Client, settings models.InfinitySettings) *http.Client {
	if settings.AuthenticationMethod == models.AuthenticationMethodDigestAuth {
		a := dac.NewTransport(settings.UserName, settings.Password)
		httpClient.Transport = &a
	}
	return httpClient
}
func ApplyAWSAuth(httpClient *http.Client, settings models.InfinitySettings) *http.Client {
	if settings.AuthenticationMethod == models.AuthenticationMethodAWS {
		tempHttpClient := getBaseHTTPClient(settings)
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
