package infinity

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Client struct {
	Settings   InfinitySettings
	HttpClient *http.Client
}

func GetTLSConfigFromSettings(settings InfinitySettings) (*tls.Config, error) {
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

func NewClient(settings InfinitySettings) (client *Client, err error) {
	tlsConfig, err := GetTLSConfigFromSettings(settings)
	if err != nil {
		return nil, err
	}
	transport := &http.Transport{
		Proxy:           http.ProxyFromEnvironment,
		TLSClientConfig: tlsConfig,
	}
	httpClient := &http.Client{
		Transport: transport,
		Timeout:   time.Second * time.Duration(settings.TimeoutInSeconds),
	}
	return &Client{
		Settings:   settings,
		HttpClient: httpClient,
	}, err
}

func replaceSecret(input string, settings InfinitySettings) string {
	for key, value := range settings.SecureQueryFields {
		input = strings.ReplaceAll(input, fmt.Sprintf("${__qs.%s}", key), value)
	}
	return input
}

func GetQueryURL(settings InfinitySettings, query Query) (string, error) {
	urlString := query.URL
	if !strings.HasPrefix(query.URL, settings.URL) {
		urlString = settings.URL + urlString
	}
	urlString = replaceSecret(urlString, settings)
	u, err := url.Parse(urlString)
	if err != nil {
		return urlString, nil
	}
	q := u.Query()
	for _, param := range query.URLOptions.Params {
		value := replaceSecret(param.Value, settings)
		q.Set(param.Key, value)
	}
	u.RawQuery = q.Encode()
	return u.String(), nil
}

func getRequest(settings InfinitySettings, body io.Reader, query Query) (req *http.Request, err error) {
	url, err := GetQueryURL(settings, query)
	if err != nil {
		return nil, err
	}
	switch query.URLOptions.Method {
	case "POST":
		req, err = http.NewRequest("POST", url, body)
	default:
		req, err = http.NewRequest("GET", url, nil)
	}
	if settings.BasicAuthEnabled && (settings.UserName != "" || settings.Password != "") {
		req.Header.Add("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(settings.UserName+":"+settings.Password)))
	}
	req.Header.Set("User-Agent", "Grafana")
	if query.Type == "json" || query.Type == "graphql" {
		req.Header.Set("Content-Type", "application/json")
	}
	for _, header := range query.URLOptions.Headers {
		value := replaceSecret(header.Value, settings)
		req.Header.Set(header.Key, value)
	}
	for key, value := range settings.CustomHeaders {
		req.Header.Set(key, value)
	}
	return req, err
}

func (client *Client) req(url string, body *strings.Reader, settings InfinitySettings, isJSON bool, query Query) (obj interface{}, err error) {
	req, _ := getRequest(settings, body, query)
	res, err := client.HttpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error getting response from %s", url)
	}
	defer res.Body.Close()
	if res.StatusCode >= http.StatusBadRequest {
		return nil, errors.New(res.Status)
	}
	bodyBytes, err := ioutil.ReadAll(res.Body)
	return string(bodyBytes), err
}

func (client *Client) GetResults(query Query) (o interface{}, err error) {
	isJSON := false
	if query.Type == "json" || query.Type == "graphql" {
		isJSON = true
	}
	switch query.URLOptions.Method {
	case "POST":
		body := strings.NewReader(query.URLOptions.Data)
		if query.Type == "graphql" {
			jsonData := map[string]string{
				"query": query.URLOptions.Data,
			}
			jsonValue, _ := json.Marshal(jsonData)
			body = strings.NewReader(string(jsonValue))
		}
		return client.req(query.URL, body, client.Settings, isJSON, query)
	default:
		return client.req(query.URL, nil, client.Settings, isJSON, query)
	}
}

// func isFileAllowedToQuery(allowedPaths []string, path string) bool {
// 	for _, allowedPath := range allowedPaths {
// 		if strings.HasPrefix(strings.ToLower(path), strings.ToLower(allowedPath)) {
// 			return true
// 		}
// 	}
// 	return false
// }

func (client *Client) GetLocalFileContent(query Query) (o interface{}, err error) {
	return nil, errors.New("feature disabled")
	// if isFileAllowedToQuery(client.Settings.LocalSources.AllowedPaths, query.URL) && client.Settings.LocalSources.Enabled {
	// 	filePath := strings.TrimSpace(query.URL)
	// 	content, err := os.ReadFile(filePath)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	return string(content), nil
	// }
	// return nil, errors.New("file path not allowed. Contact grafana admin to setup this in datasource settings")
}
