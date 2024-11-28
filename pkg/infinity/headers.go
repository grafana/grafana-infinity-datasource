package infinity

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"mime/multipart"
	"net/http"
	"strings"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

const dummyHeader = "xxxxxxxx"

const (
	contentTypeJSON           = "application/json"
	contentTypeFormURLEncoded = "application/x-www-form-urlencoded"
)

const (
	headerKeyAccept        = "Accept"
	headerKeyContentType   = "Content-Type"
	HeaderKeyAuthorization = "Authorization"
	HeaderKeyIdToken       = "X-Id-Token"
)

func ApplyAcceptHeader(query models.Query, settings models.InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if query.Type == models.QueryTypeJSON || query.Type == models.QueryTypeGraphQL {
		req.Header.Set(headerKeyAccept, `application/json;q=0.9,text/plain`)
	}
	if query.Type == models.QueryTypeCSV {
		req.Header.Set(headerKeyAccept, `text/csv; charset=utf-8`)
	}
	if query.Type == models.QueryTypeXML {
		req.Header.Set(headerKeyAccept, `text/xml;q=0.9,text/plain`)
	}
	return req
}

func ApplyContentTypeHeader(query models.Query, settings models.InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if strings.ToUpper(query.URLOptions.Method) == http.MethodPost {
		switch query.URLOptions.BodyType {
		case "raw":
			if query.URLOptions.BodyContentType != "" {
				req.Header.Set(headerKeyContentType, query.URLOptions.BodyContentType)
			}
		case "form-data":
			writer := multipart.NewWriter(&bytes.Buffer{})
			for _, f := range query.URLOptions.BodyForm {
				_ = writer.WriteField(f.Key, f.Value)
			}
			if err := writer.Close(); err != nil {
				return req
			}
			req.Header.Set(headerKeyContentType, writer.FormDataContentType())
		case "x-www-form-urlencoded":
			req.Header.Set(headerKeyContentType, contentTypeFormURLEncoded)
		case "graphql":
			req.Header.Set(headerKeyContentType, contentTypeJSON)
		default:
			req.Header.Set(headerKeyContentType, contentTypeJSON)
		}
	}
	return req
}

func ApplyHeadersFromSettings(pCtx *backend.PluginContext, requestHeaders map[string]string, settings models.InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	for key, value := range settings.CustomHeaders {
		headerValue := dummyHeader
		if includeSect {
			headerValue = value
		}
		if pCtx != nil {
			headerValue = strings.ReplaceAll(headerValue, "${__org.id}", fmt.Sprintf("%d", pCtx.OrgID))
			headerValue = strings.ReplaceAll(headerValue, "${__plugin.id}", pCtx.PluginID)
			headerValue = strings.ReplaceAll(headerValue, "${__plugin.version}", pCtx.PluginVersion)
			if pCtx.DataSourceInstanceSettings != nil {
				headerValue = strings.ReplaceAll(headerValue, "${__ds.uid}", pCtx.DataSourceInstanceSettings.UID)
				headerValue = strings.ReplaceAll(headerValue, "${__ds.name}", pCtx.DataSourceInstanceSettings.Name)
				headerValue = strings.ReplaceAll(headerValue, "${__ds.id}", fmt.Sprintf("%d", pCtx.DataSourceInstanceSettings.ID))
			}
			if pCtx.User != nil {
				headerValue = strings.ReplaceAll(headerValue, "${__user.login}", pCtx.User.Login)
				headerValue = strings.ReplaceAll(headerValue, "${__user.email}", pCtx.User.Email)
				headerValue = strings.ReplaceAll(headerValue, "${__user.name}", pCtx.User.Name)
				// headerValue = strings.ReplaceAll(headerValue, "${__user.role}", pCtx.User.Role)
			}
		}
		if key != "" {
			req.Header.Set(key, headerValue)
		}
	}
	return req
}

func ApplyHeadersFromQuery(query models.Query, settings models.InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	for _, header := range query.URLOptions.Headers {
		value := dummyHeader
		if includeSect {
			value = replaceSect(header.Value, settings, includeSect)
		}
		if header.Key != "" {
			req.Header.Add(header.Key, value)
			if strings.EqualFold(header.Key, headerKeyAccept) || strings.EqualFold(header.Key, headerKeyContentType) {
				req.Header.Set(header.Key, value)
			}
		}
	}
	return req
}

func ApplyBasicAuth(settings models.InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if settings.BasicAuthEnabled && (settings.UserName != "" || settings.Password != "") {
		basicAuthHeader := fmt.Sprintf("Basic %s", dummyHeader)
		if includeSect {
			basicAuthHeader = "Basic " + base64.StdEncoding.EncodeToString([]byte(settings.UserName+":"+settings.Password))
		}
		req.Header.Set(HeaderKeyAuthorization, basicAuthHeader)
	}
	return req
}

func ApplyBearerToken(settings models.InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if settings.AuthenticationMethod == models.AuthenticationMethodBearerToken {
		bearerAuthHeader := fmt.Sprintf("Bearer %s", dummyHeader)
		if includeSect {
			bearerAuthHeader = fmt.Sprintf("Bearer %s", settings.BearerToken)
		}
		req.Header.Add(HeaderKeyAuthorization, bearerAuthHeader)
	}
	return req
}

func ApplyApiKeyAuth(settings models.InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if settings.AuthenticationMethod == models.AuthenticationMethodApiKey && settings.ApiKeyType == models.ApiKeyTypeHeader {
		apiKeyHeader := dummyHeader
		if includeSect {
			apiKeyHeader = settings.ApiKeyValue
		}
		if settings.ApiKeyKey != "" {
			req.Header.Add(settings.ApiKeyKey, apiKeyHeader)
		}
	}
	return req
}

func ApplyForwardedOAuthIdentity(requestHeaders map[string]string, settings models.InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if settings.ForwardOauthIdentity {
		authHeader := dummyHeader
		token := dummyHeader
		if includeSect {
			authHeader = getQueryReqHeader(requestHeaders, HeaderKeyAuthorization)
			token = getQueryReqHeader(requestHeaders, HeaderKeyIdToken)
		}
		req.Header.Add(HeaderKeyAuthorization, authHeader)
		if token != "" && token != dummyHeader {
			req.Header.Add(HeaderKeyIdToken, token)
		}
	}
	return req
}

func getQueryReqHeader(requestHeaders map[string]string, headerName string) string {
	for name, value := range requestHeaders {
		if strings.EqualFold(headerName, name) {
			return value
		}
	}

	return ""
}
