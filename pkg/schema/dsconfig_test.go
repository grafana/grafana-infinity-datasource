package schema_test

import (
	_ "embed"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/dsconfig/schema"
)

//go:embed dsconfig.json
var configSchemaJSON []byte

//go:generate go test -run TestPlugin -generateArtifacts
func TestPlugin(t *testing.T) {
	schema.RunPluginTests(t, schema.PluginUnderTest{
		ID:                "yesoreyeram-infinity-datasource",
		ConfigSchemaJSON:  configSchemaJSON,
		SettingsJSONModel: models.InfinitySettingsJson{},
		SecureKeys: []string{
			"apiKeyValue",
			"basicAuthPassword",
			"oauth2ClientSecret",
			"oauth2JWTPrivateKey",
			"tlsCACert",
			"tlsClientCert",
			"tlsClientKey",
			"bearerToken",
			"awsAccessKey",
			"awsSecretKey",
			"azureBlobAccountKey",
			"proxyUserPassword",
		},
	})
}