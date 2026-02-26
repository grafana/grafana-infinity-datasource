package infinity

import (
	"context"
	"net/http"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// RequestModifier defines the contract for applying modifications to an HTTP request.
// Each auth strategy and header configuration implements this interface,
// enabling the request-building chain to be extended without modifying core logic.
type RequestModifier interface {
	// Modify applies changes to the HTTP request (e.g., setting auth headers).
	Modify(ctx context.Context, req *http.Request) *http.Request

	// Name returns a human-readable identifier for this modifier (used in logging/tracing).
	Name() string
}

// RequestModifierChain applies an ordered sequence of request modifiers.
type RequestModifierChain struct {
	modifiers []RequestModifier
}

// Apply executes all modifiers in order on the given request.
func (c *RequestModifierChain) Apply(ctx context.Context, req *http.Request) *http.Request {
	for _, m := range c.modifiers {
		req = m.Modify(ctx, req)
	}
	return req
}

// BuildRequestModifierChain creates a modifier chain matching the existing request-building logic.
// This preserves the exact order and behavior of the original sequential calls in GetRequest.
func BuildRequestModifierChain(ctx context.Context, query models.Query, settings models.InfinitySettings, requestHeaders map[string]string, pCtx *backend.PluginContext, includeSect bool) *RequestModifierChain {
	return &RequestModifierChain{
		modifiers: []RequestModifier{
			&AcceptHeaderModifier{Query: query, Settings: settings, IncludeSect: includeSect},
			&ContentTypeModifier{Query: query, Settings: settings, IncludeSect: includeSect},
			&AcceptEncodingModifier{Query: query, Settings: settings, IncludeSect: includeSect},
			&SettingsHeaderModifier{PCtx: pCtx, RequestHeaders: requestHeaders, Settings: settings, IncludeSect: includeSect},
			&QueryHeaderModifier{Query: query, Settings: settings, IncludeSect: includeSect},
			&BasicAuthModifier{Settings: settings, IncludeSect: includeSect},
			&BearerTokenModifier{Settings: settings, IncludeSect: includeSect},
			&ApiKeyAuthModifier{Settings: settings, IncludeSect: includeSect},
			&ForwardedOAuthModifier{RequestHeaders: requestHeaders, Settings: settings, IncludeSect: includeSect},
			&TraceModifier{},
			&ForwardedCookiesModifier{Settings: settings, RequestHeaders: requestHeaders},
		},
	}
}

// AcceptHeaderModifier sets the Accept header based on query type.
type AcceptHeaderModifier struct {
	Query       models.Query
	Settings    models.InfinitySettings
	IncludeSect bool
}

func (m *AcceptHeaderModifier) Name() string { return "AcceptHeader" }
func (m *AcceptHeaderModifier) Modify(ctx context.Context, req *http.Request) *http.Request {
	return ApplyAcceptHeader(ctx, m.Query, m.Settings, req, m.IncludeSect)
}

// ContentTypeModifier sets the Content-Type header based on query body type.
type ContentTypeModifier struct {
	Query       models.Query
	Settings    models.InfinitySettings
	IncludeSect bool
}

func (m *ContentTypeModifier) Name() string { return "ContentType" }
func (m *ContentTypeModifier) Modify(ctx context.Context, req *http.Request) *http.Request {
	return ApplyContentTypeHeader(ctx, m.Query, m.Settings, req, m.IncludeSect)
}

// AcceptEncodingModifier sets the Accept-Encoding header (gzip).
type AcceptEncodingModifier struct {
	Query       models.Query
	Settings    models.InfinitySettings
	IncludeSect bool
}

func (m *AcceptEncodingModifier) Name() string { return "AcceptEncoding" }
func (m *AcceptEncodingModifier) Modify(ctx context.Context, req *http.Request) *http.Request {
	return ApplyAcceptEncodingHeader(ctx, m.Query, m.Settings, req, m.IncludeSect)
}

// SettingsHeaderModifier applies custom headers from datasource settings.
type SettingsHeaderModifier struct {
	PCtx           *backend.PluginContext
	RequestHeaders map[string]string
	Settings       models.InfinitySettings
	IncludeSect    bool
}

func (m *SettingsHeaderModifier) Name() string { return "SettingsHeaders" }
func (m *SettingsHeaderModifier) Modify(ctx context.Context, req *http.Request) *http.Request {
	return ApplyHeadersFromSettings(ctx, m.PCtx, m.RequestHeaders, m.Settings, req, m.IncludeSect)
}

// QueryHeaderModifier applies headers specified in the query.
type QueryHeaderModifier struct {
	Query       models.Query
	Settings    models.InfinitySettings
	IncludeSect bool
}

func (m *QueryHeaderModifier) Name() string { return "QueryHeaders" }
func (m *QueryHeaderModifier) Modify(ctx context.Context, req *http.Request) *http.Request {
	return ApplyHeadersFromQuery(ctx, m.Query, m.Settings, req, m.IncludeSect)
}

// BasicAuthModifier applies HTTP Basic Authentication.
type BasicAuthModifier struct {
	Settings    models.InfinitySettings
	IncludeSect bool
}

func (m *BasicAuthModifier) Name() string { return "BasicAuth" }
func (m *BasicAuthModifier) Modify(ctx context.Context, req *http.Request) *http.Request {
	return ApplyBasicAuth(ctx, m.Settings, req, m.IncludeSect)
}

// BearerTokenModifier applies Bearer token authentication.
type BearerTokenModifier struct {
	Settings    models.InfinitySettings
	IncludeSect bool
}

func (m *BearerTokenModifier) Name() string { return "BearerToken" }
func (m *BearerTokenModifier) Modify(ctx context.Context, req *http.Request) *http.Request {
	return ApplyBearerToken(ctx, m.Settings, req, m.IncludeSect)
}

// ApiKeyAuthModifier applies API key authentication.
type ApiKeyAuthModifier struct {
	Settings    models.InfinitySettings
	IncludeSect bool
}

func (m *ApiKeyAuthModifier) Name() string { return "ApiKeyAuth" }
func (m *ApiKeyAuthModifier) Modify(ctx context.Context, req *http.Request) *http.Request {
	return ApplyApiKeyAuth(ctx, m.Settings, req, m.IncludeSect)
}

// ForwardedOAuthModifier forwards OAuth identity headers.
type ForwardedOAuthModifier struct {
	RequestHeaders map[string]string
	Settings       models.InfinitySettings
	IncludeSect    bool
}

func (m *ForwardedOAuthModifier) Name() string { return "ForwardedOAuth" }
func (m *ForwardedOAuthModifier) Modify(ctx context.Context, req *http.Request) *http.Request {
	return ApplyForwardedOAuthIdentity(ctx, m.RequestHeaders, m.Settings, req, m.IncludeSect)
}

// TraceModifier injects OpenTelemetry trace propagation headers.
type TraceModifier struct{}

func (m *TraceModifier) Name() string { return "Trace" }
func (m *TraceModifier) Modify(ctx context.Context, req *http.Request) *http.Request {
	return ApplyTraceHead(ctx, req)
}

// ForwardedCookiesModifier forwards specified cookies from the original request.
type ForwardedCookiesModifier struct {
	Settings       models.InfinitySettings
	RequestHeaders map[string]string
}

func (m *ForwardedCookiesModifier) Name() string { return "ForwardedCookies" }
func (m *ForwardedCookiesModifier) Modify(ctx context.Context, req *http.Request) *http.Request {
	return ApplyForwardedCookies(ctx, m.Settings, req, m.RequestHeaders)
}
