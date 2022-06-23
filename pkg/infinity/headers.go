package infinity

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"mime/multipart"
	"net/http"
	"strings"

	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
)

const dummyHeader = "xxxxxxxx"

const (
	contentTypeJSON           = "application/json"
	contentTypeFormURLEncoded = "application/x-www-form-urlencoded"
)

const (
	headerKeyAccept        = "Accept"
	headerKeyContentType   = "Content-Type"
	headerKeyAuthorization = "Authorization"
	headerKeyIdToken       = "X-ID-Token"
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

func ApplyHeadersFromSettings(settings models.InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	for key, value := range settings.CustomHeaders {
		val := dummyHeader
		if includeSect {
			val = value
		}
		req.Header.Add(key, val)
		if strings.EqualFold(key, headerKeyAccept) || strings.EqualFold(key, headerKeyContentType) {
			req.Header.Set(key, val)
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
		req.Header.Add(header.Key, value)
		if strings.EqualFold(header.Key, headerKeyAccept) || strings.EqualFold(header.Key, headerKeyContentType) {
			req.Header.Set(header.Key, value)
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
		req.Header.Set(headerKeyAuthorization, basicAuthHeader)
	}
	return req
}

func ApplyBearerToken(settings models.InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if settings.AuthenticationMethod == models.AuthenticationMethodBearerToken {
		bearerAuthHeader := fmt.Sprintf("Bearer %s", dummyHeader)
		if includeSect {
			bearerAuthHeader = fmt.Sprintf("Bearer %s", settings.BearerToken)
		}
		req.Header.Add(headerKeyAuthorization, bearerAuthHeader)
	}
	return req
}

func ApplyApiKeyAuth(settings models.InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if settings.AuthenticationMethod == models.AuthenticationMethodApiKey && settings.ApiKeyType == models.ApiKeyTypeHeader {
		apiKeyHeader := dummyHeader
		if includeSect {
			apiKeyHeader = settings.ApiKeyValue
		}
		req.Header.Add(settings.ApiKeyKey, apiKeyHeader)
	}
	return req
}

func ApplyForwardedOAuthIdentity(requestHeaders map[string]string, settings models.InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if settings.ForwardOauthIdentity {
		authHeader := dummyHeader
		token := dummyHeader
		if includeSect {
			authHeader = requestHeaders[headerKeyAuthorization]
			token = requestHeaders[headerKeyIdToken]
		}
		req.Header.Add(headerKeyAuthorization, authHeader)
		if requestHeaders[headerKeyIdToken] != "" {
			req.Header.Add(headerKeyIdToken, token)
		}
	}
	return req
}
