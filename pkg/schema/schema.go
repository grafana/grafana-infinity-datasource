// Package pluginschema defines the static configuration (settings) schema for the
// Infinity data source.
//
// The single source of truth is dsconfig.json — a declarative
// dsconfig DatasourceConfigSchema describing every config field, its storage
// location (root / jsonData / secureJsonData), type, and validation. NewSchema
// converts it (via pkg/dsconfig.ToSettings) into the grafana-plugin-sdk-go
// pluginschema.PluginSchema bundle. The generated artifact at
// pkg/pluginschema/apiserver.schema.json is produced from NewSchema via
// `go generate ./pkg/pluginschema`, then copied by the webpack build into
// dist/schema/v0alpha1.json — the {apiVersion}.json name Grafana's data source
// API server loads. schema_test.go asserts the committed artifact has not drifted
// from NewSchema. It lives alongside the dsconfig single source of truth
// (dsconfig.json, joined later by query.schema.json etc.); the webpack
// build ships both into dist/schema.
package schema

import (
	_ "embed"
	"encoding/json"
	"fmt"

	"k8s.io/kube-openapi/pkg/spec3"

	sdkschema "github.com/grafana/grafana-plugin-sdk-go/experimental/pluginschema"

	"github.com/grafana/grafana-infinity-datasource/pkg/dsconfig"
)

// TargetAPIVersion is the API version this schema applies to.
const TargetAPIVersion = "v0alpha1"

// configSchemaJSON is the declarative dsconfig schema — the single source of truth
// for the Infinity data source configuration.
//
//go:embed dsconfig.json
var configSchemaJSON []byte

// OutputPath is the location of the generated SDK PluginSchema bundle (settings,
// examples, and later query types/routes), relative to this package directory
// (where `go generate` and `go test` run). The webpack build copies it into
// dist/schema as {TargetAPIVersion}.json — the name Grafana's data source API
// server loads via fs.Sub(rootfs, "schema") + provider.Get(apiVersion).
//
// Regenerate it from NewSchema with: go generate ./pkg/pluginschema
//
//go:generate go run ./internal/gen
var OutputPath = "apiserver.schema.json"

// ConfigSchema parses and returns the declarative dsconfig schema (single source
// of truth) for the Infinity data source.
func ConfigSchema() (*dsconfig.DatasourceConfigSchema, error) {
	var s dsconfig.DatasourceConfigSchema
	if err := json.Unmarshal(configSchemaJSON, &s); err != nil {
		return nil, fmt.Errorf("parse dsconfig.json: %w", err)
	}
	return &s, nil
}

// NewSchema returns the full plugin schema for the Infinity data source. The
// settings (configuration) schema is derived from the dsconfig single source of
// truth via the reusable dsconfig→SDK glue; example configurations are
// Infinity-specific and defined alongside.
func NewSchema() *sdkschema.PluginSchema {
	cfg, err := ConfigSchema()
	if err == nil {
		var schema *sdkschema.PluginSchema
		schema, err = cfg.NewPluginSchema(TargetAPIVersion, newSettingsExamples())
		if err == nil {
			return schema
		}
	}
	// The schema is embedded and converted at build/test time; a failure here is a
	// developer error that must surface loudly.
	panic(err)
}

// Marshal renders the schema to the canonical JSON encoding used for both
// generation and drift detection, so the generator and the test never disagree.
func Marshal() ([]byte, error) {
	return dsconfig.MarshalPluginSchema(NewSchema())
}

// newSettingsExamples returns example configurations for the data source, mirroring
// the provisioning examples documented for the plugin. Each example value is a full
// settings object: the plugin configuration is nested under `jsonData`.
func newSettingsExamples() *sdkschema.SettingsExamples {
	return &sdkschema.SettingsExamples{
		Examples: map[string]*spec3.Example{
			"none": {
				ExampleProps: spec3.ExampleProps{
					Summary:     "No authentication",
					Description: "Public endpoint, no authentication.",
					Value: map[string]any{
						"jsonData": map[string]any{
							"auth_method": "none",
						},
					},
				},
			},
			"bearerToken": {
				ExampleProps: spec3.ExampleProps{
					Summary:     "Bearer token",
					Description: "Bearer token authentication with an allowed host.",
					Value: map[string]any{
						"jsonData": map[string]any{
							"auth_method":  "bearerToken",
							"allowedHosts": []string{"https://api.example.com"},
						},
					},
				},
			},
			"apiKey": {
				ExampleProps: spec3.ExampleProps{
					Summary:     "API key",
					Description: "API key sent as a request header.",
					Value: map[string]any{
						"jsonData": map[string]any{
							"auth_method":  "apiKey",
							"apiKeyKey":    "X-API-Key",
							"apiKeyType":   "header",
							"allowedHosts": []string{"https://api.example.com"},
						},
					},
				},
			},
			"oauth2ClientCredentials": {
				ExampleProps: spec3.ExampleProps{
					Summary:     "OAuth 2.0 client credentials",
					Description: "OAuth 2.0 client-credentials grant.",
					Value: map[string]any{
						"jsonData": map[string]any{
							"auth_method": "oauth2",
							"oauth2": map[string]any{
								"oauth2_type": "client_credentials",
								"client_id":   "my-client-id",
								"token_url":   "https://login.example.com/oauth2/token",
								"scopes":      []string{"read"},
							},
							"allowedHosts": []string{"https://api.example.com"},
						},
					},
				},
			},
		},
	}
}
