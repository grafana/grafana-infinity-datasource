package infinity

import (
	"bytes"
	"compress/gzip"
	"context"
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
	"github.com/grafana/grafana-infinity-datasource/pkg/httpclient"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
)

type Client struct {
	Settings        models.InfinitySettings
	HttpClient      *http.Client
	AzureBlobClient *azblob.Client
	IsMock          bool
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
	httpClient, err := httpclient.GetHTTPClient(ctx, settings)
	if err != nil {
		span.RecordError(errors.New("invalid http client"))
		logger.Error("invalid http client", "datasource uid", settings.UID, "datasource name", settings.Name)
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

func (client *Client) req(ctx context.Context, pCtx *backend.PluginContext, url string, body io.Reader, settings models.InfinitySettings, query models.Query, requestHeaders map[string]string) (obj any, statusCode int, duration time.Duration, err error) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "client.req")
	logger := backend.Logger.FromContext(ctx)
	defer span.End()
	req, err := GetRequest(ctx, pCtx, settings, body, query, requestHeaders, true)
	if err != nil {
		return nil, http.StatusInternalServerError, 0, backend.DownstreamError(fmt.Errorf("error preparing request. %w", err))
	}
	if req == nil {
		return nil, http.StatusInternalServerError, 0, backend.DownstreamError(errors.New("error preparing request. invalid request constructed"))
	}
	startTime := time.Now()
	if !CanAllowURL(req.URL.String(), settings.AllowedHosts) {
		logger.Debug("url is not in the allowed list. make sure to match the base URL with the settings", "url", req.URL.String())
		return nil, http.StatusUnauthorized, 0, backend.DownstreamError(errors.New("requested URL is not allowed. To allow this URL, update the datasource config Security -> Allowed Hosts section"))
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
			return nil, res.StatusCode, duration, backend.DownstreamError(fmt.Errorf("error getting response from %s", url))
		}
		if errors.Is(err, context.Canceled) {
			logger.Debug("request cancelled", "url", url, "method", req.Method)
			return nil, http.StatusInternalServerError, duration, backend.DownstreamError(err)
		}
		logger.Debug("error getting response from server. no response received", "url", url, "error", err.Error())
		return nil, http.StatusInternalServerError, duration, backend.DownstreamError(fmt.Errorf("error getting response from url %s. no response received. Error: %w", url, err))
	}
	if res == nil {
		logger.Debug("invalid response from server and also no error", "url", url, "method", req.Method)
		return nil, http.StatusInternalServerError, duration, backend.DownstreamError(fmt.Errorf("invalid response received for the URL %s", url))
	}
	if res.StatusCode >= http.StatusBadRequest {
		err = fmt.Errorf("%w. %s", models.ErrUnsuccessfulHTTPResponseStatus, res.Status)
		// Infinity can query anything and users are responsible for ensuring that endpoint/auth is correct
		// therefore any incoming error is considered downstream
		return nil, res.StatusCode, duration, backend.DownstreamError(err)
	}
	bodyBytes, err := getBodyBytes(res)
	if err != nil {
		logger.Debug("error reading response body", "url", url, "error", err.Error())
		return nil, res.StatusCode, duration, backend.DownstreamError(err)
	}
	bodyBytes = removeBOMContent(bodyBytes)
	if CanParseAsJSON(query.Type, res.Header) {
		var out any
		err := json.Unmarshal(bodyBytes, &out)
		if err != nil {
			err = fmt.Errorf("%w. %w", models.ErrParsingResponseBodyAsJson, err)
			err = backend.DownstreamError(err)
			logger.Debug("error un-marshaling JSON response", "url", url, "error", err.Error())
		}
		return out, res.StatusCode, duration, err
	}
	return string(bodyBytes), res.StatusCode, duration, err
}

func getBodyBytes(res *http.Response) ([]byte, error) {
	if strings.EqualFold(res.Header.Get("Content-Encoding"), "gzip") {
		reader, err := gzip.NewReader(res.Body)
		if err != nil {
			return nil, err
		}
		defer reader.Close()
		return io.ReadAll(reader)
	}
	return io.ReadAll(res.Body)
}

// https://stackoverflow.com/questions/31398044/got-error-invalid-character-%C3%AF-looking-for-beginning-of-value-from-json-unmar
func removeBOMContent(input []byte) []byte {
	return bytes.TrimPrefix(input, []byte("\xef\xbb\xbf"))
}

func (client *Client) GetResults(ctx context.Context, pCtx *backend.PluginContext, query models.Query, requestHeaders map[string]string) (o any, statusCode int, duration time.Duration, err error) {
	logger := backend.Logger.FromContext(ctx)
	if query.Source == "azure-blob" {
		if strings.TrimSpace(query.AzBlobContainerName) == "" || strings.TrimSpace(query.AzBlobName) == "" {
			return nil, http.StatusBadRequest, 0, backend.DownstreamError(errors.New("invalid/empty container name/blob name"))
		}
		if client.AzureBlobClient == nil {
			return nil, http.StatusInternalServerError, 0, backend.PluginError(errors.New("invalid azure blob client"))
		}
		blobDownloadResponse, err := client.AzureBlobClient.DownloadStream(ctx, strings.TrimSpace(query.AzBlobContainerName), strings.TrimSpace(query.AzBlobName), nil)
		if err != nil {
			return nil, http.StatusInternalServerError, 0, backend.DownstreamError(err)
		}
		reader := blobDownloadResponse.Body
		bodyBytes, err := io.ReadAll(reader)
		if err != nil {
			return nil, http.StatusInternalServerError, 0, backend.PluginError(fmt.Errorf("error reading blob content. %w", err))
		}
		bodyBytes = removeBOMContent(bodyBytes)
		if CanParseAsJSON(query.Type, http.Header{}) {
			var out any
			err := json.Unmarshal(bodyBytes, &out)
			if err != nil {
				logger.Error("error un-marshaling blob content", "error", err.Error())
				err = backend.PluginError(err)
			}
			return out, http.StatusOK, duration, err
		}
		return string(bodyBytes), http.StatusOK, 0, nil
	}
	switch strings.ToUpper(query.URLOptions.Method) {
	case http.MethodPost:
		body := GetQueryBody(ctx, query)
		return client.req(ctx, pCtx, query.URL, body, client.Settings, query, requestHeaders)
	default:
		return client.req(ctx, pCtx, query.URL, nil, client.Settings, query, requestHeaders)
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
