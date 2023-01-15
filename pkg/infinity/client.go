package infinity

import (
	"bytes"
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

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
	settingsSrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/settings"
)

type Client struct {
	Settings   settingsSrv.InfinitySettings
	HttpClient *http.Client
	IsMock     bool
}

func GetTLSConfigFromSettings(settings settingsSrv.InfinitySettings) (*tls.Config, error) {
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

func getBaseHTTPClient(settings settingsSrv.InfinitySettings) *http.Client {
	tlsConfig, err := GetTLSConfigFromSettings(settings)
	if err != nil {
		return nil
	}
	transport := &http.Transport{
		Proxy:           http.ProxyFromEnvironment,
		TLSClientConfig: tlsConfig,
	}
	return &http.Client{
		Transport: transport,
		Timeout:   time.Second * time.Duration(settings.TimeoutInSeconds),
	}
}

func NewClient(settings settingsSrv.InfinitySettings) (client *Client, err error) {
	if settings.AuthenticationMethod == "" {
		settings.AuthenticationMethod = settingsSrv.AuthenticationMethodNone
		if settings.BasicAuthEnabled {
			settings.AuthenticationMethod = settingsSrv.AuthenticationMethodBasic
		}
		if settings.ForwardOauthIdentity {
			settings.AuthenticationMethod = settingsSrv.AuthenticationMethodForwardOauth
		}
	}
	httpClient := getBaseHTTPClient(settings)
	if httpClient == nil {
		return nil, errors.New("invalid http client")
	}
	httpClient = ApplyDigestAuth(httpClient, settings)
	httpClient = ApplyOAuthClientCredentials(httpClient, settings)
	httpClient = ApplyOAuthJWT(httpClient, settings)
	httpClient = ApplyAWSAuth(httpClient, settings)
	return &Client{
		Settings:   settings,
		HttpClient: httpClient,
	}, err
}

func replaceSect(input string, settings settingsSrv.InfinitySettings, includeSect bool) string {
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

func (client *Client) req(url string, body io.Reader, settings settingsSrv.InfinitySettings, query querySrv.Query, requestHeaders map[string]string) (obj any, statusCode int, duration time.Duration, err error) {
	req, _ := GetRequest(settings, body, query, requestHeaders, true)
	startTime := time.Now()
	if !CanAllowURL(req.URL.String(), settings.AllowedHosts) {
		backend.Logger.Error("url is not in the allowed list. make sure to match the base URL with the settings", "url", req.URL.String())
		return nil, http.StatusUnauthorized, 0, errors.New("requested URL is not allowed. To allow this URL, update the datasource config URL -> Allowed Hosts section")
	}
	res, err := client.HttpClient.Do(req)
	duration = time.Since(startTime)
	if res != nil {
		defer res.Body.Close()
	}
	if err != nil && res != nil {
		backend.Logger.Error("error getting response from server", "url", url, "method", req.Method, "error", err.Error(), "status code", res.StatusCode)
		return nil, res.StatusCode, duration, fmt.Errorf("error getting response from %s", url)
	}
	if err != nil && res == nil {
		backend.Logger.Error("error getting response from server. no response received", "url", url, "error", err.Error())
		return nil, http.StatusInternalServerError, duration, fmt.Errorf("error getting response from url %s. no response received. Error: %s", url, err.Error())
	}
	if err == nil && res == nil {
		backend.Logger.Error("invalid response from server and also no error", "url", url, "method", req.Method)
		return nil, http.StatusInternalServerError, duration, fmt.Errorf("invalid response received for the URL %s", url)
	}
	if res.StatusCode >= http.StatusBadRequest {
		return nil, res.StatusCode, duration, errors.New(res.Status)
	}
	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		backend.Logger.Error("error reading response body", "url", url, "error", err.Error())
		return nil, res.StatusCode, duration, err
	}
	bodyBytes = removeBOMContent(bodyBytes)
	if CanParseAsJSON(query.Type, res.Header) {
		var out any
		err := json.Unmarshal(bodyBytes, &out)
		if err != nil {
			backend.Logger.Error("error un-marshaling JSON response", "url", url, "error", err.Error())
		}
		return out, res.StatusCode, duration, err
	}
	return string(bodyBytes), res.StatusCode, duration, err
}

// https://stackoverflow.com/questions/31398044/got-error-invalid-character-%C3%AF-looking-for-beginning-of-value-from-json-unmar
func removeBOMContent(input []byte) []byte {
	return bytes.TrimPrefix(input, []byte("\xef\xbb\xbf"))
}

func (client *Client) GetResults(query querySrv.Query, requestHeaders map[string]string) (o any, statusCode int, duration time.Duration, err error) {
	switch strings.ToUpper(query.URLOptions.Method) {
	case http.MethodPost:
		body := GetQueryBody(query)
		return client.req(query.URL, body, client.Settings, query, requestHeaders)
	default:
		return client.req(query.URL, nil, client.Settings, query, requestHeaders)
	}
}

func CanParseAsJSON(queryType querySrv.QueryType, responseHeaders http.Header) bool {
	if queryType == querySrv.QueryTypeJSON || queryType == querySrv.QueryTypeGraphQL {
		return true
	}
	if queryType == querySrv.QueryTypeUQL || queryType == querySrv.QueryTypeGROQ {
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

func GetQueryBody(query querySrv.Query) io.Reader {
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
				backend.Logger.Error("error closing the query body reader")
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
			jsonData := map[string]string{
				"query": query.URLOptions.BodyGraphQLQuery,
			}
			jsonValue, _ := json.Marshal(jsonData)
			body = strings.NewReader(string(jsonValue))
		default:
			body = strings.NewReader(query.URLOptions.Body)
		}
	}
	return body
}
