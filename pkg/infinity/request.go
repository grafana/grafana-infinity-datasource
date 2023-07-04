package infinity

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
	"moul.io/http2curl"
)

func GetRequest(ctx context.Context, settings models.InfinitySettings, body io.Reader, query models.Query, requestHeaders map[string]string, includeSect bool) (req *http.Request, err error) {
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
	return NormalizeURL(u.String()), nil
}

func NormalizeURL(u string) string {
	urlArray := strings.Split(u, "/")
	if strings.HasPrefix(u, "https://github.com") && len(urlArray) > 5 && urlArray[5] == "blob" && urlArray[4] != "blob" && urlArray[3] != "blob" {
		u = strings.Replace(u, "https://github.com", "https://raw.githubusercontent.com", 1)
		u = strings.Replace(u, "/blob/", "/", 1)
	}
	if strings.HasPrefix(u, "https://gitlab.com") && len(urlArray) > 5 && urlArray[6] == "blob" && urlArray[5] != "blob" && urlArray[4] != "blob" && urlArray[3] != "blob" {
		u = strings.Replace(u, "/blob/", "/raw/", 1)
	}
	return u
}

func (client *Client) GetExecutedURL(ctx context.Context, query models.Query) string {
	out := []string{}
	if query.Source != "inline" {
		req, err := GetRequest(ctx, client.Settings, GetQueryBody(query), query, map[string]string{}, false)
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
	if query.Type == models.QueryTypeUQL || query.Parser == "uql" {
		out = append(out, "", "###############", "## UQL", "###############", "", query.UQL)
	}
	if query.Type == models.QueryTypeGROQ || query.Parser == "groq" {
		out = append(out, "###############", "## GROQ", "###############", "", query.GROQ, "")
	}
	if client.Settings.AuthenticationMethod == models.AuthenticationMethodOAuth {
		out = append(out, "###############", "> Authentication steps not included for OAuth authentication")
	}
	if client.Settings.AuthenticationMethod == models.AuthenticationMethodAWS {
		out = append(out, "###############", "> Authentication steps not included for AWS authentication")
	}
	return strings.Join(out, "\n")
}
