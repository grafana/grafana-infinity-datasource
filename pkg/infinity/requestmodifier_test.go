package infinity

import (
	"context"
	"net/http"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/require"
)

func TestRequestModifierChain_Apply(t *testing.T) {
	t.Run("applies all modifiers in order", func(t *testing.T) {
		order := []string{}
		chain := &RequestModifierChain{
			modifiers: []RequestModifier{
				&testModifier{name: "first", applyFn: func(req *http.Request) *http.Request {
					order = append(order, "first")
					req.Header.Set("X-First", "1")
					return req
				}},
				&testModifier{name: "second", applyFn: func(req *http.Request) *http.Request {
					order = append(order, "second")
					req.Header.Set("X-Second", "2")
					return req
				}},
				&testModifier{name: "third", applyFn: func(req *http.Request) *http.Request {
					order = append(order, "third")
					req.Header.Set("X-Third", "3")
					return req
				}},
			},
		}

		req, _ := http.NewRequest("GET", "http://example.com", nil)
		result := chain.Apply(context.Background(), req)

		require.Equal(t, []string{"first", "second", "third"}, order)
		require.Equal(t, "1", result.Header.Get("X-First"))
		require.Equal(t, "2", result.Header.Get("X-Second"))
		require.Equal(t, "3", result.Header.Get("X-Third"))
	})

	t.Run("empty chain returns request unchanged", func(t *testing.T) {
		chain := &RequestModifierChain{modifiers: []RequestModifier{}}
		req, _ := http.NewRequest("GET", "http://example.com", nil)
		result := chain.Apply(context.Background(), req)
		require.Equal(t, req, result)
	})
}

func TestBuildRequestModifierChain(t *testing.T) {
	chain := BuildRequestModifierChain(
		context.Background(),
		models.Query{Type: models.QueryTypeJSON},
		models.InfinitySettings{},
		map[string]string{},
		nil,
		true,
	)

	require.NotNil(t, chain)
	require.Equal(t, 11, len(chain.modifiers))

	expectedNames := []string{
		"AcceptHeader",
		"ContentType",
		"AcceptEncoding",
		"SettingsHeaders",
		"QueryHeaders",
		"BasicAuth",
		"BearerToken",
		"ApiKeyAuth",
		"ForwardedOAuth",
		"Trace",
		"ForwardedCookies",
	}
	for i, m := range chain.modifiers {
		require.Equal(t, expectedNames[i], m.Name(), "modifier at index %d", i)
	}
}

func TestRequestModifierNames(t *testing.T) {
	tests := []struct {
		modifier RequestModifier
		expected string
	}{
		{&AcceptHeaderModifier{}, "AcceptHeader"},
		{&ContentTypeModifier{}, "ContentType"},
		{&AcceptEncodingModifier{}, "AcceptEncoding"},
		{&SettingsHeaderModifier{}, "SettingsHeaders"},
		{&QueryHeaderModifier{}, "QueryHeaders"},
		{&BasicAuthModifier{}, "BasicAuth"},
		{&BearerTokenModifier{}, "BearerToken"},
		{&ApiKeyAuthModifier{}, "ApiKeyAuth"},
		{&ForwardedOAuthModifier{}, "ForwardedOAuth"},
		{&TraceModifier{}, "Trace"},
		{&ForwardedCookiesModifier{}, "ForwardedCookies"},
	}

	for _, tt := range tests {
		t.Run(tt.expected, func(t *testing.T) {
			require.Equal(t, tt.expected, tt.modifier.Name())
		})
	}
}

func TestBearerTokenModifier_Modify(t *testing.T) {
	modifier := &BearerTokenModifier{
		Settings: models.InfinitySettings{
			AuthenticationMethod: models.AuthenticationMethodBearerToken,
			BearerToken:          "test-token-123",
		},
		IncludeSect: true,
	}

	req, _ := http.NewRequest("GET", "http://example.com", nil)
	result := modifier.Modify(context.Background(), req)
	require.Equal(t, "Bearer test-token-123", result.Header.Get("Authorization"))
}

func TestBasicAuthModifier_Modify(t *testing.T) {
	modifier := &BasicAuthModifier{
		Settings: models.InfinitySettings{
			BasicAuthEnabled: true,
			UserName:         "user",
			Password:         "pass",
		},
		IncludeSect: true,
	}

	req, _ := http.NewRequest("GET", "http://example.com", nil)
	result := modifier.Modify(context.Background(), req)
	require.Contains(t, result.Header.Get("Authorization"), "Basic ")
}

func TestApiKeyAuthModifier_Modify(t *testing.T) {
	modifier := &ApiKeyAuthModifier{
		Settings: models.InfinitySettings{
			AuthenticationMethod: models.AuthenticationMethodApiKey,
			ApiKeyType:           models.ApiKeyTypeHeader,
			ApiKeyKey:            "X-API-Key",
			ApiKeyValue:          "secret-key-123",
		},
		IncludeSect: true,
	}

	req, _ := http.NewRequest("GET", "http://example.com", nil)
	result := modifier.Modify(context.Background(), req)
	require.Equal(t, "secret-key-123", result.Header.Get("X-API-Key"))
}

// testModifier is a helper for testing the chain mechanism
type testModifier struct {
	name    string
	applyFn func(req *http.Request) *http.Request
}

func (m *testModifier) Name() string { return m.name }
func (m *testModifier) Modify(_ context.Context, req *http.Request) *http.Request {
	return m.applyFn(req)
}
