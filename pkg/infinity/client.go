package infinity

import (
	"bytes"
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/proxy"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/errorsource"
	"github.com/icholy/digest"
	"golang.org/x/oauth2"
)

type Client struct {
	Settings        models.InfinitySettings
	HttpClient      *http.Client
	AzureBlobClient *azblob.Client
	IsMock          bool
}

func GetTLSConfigFromSettings(settings models.InfinitySettings) (*tls.Config, error) {
	tlsConfig := &tls.Config{
		InsecureSkipVerify: settings.InsecureSkipVerify,
		ServerName:         settings.ServerName,
	}
	if settings.TLSClientAuth {
		if settings.TLSClientCert == "" || settings.TLSClientKey == "" {
			return nil, errors.New("invalid Client cert or key")
		}
		cert, err := tls.X509KeyPair([]byte(settings.TLSClientCert), []byte(settings.TLSClientKey))
		if err != nil {
			return nil, err
		}
		tlsConfig.Certificates = []tls.Certificate{cert}
	}
	if settings.TLSAuthWithCACert && settings.TLSCACert != "" {
		caPool := x509.NewCertPool()
		ok := caPool.AppendCertsFromPEM([]byte(settings.TLSCACert))
		if !ok {
			return nil, errors.New("invalid TLS CA certificate")
		}
		tlsConfig.RootCAs = caPool
	}
	return tlsConfig, nil
}

func getBaseHTTPClient(ctx context.Context, settings models.InfinitySettings) *http.Client {
	logger := backend.Logger.FromContext(ctx)
	tlsConfig, err := GetTLSConfigFromSettings(settings)
	if err != nil {
		return nil
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
			return nil
		}
		transport.Proxy = http.ProxyURL(u)
	default:
		transport.Proxy = http.ProxyFromEnvironment
	}

	return &http.Client{
		Transport: transport,
		Timeout:   time.Second * time.Duration(settings.TimeoutInSeconds),
	}
}

func NewClient(ctx context.Context, settings models.InfinitySettings) (client *Client, err error) {
	logger := backend.Logger.FromContext(ctx)
	_, span := tracing.DefaultTracer().Start(ctx, "NewClient")
	defer span.End()
	if settings.AuthenticationMethod == "" {
		settings.AuthenticationMethod = models.AuthenticationMethodNone
		if settings.BasicAuthEnabled {
			settings.AuthenticationMethod = models.AuthenticationMethodBasic
		}
		if settings.ForwardOauthIdentity {
			settings.AuthenticationMethod = models.AuthenticationMethodForwardOauth
		}
	}
	httpClient := getBaseHTTPClient(ctx, settings)
	if httpClient == nil {
		span.RecordError(errors.New("invalid http client"))
		logger.Error("invalid http client", "datasource uid", settings.UID, "datasource name", settings.Name)
		return client, errors.New("invalid http client")
	}
	httpClient = ApplyDigestAuth(ctx, httpClient, settings)
	httpClient = ApplyOAuthClientCredentials(ctx, httpClient, settings)
	httpClient = ApplyOAuthJWT(ctx, httpClient, settings)
	httpClient = ApplyAWSAuth(ctx, httpClient, settings)

	httpClient, err = ApplySecureSocksProxyConfiguration(ctx, httpClient, settings)
	if err != nil {
		logger.Error("error applying secure socks proxy", "datasource uid", settings.UID, "datasource name", settings.Name)
		return client, err
	}

	client = &Client{
		Settings:   settings,
		HttpClient: httpClient,
	}

	if settings.AuthenticationMethod == models.AuthenticationMethodAzureBlob {
		cred, err := azblob.NewSharedKeyCredential(settings.AzureBlobAccountName, settings.AzureBlobAccountKey)
		if err != nil {
			span.RecordError(err)
			span.SetStatus(500, err.Error())
			logger.Error("invalid azure blob credentials", "datasource uid", settings.UID, "datasource name", settings.Name)
			return client, errors.New("invalid azure blob credentials")
		}
		clientUrl := "https://%s.blob.core.windows.net/"
		if settings.AzureBlobAccountUrl != "" {
			clientUrl = settings.AzureBlobAccountUrl
		}
		if strings.Contains(clientUrl, "%s") {
			clientUrl = fmt.Sprintf(clientUrl, settings.AzureBlobAccountName)
		}
		azClient, err := azblob.NewClientWithSharedKeyCredential(clientUrl, cred, nil)
		if err != nil {
			span.RecordError(err)
			span.SetStatus(500, err.Error())
			logger.Error("error creating azure blob client", "datasource uid", settings.UID, "datasource name", settings.Name)
			return client, fmt.Errorf("error creating azure blob client. %s", err)
		}
		if azClient == nil {
			span.RecordError(errors.New("invalid/empty azure blob client"))
			span.SetStatus(500, "invalid/empty azure blob client")
			logger.Error("invalid/empty azure blob client", "datasource uid", settings.UID, "datasource name", settings.Name)
			return client, errors.New("invalid/empty azure blob client")
		}
		client.AzureBlobClient = azClient
	}
	if settings.IsMock {
		client.IsMock = true
	}
	return client, err
}

func ApplySecureSocksProxyConfiguration(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) (*http.Client, error) {
	logger := backend.Logger.FromContext(ctx)
	if IsAwsAuthConfigured(settings) {
		return httpClient, nil
	}
	t := httpClient.Transport
	if IsDigestAuthConfigured(settings) {
		// if we are using Digest, the Transport is 'digest.Transport' that wraps 'http.Transport'
		t = t.(*digest.Transport).Transport
	} else if IsOAuthCredentialsConfigured(settings) || IsOAuthJWTConfigured(settings) {
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

func replaceSect(input string, settings models.InfinitySettings, includeSect bool) string {
	for key, value := range settings.SecureQueryFields {
		if includeSect {
			input = strings.ReplaceAll(input, fmt.Sprintf("${__qs.%s}", key), value)
		}
		if !includeSect {
			input = strings.ReplaceAll(input, fmt.Sprintf("${__qs.%s}", key), dummyHeader)
		}
	}
	return input
}

func (client *Client) req(ctx context.Context, url string, body io.Reader, settings models.InfinitySettings, query models.Query, requestHeaders map[string]string) (obj any, statusCode int, duration time.Duration, err error) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "client.req")
	logger := backend.Logger.FromContext(ctx)
	defer span.End()
	req, err := GetRequest(ctx, settings, body, query, requestHeaders, true)
	if err != nil {
		return nil, http.StatusInternalServerError, 0, errorsource.DownstreamError(fmt.Errorf("error preparing request. %w", err), false)
	}
	if req == nil {
		return nil, http.StatusInternalServerError, 0, errorsource.DownstreamError(errors.New("error preparing request. invalid request constructed"), false)
	}
	startTime := time.Now()
	if !CanAllowURL(req.URL.String(), settings.AllowedHosts) {
		logger.Debug("url is not in the allowed list. make sure to match the base URL with the settings", "url", req.URL.String())
		return nil, http.StatusUnauthorized, 0, errorsource.DownstreamError(errors.New("requested URL is not allowed. To allow this URL, update the datasource config Security -> Allowed Hosts section"), false)
	}
	logger.Debug("requesting URL", "host", req.URL.Hostname(), "url_path", req.URL.Path, "method", req.Method, "type", query.Type)
	res, err := client.HttpClient.Do(req)
	duration = time.Since(startTime)
	logger.Debug("received response", "host", req.URL.Hostname(), "url_path", req.URL.Path, "method", req.Method, "type", query.Type, "duration_ms", duration.Milliseconds())
	if res != nil {
		defer res.Body.Close()
	}
	if err != nil {
		if res != nil {
			logger.Debug("error getting response from server", "url", url, "method", req.Method, "error", err.Error(), "status code", res.StatusCode)
			// Infinity can query anything and users are responsible for ensuring that endpoint/auth is correct
			// therefore any incoming error is considered downstream
			return nil, res.StatusCode, duration, errorsource.DownstreamError(fmt.Errorf("error getting response from %s", url), false)
		}
		if errors.Is(err, context.Canceled) {
			logger.Debug("request cancelled", "url", url, "method", req.Method)
			return nil, http.StatusInternalServerError, duration, errorsource.DownstreamError(err, false)
		}
		logger.Debug("error getting response from server. no response received", "url", url, "error", err.Error())
		return nil, http.StatusInternalServerError, duration, errorsource.DownstreamError(fmt.Errorf("error getting response from url %s. no response received. Error: %w", url, err), false)
	}
	if res == nil {
		logger.Debug("invalid response from server and also no error", "url", url, "method", req.Method)
		return nil, http.StatusInternalServerError, duration, errorsource.DownstreamError(fmt.Errorf("invalid response received for the URL %s", url), false)
	}
	if res.StatusCode >= http.StatusBadRequest {
		err = fmt.Errorf("%w. %s", ErrUnsuccessfulHTTPResponseStatus, res.Status)
		// Infinity can query anything and users are responsible for ensuring that endpoint/auth is correct
		// therefore any incoming error is considered downstream
		return nil, res.StatusCode, duration, errorsource.DownstreamError(err, false)
	}
	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		logger.Debug("error reading response body", "url", url, "error", err.Error())
		return nil, res.StatusCode, duration, errorsource.DownstreamError(err, false)
	}
	bodyBytes = removeBOMContent(bodyBytes)
	if CanParseAsJSON(query.Type, res.Header) {
		var out any
		err := json.Unmarshal(bodyBytes, &out)
		if err != nil {
			err = fmt.Errorf("%w. %w", ErrParsingResponseBodyAsJson, err)
			err = errorsource.DownstreamError(err, false)
			logger.Debug("error un-marshaling JSON response", "url", url, "error", err.Error())
		}
		return out, res.StatusCode, duration, err
	}
	return string(bodyBytes), res.StatusCode, duration, err
}

// https://stackoverflow.com/questions/31398044/got-error-invalid-character-%C3%AF-looking-for-beginning-of-value-from-json-unmar
func removeBOMContent(input []byte) []byte {
	return bytes.TrimPrefix(input, []byte("\xef\xbb\xbf"))
}

func (client *Client) GetResults(ctx context.Context, query models.Query, requestHeaders map[string]string) (o any, statusCode int, duration time.Duration, err error) {
	logger := backend.Logger.FromContext(ctx)
	if query.Source == "azure-blob" {
		if strings.TrimSpace(query.AzBlobContainerName) == "" || strings.TrimSpace(query.AzBlobName) == "" {
			return nil, http.StatusBadRequest, 0, errorsource.DownstreamError(errors.New("invalid/empty container name/blob name"), false)
		}
		if client.AzureBlobClient == nil {
			return nil, http.StatusInternalServerError, 0, errorsource.PluginError(errors.New("invalid azure blob client"), false)
		}
		blobDownloadResponse, err := client.AzureBlobClient.DownloadStream(ctx, strings.TrimSpace(query.AzBlobContainerName), strings.TrimSpace(query.AzBlobName), nil)
		if err != nil {
			return nil, http.StatusInternalServerError, 0, errorsource.DownstreamError(err, false)
		}
		reader := blobDownloadResponse.Body
		bodyBytes, err := io.ReadAll(reader)
		if err != nil {
			return nil, http.StatusInternalServerError, 0, errorsource.PluginError(fmt.Errorf("error reading blob content. %w", err), false)
		}
		bodyBytes = removeBOMContent(bodyBytes)
		if CanParseAsJSON(query.Type, http.Header{}) {
			var out any
			err := json.Unmarshal(bodyBytes, &out)
			if err != nil {
				logger.Error("error un-marshaling blob content", "error", err.Error())
				err = errorsource.PluginError(err, false)
			}
			return out, http.StatusOK, duration, err
		}
		return string(bodyBytes), http.StatusOK, 0, nil
	} else if query.Source == "unistore" {
		// unistore can either pull an entire file (not desired) or a dataframe series
		if query.Type != "series" {
			actualType := query.Type
			query.URL = fmt.Sprintf("%sapis/file.grafana.app/v0alpha1/namespaces/default/files/%s/data", client.Settings.AllowedHosts[0], query.Dataset)
			//hack because we always return a json that contains a string of json/csv data
			query.Type = "json"
			urlResponseObject, statusCode, duration, err := client.req(ctx, query.URL, nil, client.Settings, query, requestHeaders)
			if err != nil {
				return urlResponseObject, statusCode, duration, err
			}

			if dataMap, ok := urlResponseObject.(map[string]interface{}); ok {
				if spec, ok := dataMap["spec"].(map[string]interface{}); ok {
					if dataArray, ok := spec["data"].([]interface{}); ok {
						// Assuming the "data" array has at least one element
						if dataObj, ok := dataArray[0].(map[string]interface{}); ok {
							if contents, ok := dataObj["Contents"].(string); ok {
								if actualType == "json" {
									var jsonData interface{}
									err := json.Unmarshal([]byte(contents), &jsonData)
									if err != nil {
										logger.Error("error un-marshaling blob content", "error", err.Error())
										err = errorsource.PluginError(err, false)
										return contents, statusCode, duration, err
									}

									return jsonData, statusCode, duration, nil
								}

								return contents, statusCode, duration, nil
							}
						}
					}
				}
			}

			logger.Error("error un-marshaling blob content", "error", err.Error())
			err = errorsource.PluginError(err, false)
			return urlResponseObject, statusCode, duration, err
		} else {
			query.URL = fmt.Sprintf("%sapis/dataset.grafana.app/v0alpha1/namespaces/default/datasets/%s/data", client.Settings.AllowedHosts[0], query.Dataset)
			//hack because we always return a json that contains the series
			query.Type = "json"

			urlResponseObject, statusCode, duration, err := client.req(ctx, query.URL, nil, client.Settings, query, requestHeaders)
			if err != nil {
				return urlResponseObject, statusCode, duration, err
			}

			if dataMap, ok := urlResponseObject.(map[string]interface{}); ok {
				if spec, ok := dataMap["spec"].(map[string]interface{}); ok {
					if dataArray, ok := spec["data"].([]interface{}); ok {
						// Assuming the "data" array has at least one element
						if dataframe, ok := dataArray[0].(map[string]interface{}); ok {
							return dataframe, statusCode, duration, nil
						}
					}
				}
			}

			logger.Error("error un-marshaling blob content", "error", err.Error())
			err = errorsource.PluginError(err, false)
			return urlResponseObject, statusCode, duration, err
		}
	}
	switch strings.ToUpper(query.URLOptions.Method) {
	case http.MethodPost:
		body := GetQueryBody(ctx, query)
		return client.req(ctx, query.URL, body, client.Settings, query, requestHeaders)
	default:
		return client.req(ctx, query.URL, nil, client.Settings, query, requestHeaders)
	}
}

func CanParseAsJSON(queryType models.QueryType, responseHeaders http.Header) bool {
	if queryType == models.QueryTypeJSON || queryType == models.QueryTypeGraphQL {
		return true
	}
	if queryType == models.QueryTypeUQL || queryType == models.QueryTypeGROQ {
		contentType := responseHeaders.Get(headerKeyContentType)
		if strings.Contains(strings.ToLower(contentType), contentTypeJSON) {
			return true
		}
	}
	return false
}

func CanAllowURL(url string, allowedHosts []string) bool {
	allow := false
	if len(allowedHosts) == 0 {
		return true
	}
	for _, host := range allowedHosts {
		if strings.HasPrefix(url, host) {
			return true
		}
	}
	return allow
}

func GetQueryBody(ctx context.Context, query models.Query) io.Reader {
	logger := backend.Logger.FromContext(ctx)
	var body io.Reader
	if strings.EqualFold(query.URLOptions.Method, http.MethodPost) {
		switch query.URLOptions.BodyType {
		case "raw":
			body = strings.NewReader(query.URLOptions.Body)
		case "form-data":
			payload := &bytes.Buffer{}
			writer := multipart.NewWriter(payload)
			for _, f := range query.URLOptions.BodyForm {
				_ = writer.WriteField(f.Key, f.Value)
			}
			if err := writer.Close(); err != nil {
				logger.Error("error closing the query body reader")
				return nil
			}
			body = payload
		case "x-www-form-urlencoded":
			form := url.Values{}
			for _, f := range query.URLOptions.BodyForm {
				form.Set(f.Key, f.Value)
			}
			body = strings.NewReader(form.Encode())
		case "graphql":
			var variables map[string]interface{}
			if query.URLOptions.BodyGraphQLVariables != "" {
				err := json.Unmarshal([]byte(query.URLOptions.BodyGraphQLVariables), &variables)
				if err != nil {
					logger.Error("Error parsing graphql variable json", err)
				}
			}
			jsonData := map[string]interface{}{
				"query":     query.URLOptions.BodyGraphQLQuery,
				"variables": variables,
			}
			jsonValue, _ := json.Marshal(jsonData)
			body = strings.NewReader(string(jsonValue))
		default:
			body = strings.NewReader(query.URLOptions.Body)
		}
	}
	return body
}
