package infinity

import (
	"encoding/base64"
	"fmt"
	"net/http"
)

const dummyHeader = "xxxxxxxx"
const authorizationHeaderKey = "Authorization"
const idTokenHeaderKey = "X-ID-Token"
const contentTypeHeaderKey = "Content-Type"
const contentTypeJSON = "application/json"

func ApplyBasicAuth(settings InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if settings.BasicAuthEnabled && (settings.UserName != "" || settings.Password != "") {
		basicAuthHeader := fmt.Sprintf("Basic %s", dummyHeader)
		if includeSect {
			basicAuthHeader = "Basic " + base64.StdEncoding.EncodeToString([]byte(settings.UserName+":"+settings.Password))
		}
		req.Header.Set(authorizationHeaderKey, basicAuthHeader)
	}
	return req
}

func ApplyBearerToken(settings InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if settings.AuthenticationMethod == AuthenticationMethodBearerToken {
		bearerAuthHeader := fmt.Sprintf("Bearer %s", dummyHeader)
		if includeSect {
			bearerAuthHeader = fmt.Sprintf("Bearer %s", settings.BearerToken)
		}
		req.Header.Add(authorizationHeaderKey, bearerAuthHeader)
	}
	return req
}

func ApplyApiKeyAuth(settings InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if settings.AuthenticationMethod == AuthenticationMethodApiKey && settings.ApiKeyType == ApiKeyTypeHeader {
		apiKeyHeader := dummyHeader
		if includeSect {
			apiKeyHeader = settings.ApiKeyValue
		}
		req.Header.Add(settings.ApiKeyKey, apiKeyHeader)
	}
	return req
}

func ApplyForwardedOAuthIdentity(requestHeaders map[string]string, settings InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if settings.ForwardOauthIdentity {
		authHeader := dummyHeader
		token := dummyHeader
		if includeSect {
			authHeader = requestHeaders[authorizationHeaderKey]
			token = requestHeaders[idTokenHeaderKey]
		}
		req.Header.Add(authorizationHeaderKey, authHeader)
		if requestHeaders[idTokenHeaderKey] != "" {
			req.Header.Add(idTokenHeaderKey, token)
		}
	}
	return req
}

func ApplyContentType(query Query, settings InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	if query.Type == QueryTypeJSON || query.Type == QueryTypeGraphQL {
		req.Header.Set(contentTypeHeaderKey, contentTypeJSON)
	}
	return req
}

func ApplyQueryHeader(query Query, settings InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	for _, header := range query.URLOptions.Headers {
		value := dummyHeader
		if includeSect {
			value = replaceSect(header.Value, settings, includeSect)
		}
		req.Header.Set(header.Key, value)
	}
	return req
}

func ApplySettingHeaders(settings InfinitySettings, req *http.Request, includeSect bool) *http.Request {
	for key, value := range settings.CustomHeaders {
		val := dummyHeader
		if includeSect {
			val = value
		}
		req.Header.Set(key, val)
	}
	return req
}
