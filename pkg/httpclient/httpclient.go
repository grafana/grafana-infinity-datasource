package httpclient

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-aws-sdk/pkg/sigv4"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/proxy"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/icholy/digest"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"
	"golang.org/x/oauth2/jwt"
)

func GetHTTPClient(ctx context.Context, settings models.InfinitySettings) (*http.Client, error) {
	httpClient, err := getBaseHTTPClient(ctx, settings)
	if httpClient == nil {
		return httpClient, errors.Join(models.ErrCreatingHTTPClient, err)
	}
	httpClient, err = applyDigestAuth(ctx, httpClient, settings)
	if err != nil {
		return httpClient, errors.Join(models.ErrCreatingHTTPClient, err)
	}
	httpClient, err = applyOAuthClientCredentials(ctx, httpClient, settings)
	if err != nil {
		return httpClient, errors.Join(models.ErrCreatingHTTPClient, err)
	}
	httpClient, err = applyOAuthJWT(ctx, httpClient, settings)
	if err != nil {
		return httpClient, errors.Join(models.ErrCreatingHTTPClient, err)
	}
	httpClient, err = applyAWSAuth(ctx, httpClient, settings)
	if err != nil {
		return httpClient, errors.Join(models.ErrCreatingHTTPClient, err)
	}
	httpClient, err = applySecureSocksProxyConfiguration(ctx, httpClient, settings)
	if err != nil {
		return httpClient, errors.Join(models.ErrCreatingHTTPClient, err)
	}
	return httpClient, nil
}

func getBaseHTTPClient(ctx context.Context, settings models.InfinitySettings) (*http.Client, error) {
	logger := backend.Logger.FromContext(ctx)
	tlsConfig, err := GetTLSConfigFromSettings(settings)
	if err != nil {
		return nil, err
	}
	transport := &http.Transport{TLSClientConfig: tlsConfig}
	switch settings.ProxyType {
	case models.ProxyTypeNone:
		logger.Debug("proxy type is set to none. Not using the proxy")
	case models.ProxyTypeUrl:
		logger.Debug("proxy type is set to url. Using the proxy", "proxy_url", settings.ProxyUrl)
		u, err := url.Parse(settings.ProxyUrl)
		if err != nil {
			logger.Error("error parsing proxy url", "err", err.Error(), "proxy_url", settings.ProxyUrl)
			return nil, err
		}
		transport.Proxy = http.ProxyURL(u)
	default:
		transport.Proxy = http.ProxyFromEnvironment
	}

	return &http.Client{
		Transport: transport,
		Timeout:   time.Second * time.Duration(settings.TimeoutInSeconds),
	}, nil
}

func isDigestAuthConfigured(settings models.InfinitySettings) bool {
	return settings.AuthenticationMethod == models.AuthenticationMethodDigestAuth
}

func applyDigestAuth(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) (*http.Client, error) {
	_, span := tracing.DefaultTracer().Start(ctx, "ApplyDigestAuth")
	defer span.End()
	if isDigestAuthConfigured(settings) {
		a := digest.Transport{Username: settings.UserName, Password: settings.Password, Transport: httpClient.Transport}
		httpClient.Transport = &a
	}
	return httpClient, nil
}

func isOAuthCredentialsConfigured(settings models.InfinitySettings) bool {
	return settings.AuthenticationMethod == models.AuthenticationMethodOAuth && settings.OAuth2Settings.OAuth2Type == models.AuthOAuthTypeClientCredentials
}

func applyOAuthClientCredentials(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) (*http.Client, error) {
	_, span := tracing.DefaultTracer().Start(ctx, "ApplyOAuthClientCredentials")
	defer span.End()
	if isOAuthCredentialsConfigured(settings) {
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
	return httpClient, nil
}

func isOAuthJWTConfigured(settings models.InfinitySettings) bool {
	return settings.AuthenticationMethod == models.AuthenticationMethodOAuth && settings.OAuth2Settings.OAuth2Type == models.AuthOAuthJWT
}

func applyOAuthJWT(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) (*http.Client, error) {
	_, span := tracing.DefaultTracer().Start(ctx, "ApplyOAuthJWT")
	defer span.End()
	if isOAuthJWTConfigured(settings) {
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
	return httpClient, nil
}

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
		conf := &sigv4.Config{
			AuthType:  string(authType),
			Region:    region,
			Service:   service,
			AccessKey: settings.AWSAccessKey,
			SecretKey: settings.AWSSecretKey,
		}

		authSettings := awsds.ReadAuthSettings(ctx)
		rt, err := sigv4.New(conf, *authSettings, sigv4.RoundTripperFunc(func(req *http.Request) (*http.Response, error) {
			req.Header.Add("Accept", "application/json")
			return tempHttpClient.Do(req)
		}))
		if err != nil {
			return httpClient, err
		}
		httpClient.Transport = rt
	}
	return httpClient, nil
}

func applySecureSocksProxyConfiguration(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) (*http.Client, error) {
	logger := backend.Logger.FromContext(ctx)
	if isAwsAuthConfigured(settings) {
		return httpClient, nil
	}
	t := httpClient.Transport
	if isDigestAuthConfigured(settings) {
		// if we are using Digest, the Transport is 'digest.Transport' that wraps 'http.Transport'
		t = t.(*digest.Transport).Transport
	} else if isOAuthCredentialsConfigured(settings) || isOAuthJWTConfigured(settings) {
		// if we are using Oauth, the Transport is 'oauth2.Transport' that wraps 'http.Transport'
		t = t.(*oauth2.Transport).Base
	}

	// secure socks proxy configuration - checks if enabled inside the function
	err := proxy.New(settings.ProxyOpts.ProxyOptions).ConfigureSecureSocksHTTPProxy(t.(*http.Transport))
	if err != nil {
		logger.Error("error configuring secure socks proxy", "err", err.Error())
		return nil, fmt.Errorf("error configuring secure socks proxy. %s", err)
	}
	return httpClient, nil
}
