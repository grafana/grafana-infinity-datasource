package schema_test

import (
	"flag"
	"testing"

	dsconfigSchema "github.com/grafana/dsconfig/schema"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	pluginSchema "github.com/grafana/grafana-infinity-datasource/pkg/schema"
	"github.com/stretchr/testify/require"
)

// generateArtifacts is set by `go generate ./pkg/schema`, which runs this test package
// with the -generateArtifacts flag to (re)write the committed schema artifacts. When the
// flag is not set, TestGenerateArtifacts is skipped during normal test runs.
var generateArtifacts = flag.Bool("generateArtifacts", false, "write the schema artifacts to disk instead of running tests")

//go:generate go test -run TestGenerateArtifacts -generateArtifacts
func TestGenerateArtifacts(t *testing.T) {
	t.Helper()
	if !*generateArtifacts {
		t.Skip("run via `go generate ./...` to write schema artifacts")
	}
	err := dsconfigSchema.WriteArtifacts(pluginSchema.NewSDKSchema())
	if err != nil {
		t.Error("failed to generate schema artifacts")
	}
	require.NoError(t, err)
	t.Log("schema artifacts generated")
}

// TestSchemaConformance runs the plugin-agnostic schema guard rails defined in
// the dsconfig SDK against this plugin's schema. The invariants live in
// github.com/grafana/dsconfig/schema/conformance so they can be reused by any
// plugin built on the dsconfig single source of truth.
func TestSchemaConformance(t *testing.T) {
	cfg, err := pluginSchema.DSConfigSchema()
	require.NoError(t, err)
	dsconfigSchema.RunConformanceTests(t, dsconfigSchema.Params{
		PluginID:          "yesoreyeram-infinity-datasource",
		DSConfigSchema:    cfg,
		PluginSchema:      pluginSchema.NewSDKSchema(),
		SettingsJSONModel: models.InfinitySettingsJson{},
		SecureKeys: []string{
			"apiKeyValue", "basicAuthPassword", "oauth2ClientSecret", "oauth2JWTPrivateKey",
			"tlsCACert", "tlsClientCert", "tlsClientKey", "bearerToken",
			"awsAccessKey", "awsSecretKey", "azureBlobAccountKey", "proxyUserPassword",
		},
	})
}
