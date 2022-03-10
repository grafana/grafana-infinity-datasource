package infinity

import (
	"context"
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

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"
	"golang.org/x/oauth2/jwt"
	"moul.io/http2curl"
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
	if settings.AuthenticationMethod == "oauth2" {
		if settings.OAuth2Settings.OAuth2Type == "client_credentials" {
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
		if settings.OAuth2Settings.OAuth2Type == "jwt" {
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
	}
	return &Client{
		Settings:   settings,
		HttpClient: httpClient,
	}, err
}

func replaceSect(input string, settings InfinitySettings, includeSect bool) string {
	for key, value := range settings.SecureQueryFields {
		if includeSect {
			input = strings.ReplaceAll(input, fmt.Sprintf("${__qs.%s}", key), value)
		}
		if !includeSect {
			input = strings.ReplaceAll(input, fmt.Sprintf("${__qs.%s}", key), "xxxxxxxx")
		}
	}
	return input
}

func GetQueryURL(settings InfinitySettings, query Query, includeSect bool) (string, error) {
	urlString := query.URL
	if !strings.HasPrefix(query.URL, settings.URL) {
		urlString = settings.URL + urlString
	}
	urlString = replaceSect(urlString, settings, includeSect)
	u, err := url.Parse(urlString)
	if err != nil {
		return urlString, err
	}
	q := u.Query()
	for _, param := range query.URLOptions.Params {
		value := replaceSect(param.Value, settings, includeSect)
		q.Set(param.Key, value)
	}
	for key, value := range settings.SecureQueryFields {
		if includeSect {
			q.Set(key, value)
		}
		if !includeSect {
			q.Set(key, "xxxxxxxx")
		}
	}
	if settings.AuthenticationMethod == "apiKey" && settings.ApiKeyType == "query" {
		if includeSect {
			q.Set(settings.ApiKeyKey, settings.ApiKeyValue)
		}
		if !includeSect {
			q.Set(settings.ApiKeyKey, "xxxxxxxx")
		}
	}
	u.RawQuery = q.Encode()
	return u.String(), nil
}

func GetRequest(settings InfinitySettings, body io.Reader, query Query, requestHeaders map[string]string, includeSect bool) (req *http.Request, err error) {
	url, err := GetQueryURL(settings, query, includeSect)
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
		basicAuthHeader := fmt.Sprintf("Basic %s", "xxxxxxxx")
		if includeSect {
			basicAuthHeader = "Basic " + base64.StdEncoding.EncodeToString([]byte(settings.UserName+":"+settings.Password))
		}
		req.Header.Add("Authorization", basicAuthHeader)
	}
	if settings.AuthenticationMethod == "bearerToken" {
		bearerAuthHeader := fmt.Sprintf("Bearer %s", "xxxxxxxx")
		if includeSect {
			bearerAuthHeader = fmt.Sprintf("Bearer %s", settings.BearerToken)
		}
		req.Header.Add("Authorization", bearerAuthHeader)
	}
	if settings.AuthenticationMethod == "apiKey" && settings.ApiKeyType == "header" {
		apiKeyHeader := "xxxxxxxx"
		if includeSect {
			apiKeyHeader = settings.ApiKeyValue
		}
		req.Header.Add(settings.ApiKeyKey, apiKeyHeader)
	}
	if settings.ForwardOauthIdentity {
		authHeader := "xxxxxxxx"
		token := "xxxxxxxx"
		if includeSect {
			authHeader = requestHeaders["Authorization"]
			token = requestHeaders["X-ID-Token"]
		}
		req.Header.Add("Authorization", authHeader)
		if requestHeaders["X-ID-Token"] != "" {
			req.Header.Add("X-ID-Token", token)
		}
	}
	if query.Type == "json" || query.Type == "graphql" {
		req.Header.Set("Content-Type", "application/json")
	}
	for _, header := range query.URLOptions.Headers {
		value := "xxxxxxxx"
		if includeSect {
			value = replaceSect(header.Value, settings, includeSect)
		}
		req.Header.Set(header.Key, value)
	}
	for key, value := range settings.CustomHeaders {
		val := "xxxxxxxx"
		if includeSect {
			val = value
		}
		req.Header.Set(key, val)
	}
	return req, err
}

func (client *Client) req(url string, body *strings.Reader, settings InfinitySettings, isJSON bool, query Query, requestHeaders map[string]string) (obj interface{}, statusCode int, duration time.Duration, err error) {
	req, _ := GetRequest(settings, body, query, requestHeaders, true)
	startTime := time.Now()
	if !CanAllowURL(req.URL.String(), settings.AllowedHosts) {
		return nil, http.StatusUnauthorized, 0, errors.New("requested URL is not allowed. To allow this URL, update the datasource config URL -> Allowed Hosts section")
	}
	res, err := client.HttpClient.Do(req)
	duration = time.Since(startTime)
	if err != nil {
		return nil, res.StatusCode, duration, fmt.Errorf("error getting response from %s", url)
	}
	defer res.Body.Close()
	if res.StatusCode >= http.StatusBadRequest {
		return nil, res.StatusCode, duration, errors.New(res.Status)
	}
	bodyBytes, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, res.StatusCode, duration, err
	}
	if query.Type == "json" || query.Type == "graphql" {
		var out interface{}
		err := json.Unmarshal(bodyBytes, &out)
		return out, res.StatusCode, duration, err
	}
	if query.Type == "uql" || query.Type == "groq" {
		contentType := res.Header.Get("Content-type")
		if strings.Contains(strings.ToLower(contentType), "application/json") {
			var out interface{}
			err := json.Unmarshal(bodyBytes, &out)
			return out, res.StatusCode, duration, err
		}
	}
	return string(bodyBytes), res.StatusCode, duration, err
}

func (client *Client) GetResults(query Query, requestHeaders map[string]string) (o interface{}, statusCode int, duration time.Duration, err error) {
	isJSON := false
	if query.Type == "json" || query.Type == "graphql" {
		isJSON = true
	}
	switch query.URLOptions.Method {
	case "POST":
		body := GetQueryBody(query)
		return client.req(query.URL, body, client.Settings, isJSON, query, requestHeaders)
	default:
		return client.req(query.URL, nil, client.Settings, isJSON, query, requestHeaders)
	}
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

func GetQueryBody(query Query) *strings.Reader {
	body := strings.NewReader(query.URLOptions.Data)
	if query.Type == "graphql" {
		jsonData := map[string]string{
			"query": query.URLOptions.Data,
		}
		jsonValue, _ := json.Marshal(jsonData)
		body = strings.NewReader(string(jsonValue))
	}
	return body
}

func (client *Client) GetExecutedURL(query Query) string {
	req, err := GetRequest(client.Settings, GetQueryBody(query), query, map[string]string{}, false)
	if err != nil {
		return fmt.Sprintf("error retrieving full url. %s", query.URL)
	}
	command, err := http2curl.GetCurlCommand(req)
	if err != nil {
		return fmt.Sprintf("error retrieving full url. %s", query.URL)
	}
	return fmt.Sprintf(`## URL
%s

## Curl Command
%s`, req.URL.String(), command.String())
}
