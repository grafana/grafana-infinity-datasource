package infinity

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
)

func (client *Client) GetResults(query InfinityQuery) (o interface{}, err error) {
	isJSON := false
	if query.Type == "json" || query.Type == "graphql" {
		isJSON = true
	}
	switch strings.ToLower(query.URLOptions.Method) {
	case "post":
		body := strings.NewReader(query.URLOptions.Data)
		if query.Type == "graphql" {
			jsonData := map[string]string{
				"query": query.URLOptions.Data,
			}
			jsonValue, _ := json.Marshal(jsonData)
			body = strings.NewReader(string(jsonValue))
		}
		return client.req(query.URL, body, client.Config, isJSON, query)
	default:
		return client.req(query.URL, nil, client.Config, isJSON, query)
	}
}

func (client *Client) req(url string, body *strings.Reader, settings InfinityConfig, isJSON bool, query InfinityQuery) (obj interface{}, err error) {
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

func getRequest(settings InfinityConfig, body io.Reader, query InfinityQuery) (req *http.Request, err error) {
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
		value := ReplaceQueryStringSecret(header.Value, settings)
		req.Header.Set(header.Key, value)
	}
	for key, value := range settings.CustomHeaders {
		req.Header.Set(key, value)
	}
	return req, err
}

func GetQueryURL(settings InfinityConfig, query InfinityQuery) (string, error) {
	urlString := query.URL
	if !strings.HasPrefix(query.URL, settings.URL) {
		urlString = settings.URL + urlString
	}
	urlString = ReplaceQueryStringSecret(urlString, settings)
	u, err := url.Parse(urlString)
	if err != nil {
		return urlString, nil
	}
	q := u.Query()
	for _, param := range query.URLOptions.Params {
		value := ReplaceQueryStringSecret(param.Value, settings)
		q.Set(param.Key, value)
	}
	u.RawQuery = q.Encode()
	return u.String(), nil
}

func ReplaceQueryStringSecret(input string, settings InfinityConfig) string {
	for key, value := range settings.SecureQueryFields {
		input = strings.ReplaceAll(input, fmt.Sprintf("${__qs.%s}", key), value)
	}
	return input
}
