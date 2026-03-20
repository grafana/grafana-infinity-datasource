package models

import "strings"

// SensitiveHeaders is the list of HTTP headers that users must not override
// via custom header configuration. These are transport-level or hop-by-hop
// headers whose values are controlled by the HTTP stack; allowing arbitrary
// values could lead to request-smuggling or other abuse.
var SensitiveHeaders = []string{
	"Content-Length",
	"Host",
	"Transfer-Encoding",
	"Connection",
	"Keep-Alive",
	"Upgrade",
	"Proxy-Authorization",
	"Proxy-Connection",
	"Te",
	"Trailer",
	"Proxy-Authenticate",
	"Www-Authenticate",
	"Http2-Settings",
	"Alternate-Protocol",
	"Alt-Svc",
	"X-Forwarded-For",
	"X-Forwarded-Host",
	"X-Forwarded-Proto",
	"Forwarded",
	"Via",
	"Expect",
}

// IsSensitiveHeader returns true when headerKey matches a header that must
// not be set by users through custom header configuration. The comparison
// is case-insensitive and leading/trailing whitespace is trimmed.
func IsSensitiveHeader(headerKey string) bool {
	trimmed := strings.TrimSpace(headerKey)
	for _, h := range SensitiveHeaders {
		if strings.EqualFold(trimmed, h) {
			return true
		}
	}
	return false
}
