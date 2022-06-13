package infinity

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"moul.io/http2curl"

	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
)

func GetRequest(settings models.InfinitySettings, body io.Reader, query models.Query, requestHeaders map[string]string, includeSect bool) (req *http.Request, err error) {
	url, err := GetQueryURL(settings, query, includeSect)
	if err != nil {
		return nil, err
	}
	switch strings.ToUpper(query.URLOptions.Method) {
	case http.MethodPost:
		req, err = http.NewRequest(http.MethodPost, url, body)
	default:
		req, err = http.NewRequest(http.MethodGet, url, nil)
	}
	req = ApplyAcceptHeader(query, settings, req, includeSect)
	req = ApplyContentTypeHeader(query, settings, req, includeSect)
	req = ApplyHeadersFromSettings(settings, req, includeSect)
	req = ApplyHeadersFromQuery(query, settings, req, includeSect)
	req = ApplyBasicAuth(settings, req, includeSect)
	req = ApplyBearerToken(settings, req, includeSect)
	req = ApplyApiKeyAuth(settings, req, includeSect)
	req = ApplyForwardedOAuthIdentity(requestHeaders, settings, req, includeSect)
	return req, err
}

func GetQueryURL(settings models.InfinitySettings, query models.Query, includeSect bool) (string, error) {
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
		q.Add(param.Key, value)
	}
	for key, value := range settings.SecureQueryFields {
		val := dummyHeader
		if includeSect {
			val = value
		}
		q.Set(key, val)
	}
	if settings.AuthenticationMethod == models.AuthenticationMethodApiKey && settings.ApiKeyType == models.ApiKeyTypeQuery {
		val := dummyHeader
		if includeSect {
			val = settings.ApiKeyValue
		}
		q.Set(settings.ApiKeyKey, val)
	}
	u.RawQuery = q.Encode()
	return u.String(), nil
}

func (client *Client) GetExecutedURL(query models.Query) string {
	out := []string{}
	if query.Source != "inline" {
		req, err := GetRequest(client.Settings, GetQueryBody(query), query, map[string]string{}, false)
		if err != nil {
			return fmt.Sprintf("error retrieving full url. %s", query.URL)
		}
		command, err := http2curl.GetCurlCommand(req)
		if err != nil {
			return fmt.Sprintf("error retrieving full url. %s", query.URL)
		}
		out = append(out, "###############", "## URL", "###############", "", req.URL.String(), "")
		out = append(out, "###############", "## Curl Command", "###############", "", command.String())
	}
	if query.Type == models.QueryTypeUQL {
		out = append(out, "", "###############", "## UQL", "###############", "", query.UQL)
	}
	if query.Type == models.QueryTypeGROQ {
		out = append(out, "###############", "## GROQ", "###############", "", query.GROQ, "")
	}
	return strings.Join(out, "\n")
}
