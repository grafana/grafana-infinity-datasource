package schema

import (
	_ "embed"
	"encoding/json"
	"fmt"

	"k8s.io/kube-openapi/pkg/spec3"

	"github.com/grafana/dsconfig/dsconfig"
	dsschema "github.com/grafana/dsconfig/schema"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	sdkSchema "github.com/grafana/grafana-plugin-sdk-go/experimental/pluginschema"
)

const TargetAPIVersion = "v0alpha1"

//go:embed dsconfig.json
var configSchemaJSON []byte

func DSConfigSchema() (*dsconfig.Schema, error) {
	var s dsconfig.Schema
	if err := json.Unmarshal(configSchemaJSON, &s); err != nil {
		return nil, fmt.Errorf("parse settings.schema.json: %w", err)
	}
	return &s, nil
}

func NewSDKSchema() *sdkSchema.PluginSchema {
	cfg, err := DSConfigSchema()
	if err != nil {
		panic(err)
	}
	settings, err := cfg.ToPluginSchemaSettings()
	if err != nil {
		panic(err)
	}
	var schema *sdkSchema.PluginSchema
	schema, err = dsschema.NewPluginSchema(TargetAPIVersion, settings, newSettingsExamples())
	if err != nil {
		panic(err)
	}
	return schema
}

func newSettingsExamples() *sdkSchema.SettingsExamples {
	return &sdkSchema.SettingsExamples{
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
						"url": "https://api.example.com",
						"jsonData": map[string]any{
							"auth_method":  models.AuthenticationMethodBearerToken,
							"allowedHosts": []string{"https://api.example.com"},
						},
						"secureJsonData": map[string]string{
							"bearerToken": "xxxx",
						},
					},
				},
			},
			"apiKey": {
				ExampleProps: spec3.ExampleProps{
					Summary:     "API key",
					Description: "API key sent as a request header.",
					Value: map[string]any{
						"url": "https://api.example.com",
						"jsonData": map[string]any{
							"auth_method":  models.AuthenticationMethodApiKey,
							"apiKeyKey":    "X-API-Key",
							"apiKeyType":   "header",
							"allowedHosts": []string{"https://api.example.com"},
						},
						"secureJsonData": map[string]string{
							"apiKeyValue": "xxxx",
						},
					},
				},
			},
			"oauth2ClientCredentials": {
				ExampleProps: spec3.ExampleProps{
					Summary:     "OAuth 2.0 client credentials",
					Description: "OAuth 2.0 client-credentials grant.",
					Value: map[string]any{
						"url": "https://api.example.com",
						"jsonData": map[string]any{
							"auth_method": models.AuthenticationMethodOAuth,
							"oauth2": map[string]any{
								"oauth2_type": models.AuthOAuthTypeClientCredentials,
								"client_id":   "my-client-id",
								"token_url":   "https://login.example.com/oauth2/token",
								"scopes":      []string{"read"},
							},
							"allowedHosts": []string{"https://api.example.com"},
						},
						"secureJsonData": map[string]string{
							"oauth2ClientSecret": "xxxx",
						},
					},
				},
			},
		},
	}
}
