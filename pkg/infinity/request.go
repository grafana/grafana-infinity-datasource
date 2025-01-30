package infinity

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"moul.io/http2curl"
)

func GetRequest(ctx context.Context, pCtx *backend.PluginContext, settings models.InfinitySettings, body io.Reader, query models.Query, requestHeaders map[string]string, includeSect bool) (req *http.Request, err error) {
	ctx, span := tracing.DefaultTracer().Start(ctx, "GetRequest")
	defer span.End()
	url, err := GetQueryURL(ctx, pCtx, settings, query, includeSect)
	if err != nil {
		return nil, err
	}
	switch strings.ToUpper(query.URLOptions.Method) {
	case http.MethodPost:
		req, err = http.NewRequestWithContext(ctx, http.MethodPost, url, body)
	default:
		req, err = http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	}
	req = ApplyAcceptHeader(ctx, query, settings, req, includeSect)
	req = ApplyContentTypeHeader(ctx, query, settings, req, includeSect)
	req = ApplyAcceptEncodingHeader(ctx, query, settings, req, includeSect)
	req = ApplyHeadersFromSettings(ctx, pCtx, requestHeaders, settings, req, includeSect)
	req = ApplyHeadersFromQuery(ctx, query, settings, req, includeSect)
	req = ApplyBasicAuth(ctx, settings, req, includeSect)
	req = ApplyBearerToken(ctx, settings, req, includeSect)
	req = ApplyApiKeyAuth(ctx, settings, req, includeSect)
	req = ApplyForwardedOAuthIdentity(ctx, requestHeaders, settings, req, includeSect)
	req = ApplyTraceHead(ctx, req)
	return req, err
}

func GetQueryURL(ctx context.Context, pCtx *backend.PluginContext, settings models.InfinitySettings, query models.Query, includeSect bool) (string, error) {
	_, span := tracing.DefaultTracer().Start(ctx, "GetQueryURL")
	defer span.End()
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
		val = interpolateGrafanaMetaDataMacros(val, pCtx)
		q.Set(key, val)
	}
	if settings.AuthenticationMethod == models.AuthenticationMethodApiKey && settings.ApiKeyType == models.ApiKeyTypeQuery {
		val := dummyHeader
		if includeSect {
			val = settings.ApiKeyValue
		}
		q.Set(settings.ApiKeyKey, val)
	}
	if settings.PathEncodedURLsEnabled {
		customEncoder := strings.NewReplacer("+", "%20")
		u.RawQuery = customEncoder.Replace(q.Encode())
	} else {
		u.RawQuery = q.Encode()
	}
	return NormalizeURL(u.String()), nil
}

func NormalizeURL(u string) string {
	urlArray := strings.Split(u, "/")
	if strings.HasPrefix(u, "https://github.com") && len(urlArray) > 5 && urlArray[5] == "blob" && urlArray[4] != "blob" && urlArray[3] != "blob" {
		u = strings.Replace(u, "https://github.com", "https://raw.githubusercontent.com", 1)
		u = strings.Replace(u, "/blob/", "/", 1)
	}
	if strings.HasPrefix(u, "https://gitlab.com") && !strings.HasPrefix(u, "https://gitlab.com/api") && len(urlArray) > 5 && urlArray[6] == "blob" {
		u = strings.Replace(u, "/blob/", "/raw/", 1)
	}
	if strings.HasPrefix(u, "https://bitbucket.org") && len(urlArray) > 4 && urlArray[5] == "src" {
		u = strings.Replace(u, "/src/", "/raw/", 1)
	}
	return u
}

func (client *Client) GetExecutedURL(ctx context.Context, query models.Query) string {
	out := []string{}
	if query.Source != "inline" && query.Source != "azure-blob" {
		req, err := GetRequest(ctx, nil, client.Settings, GetQueryBody(ctx, query), query, map[string]string{}, false)
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
	if client.Settings.AuthenticationMethod == models.AuthenticationMethodAzureBlob {
		out = append(out, "###############", "> Authentication steps not included for azure blob authentication")
	}
	return strings.Join(out, "\n")
}

func interpolateGrafanaMetaDataMacros(value string, pCtx *backend.PluginContext) string {
	if pCtx != nil {
		value = strings.ReplaceAll(value, "${__org.id}", fmt.Sprintf("%d", pCtx.OrgID))
		value = strings.ReplaceAll(value, "${__plugin.id}", pCtx.PluginID)
		value = strings.ReplaceAll(value, "${__plugin.version}", pCtx.PluginVersion)
		if pCtx.DataSourceInstanceSettings != nil {
			value = strings.ReplaceAll(value, "${__ds.uid}", pCtx.DataSourceInstanceSettings.UID)
			value = strings.ReplaceAll(value, "${__ds.name}", pCtx.DataSourceInstanceSettings.Name)
			value = strings.ReplaceAll(value, "${__ds.id}", fmt.Sprintf("%d", pCtx.DataSourceInstanceSettings.ID))
		}
		if pCtx.User != nil {
			value = strings.ReplaceAll(value, "${__user.login}", pCtx.User.Login)
			value = strings.ReplaceAll(value, "${__user.email}", pCtx.User.Email)
			value = strings.ReplaceAll(value, "${__user.name}", pCtx.User.Name)
		}
	}
	return value
}
