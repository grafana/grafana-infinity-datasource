package pluginschema_test

import (
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strings"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/dsconfig"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-infinity-datasource/pkg/pluginschema"
	sdkschema "github.com/grafana/grafana-plugin-sdk-go/experimental/pluginschema"
	"github.com/stretchr/testify/require"
)

// TestSchemaArtifactInSync fails if the committed JSON artifact has drifted from
// NewSchema. Regenerate with `go generate ./pkg/pluginschema`.
func TestSchemaArtifactInSync(t *testing.T) {
	want, err := pluginschema.Marshal()
	require.NoError(t, err)

	got, err := os.ReadFile(pluginschema.OutputPath) // #nosec G304 -- package-controlled path
	require.NoError(t, err, "schema artifact missing; run `go generate ./pkg/pluginschema`")

	require.JSONEq(t, string(want), string(got), "schema artifact is out of date; run `go generate ./pkg/pluginschema`")
}

// TestSchemaSpecHasNoSecureJSON guards the invariant the SDK enforces: secure
// values must be declared via SecureValues, never inside the settings spec.
func TestSchemaSpecHasNoSecureJSON(t *testing.T) {
	schema := pluginschema.NewSchema()
	require.NotNil(t, schema.SettingsSchema)
	require.NotNil(t, schema.SettingsSchema.Spec)
	_, hasSecure := schema.SettingsSchema.Spec.Properties["secureJsonData"]
	require.False(t, hasSecure, "secureJsonData must not be defined on the spec; use SecureValues")
}

// TestSchemaRoundTrip loads the committed artifact through the production provider
// that Grafana uses (NewSchemaProvider reads {apiVersion}.json). The generated
// source file is dsconfig.json; the webpack build ships it as
// {apiVersion}.json, so we stage it under that name in a temp dir to load it
// through the real provider exactly as Grafana would.
func TestSchemaRoundTrip(t *testing.T) {
	data, err := os.ReadFile(pluginschema.OutputPath) // #nosec G304 -- package-controlled path
	require.NoError(t, err, "schema artifact missing; run `go generate ./pkg/pluginschema`")

	dir := t.TempDir()
	require.NoError(t, os.WriteFile(filepath.Join(dir, pluginschema.TargetAPIVersion+".json"), data, 0o600))

	provider := sdkschema.NewSchemaProvider(os.DirFS(dir))

	loaded, err := provider.Get(pluginschema.TargetAPIVersion)
	require.NoError(t, err)
	require.False(t, loaded.IsZero(), "loaded schema should not be empty")
	require.Equal(t, pluginschema.TargetAPIVersion, loaded.TargetAPIVersion)
	require.NotNil(t, loaded.SettingsSchema)
	require.NotEmpty(t, loaded.SettingsSchema.SecureValues)
}

// TestConfigSchemaValid validates the dsconfig single source of truth.
func TestConfigSchemaValid(t *testing.T) {
	cfg, err := pluginschema.ConfigSchema()
	require.NoError(t, err)
	require.NoError(t, cfg.Validate())
	require.Equal(t, "yesoreyeram-infinity-datasource", cfg.PluginType)
}

// TestJSONDataMatchesStruct is the single-source-of-truth guard rail: the
// `jsonData` field keys declared in the dsconfig schema must exactly match the
// JSON tags on models.InfinitySettingsJson. Add/remove/rename a struct field
// without updating the schema (or vice versa) and this fails in both directions.
func TestJSONDataMatchesStruct(t *testing.T) {
	cfg, err := pluginschema.ConfigSchema()
	require.NoError(t, err)

	schemaKeys := []string{}
	for _, f := range cfg.Fields {
		if f.Target != nil && *f.Target == dsconfig.JSONDataTarget {
			schemaKeys = append(schemaKeys, f.Key)
		}
	}

	structKeys := jsonTagKeys(reflect.TypeOf(models.InfinitySettingsJson{}))

	sort.Strings(schemaKeys)
	sort.Strings(structKeys)
	require.ElementsMatch(t, structKeys, schemaKeys,
		"jsonData fields in dsconfig.json are out of sync with models.InfinitySettingsJson JSON tags")
}

// TestJSONDataTypesMatchStruct closes the type-drift gap left by
// TestJSONDataMatchesStruct: matching key sets is not enough, the declared
// JSON type of each `jsonData` field must also agree with the Go kind of the
// corresponding models.InfinitySettingsJson field. Changing a struct field
// from int64 to string (or a schema field from number to string) without
// updating the other side fails here.
func TestJSONDataTypesMatchStruct(t *testing.T) {
	cfg, err := pluginschema.ConfigSchema()
	require.NoError(t, err)

	schemaTypes := map[string]dsconfig.ValueType{}
	for _, f := range cfg.Fields {
		if f.Target != nil && *f.Target == dsconfig.JSONDataTarget {
			schemaTypes[f.Key] = f.ValueType
		}
	}

	structTypes := jsonTagKinds(reflect.TypeOf(models.InfinitySettingsJson{}))

	for key, vt := range schemaTypes {
		kind, ok := structTypes[key]
		if !ok {
			continue // key-set drift is reported by TestJSONDataMatchesStruct
		}
		want := valueTypesForKind(kind)
		require.Contains(t, want, vt,
			"jsonData field %q is declared as %q in dsconfig.json but the struct field has Go kind %q",
			key, vt, kind)
	}
}

// TestSecureValuesMatchLoadSettings guards that the secureJsonData keys declared
// in the schema match the secret keys actually read by models.LoadSettings.
func TestSecureValuesMatchLoadSettings(t *testing.T) {
	cfg, err := pluginschema.ConfigSchema()
	require.NoError(t, err)

	schemaKeys := []string{}
	for _, f := range cfg.Fields {
		if f.Target != nil && *f.Target == dsconfig.SecureJSONTarget {
			schemaKeys = append(schemaKeys, f.Key)
		}
	}

	// Keys read in models.LoadSettings via config.DecryptedSecureJSONData[...].
	loadKeys := []string{
		"apiKeyValue", "basicAuthPassword", "oauth2ClientSecret", "oauth2JWTPrivateKey",
		"tlsCACert", "tlsClientCert", "tlsClientKey", "bearerToken",
		"awsAccessKey", "awsSecretKey", "azureBlobAccountKey", "proxyUserPassword",
	}

	sort.Strings(schemaKeys)
	sort.Strings(loadKeys)
	require.ElementsMatch(t, loadKeys, schemaKeys,
		"secureJsonData fields in dsconfig.json are out of sync with secrets read in models.LoadSettings")
}

// jsonTagKeys returns the JSON field names declared on a struct, skipping fields
// without a json tag or tagged "-".
func jsonTagKeys(t reflect.Type) []string {
	keys := make([]string, 0, t.NumField())
	for i := 0; i < t.NumField(); i++ {
		tag := t.Field(i).Tag.Get("json")
		if tag == "" || tag == "-" {
			continue
		}
		if name := strings.Split(tag, ",")[0]; name != "" {
			keys = append(keys, name)
		}
	}
	return keys
}

// jsonTagKinds maps each JSON field name to the reflect.Kind of its struct
// field, skipping fields without a json tag or tagged "-".
func jsonTagKinds(t reflect.Type) map[string]reflect.Kind {
	kinds := make(map[string]reflect.Kind, t.NumField())
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		tag := field.Tag.Get("json")
		if tag == "" || tag == "-" {
			continue
		}
		name := strings.Split(tag, ",")[0]
		if name == "" {
			continue
		}
		kinds[name] = field.Type.Kind()
	}
	return kinds
}

// valueTypesForKind returns the dsconfig ValueTypes that are compatible with a
// given Go reflect.Kind. A struct field may legitimately be declared as more
// than one JSON type (for example a numeric kind can be "number"), so the guard
// checks for membership rather than strict equality.
func valueTypesForKind(kind reflect.Kind) []dsconfig.ValueType {
	switch kind {
	case reflect.String:
		return []dsconfig.ValueType{dsconfig.StringType}
	case reflect.Bool:
		return []dsconfig.ValueType{dsconfig.BooleanType}
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64,
		reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64,
		reflect.Float32, reflect.Float64:
		return []dsconfig.ValueType{dsconfig.NumberType}
	case reflect.Slice, reflect.Array:
		return []dsconfig.ValueType{dsconfig.ArrayType}
	case reflect.Struct, reflect.Map:
		return []dsconfig.ValueType{dsconfig.ObjectType, dsconfig.MapType}
	default:
		return nil
	}
}
