package dsconfig_test

import (
	"encoding/json"
	"flag"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana-infinity-datasource/pkg/dsconfig"
)

var update = flag.Bool("update", false, "update golden files")

func target(t dsconfig.TargetLocation) *dsconfig.TargetLocation { return &t }

func boolPtr(b bool) *bool { return &b }

func float64Ptr(f float64) *float64 { return &f }

// kitchenSinkSchema exercises every converter feature in one schema: all value
// types (including map/any), every semantic format, each validation kind, UI
// enum derivation, conditional expressions, dotted-section nesting, array/object
// item schemas, and all three storage targets plus a virtual field. The golden
// file is the readable record of exactly what the converter emits for it.
func kitchenSinkSchema() *dsconfig.DatasourceConfigSchema {
	return &dsconfig.DatasourceConfigSchema{
		SchemaVersion: "v1",
		PluginType:    "example-datasource",
		PluginName:    "Example",
		Fields: []dsconfig.ConfigField{
			// Root + required.
			{ID: "url", Key: "url", ValueType: dsconfig.StringType, Target: target(dsconfig.RootTarget), Required: true, SemanticType: dsconfig.URLType},
			// Every scalar value type in jsonData.
			{ID: "str", Key: "str", ValueType: dsconfig.StringType, Target: target(dsconfig.JSONDataTarget)},
			{ID: "num", Key: "num", ValueType: dsconfig.NumberType, Target: target(dsconfig.JSONDataTarget)},
			{ID: "boolean", Key: "boolean", ValueType: dsconfig.BooleanType, Target: target(dsconfig.JSONDataTarget)},
			{ID: "mapField", Key: "mapField", ValueType: dsconfig.MapType, Target: target(dsconfig.JSONDataTarget)},
			{ID: "anyField", Key: "anyField", ValueType: dsconfig.AnyType, Target: target(dsconfig.JSONDataTarget)},
			// Remaining semantic formats.
			{ID: "host", Key: "host", ValueType: dsconfig.StringType, Target: target(dsconfig.JSONDataTarget), SemanticType: dsconfig.HostnameType},
			{ID: "dur", Key: "dur", ValueType: dsconfig.StringType, Target: target(dsconfig.JSONDataTarget), SemanticType: dsconfig.DurationType},
			{ID: "tok", Key: "tok", ValueType: dsconfig.StringType, Target: target(dsconfig.JSONDataTarget), SemanticType: dsconfig.TokenType},
			{ID: "dsUID", Key: "dsUID", ValueType: dsconfig.StringType, Target: target(dsconfig.JSONDataTarget), SemanticType: dsconfig.DatasourceUIDType},
			{ID: "query", Key: "query", ValueType: dsconfig.StringType, Target: target(dsconfig.JSONDataTarget), SemanticType: dsconfig.QueryType},
			// Validations.
			{ID: "pat", Key: "pat", ValueType: dsconfig.StringType, Target: target(dsconfig.JSONDataTarget),
				Validations: []dsconfig.FieldValidationRule{{Type: dsconfig.PatternValidation, Pattern: "^x"}}},
			{ID: "rng", Key: "rng", ValueType: dsconfig.NumberType, Target: target(dsconfig.JSONDataTarget),
				Validations: []dsconfig.FieldValidationRule{{Type: dsconfig.RangeValidation, Min: float64Ptr(1), Max: float64Ptr(10)}}},
			{ID: "len", Key: "len", ValueType: dsconfig.StringType, Target: target(dsconfig.JSONDataTarget),
				Validations: []dsconfig.FieldValidationRule{{Type: dsconfig.LengthValidation, Min: float64Ptr(2), Max: float64Ptr(5)}}},
			{ID: "allowed", Key: "allowed", ValueType: dsconfig.StringType, Target: target(dsconfig.JSONDataTarget),
				Validations: []dsconfig.FieldValidationRule{{Type: dsconfig.AllowedValuesValidation, Values: []any{"a", "b"}}}},
			// UI enum derivation (no explicit allowedValues).
			{ID: "mode", Key: "mode", ValueType: dsconfig.StringType, Target: target(dsconfig.JSONDataTarget),
				UI: &dsconfig.FieldUI{Component: dsconfig.UISelect, Options: []dsconfig.FieldOption{{Label: "On", Value: "on"}, {Label: "Off", Value: "off"}}}},
			// Conditional expressions.
			{ID: "cond", Key: "cond", ValueType: dsconfig.StringType, Target: target(dsconfig.JSONDataTarget),
				DependsOn: "a == 1", RequiredWhen: "b == 2", DisabledWhen: "c == 3"},
			// Dotted-section nesting: jsonData.oauth2.endpoints.tokenUrl + jsonData.oauth2.clientId.
			{ID: "tokenUrl", Key: "tokenUrl", ValueType: dsconfig.StringType, Target: target(dsconfig.JSONDataTarget), Section: "oauth2.endpoints"},
			{ID: "clientId", Key: "clientId", ValueType: dsconfig.StringType, Target: target(dsconfig.JSONDataTarget), Section: "oauth2"},
			// Array of objects.
			{ID: "refData", Key: "refData", ValueType: dsconfig.ArrayType, Target: target(dsconfig.JSONDataTarget),
				Item: &dsconfig.FieldItemSchema{ValueType: dsconfig.ObjectType, Fields: []dsconfig.ConfigField{
					{ID: "refName", Key: "name", ValueType: dsconfig.StringType, IsItemField: boolPtr(true), Required: true},
					{ID: "refBody", Key: "data", ValueType: dsconfig.StringType, IsItemField: boolPtr(true)},
				}}},
			// Object with sub-fields.
			{ID: "aws", Key: "aws", ValueType: dsconfig.ObjectType, Target: target(dsconfig.JSONDataTarget),
				Item: &dsconfig.FieldItemSchema{ValueType: dsconfig.ObjectType, Fields: []dsconfig.ConfigField{
					{ID: "region", Key: "region", ValueType: dsconfig.StringType, IsItemField: boolPtr(true), Required: true},
				}}},
			// Secret -> SecureValues, never the spec.
			{ID: "apiKey", Key: "apiKeyValue", ValueType: dsconfig.StringType, Target: target(dsconfig.SecureJSONTarget), Description: "secret", Required: true, SemanticType: dsconfig.PasswordType},
			// Virtual field -> skipped everywhere.
			{ID: "virt", Key: "virt", ValueType: dsconfig.StringType, Kind: dsconfig.VirtualField},
		},
	}
}

// TestConvertGolden is the drift guard: it converts the kitchen-sink schema and
// compares the marshalled SDK PluginSchema against a committed golden file. Any
// change in the converter shows up as a readable JSON diff. Run with -update to
// regenerate the golden after an intentional change.
func TestConvertGolden(t *testing.T) {
	schema, err := kitchenSinkSchema().NewPluginSchema("v0alpha1", nil)
	require.NoError(t, err)

	got, err := dsconfig.MarshalPluginSchema(schema)
	require.NoError(t, err)

	goldenPath := filepath.Join("testdata", "golden", "converted.json")
	if *update {
		require.NoError(t, os.MkdirAll(filepath.Dir(goldenPath), 0o755))
		require.NoError(t, os.WriteFile(goldenPath, got, 0o644))
	}

	want, err := os.ReadFile(goldenPath)
	require.NoError(t, err, "missing golden file; run: go test ./pkg/dsconfig -update")
	require.JSONEq(t, string(want), string(got), "converter output drifted from golden; run -update if intended")
}

// TestSecretsNeverLeakIntoSpec is a security invariant stated independently of
// the golden: secureJsonData fields must surface only as SecureValues and never
// appear anywhere in the settings spec, even by accident.
func TestSecretsNeverLeakIntoSpec(t *testing.T) {
	settings, err := kitchenSinkSchema().ToSettings()
	require.NoError(t, err)

	require.Len(t, settings.SecureValues, 1)
	require.Equal(t, "apiKeyValue", settings.SecureValues[0].Key)

	specJSON, err := json.Marshal(settings.Spec)
	require.NoError(t, err)
	require.NotContains(t, string(specJSON), "apiKeyValue", "secret key must never appear in the settings spec")
}

// TestValidate covers the validation rules by behaviour: a known-good schema and
// one mutation per rule, asserting only that the right rule fires.
func TestValidate(t *testing.T) {
	good := func() *dsconfig.DatasourceConfigSchema {
		return &dsconfig.DatasourceConfigSchema{
			SchemaVersion: "v1", PluginType: "p", PluginName: "P",
			Fields: []dsconfig.ConfigField{{ID: "url", Key: "url", ValueType: dsconfig.StringType, Target: target(dsconfig.RootTarget)}},
		}
	}

	require.NoError(t, good().Validate(), "baseline schema should be valid")

	cases := []struct {
		name    string
		mutate  func(*dsconfig.DatasourceConfigSchema)
		wantErr string
	}{
		{"missing schemaVersion", func(s *dsconfig.DatasourceConfigSchema) { s.SchemaVersion = "" }, "schemaVersion"},
		{"missing pluginType", func(s *dsconfig.DatasourceConfigSchema) { s.PluginType = "" }, "pluginType"},
		{"missing pluginName", func(s *dsconfig.DatasourceConfigSchema) { s.PluginName = "" }, "pluginName"},
		{"no fields", func(s *dsconfig.DatasourceConfigSchema) { s.Fields = nil }, "fields"},
		{"missing field id", func(s *dsconfig.DatasourceConfigSchema) { s.Fields[0].ID = "" }, "id is required"},
		{"missing field key", func(s *dsconfig.DatasourceConfigSchema) { s.Fields[0].Key = "" }, "key is required"},
		{"invalid valueType", func(s *dsconfig.DatasourceConfigSchema) { s.Fields[0].ValueType = "bogus" }, "invalid valueType"},
		{"missing target on storage field", func(s *dsconfig.DatasourceConfigSchema) { s.Fields[0].Target = nil }, "target is required"},
		{"invalid target", func(s *dsconfig.DatasourceConfigSchema) { s.Fields[0].Target = target("bogus") }, "invalid target"},
		{"duplicate field id", func(s *dsconfig.DatasourceConfigSchema) {
			s.Fields = append(s.Fields, dsconfig.ConfigField{ID: "url", Key: "url2", ValueType: dsconfig.StringType, Target: target(dsconfig.RootTarget)})
		}, "duplicate field id"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			s := good()
			tc.mutate(s)
			require.ErrorContains(t, s.Validate(), tc.wantErr)
		})
	}
}

// TestValidate_TargetExemptions documents that non-storage fields are not
// required to declare a target.
func TestValidate_TargetExemptions(t *testing.T) {
	base := func(f dsconfig.ConfigField) *dsconfig.DatasourceConfigSchema {
		return &dsconfig.DatasourceConfigSchema{SchemaVersion: "v1", PluginType: "p", PluginName: "P", Fields: []dsconfig.ConfigField{f}}
	}
	require.NoError(t, base(dsconfig.ConfigField{ID: "v", Key: "v", ValueType: dsconfig.StringType, Kind: dsconfig.VirtualField}).Validate())
	require.NoError(t, base(dsconfig.ConfigField{ID: "i", Key: "i", ValueType: dsconfig.StringType, IsItemField: boolPtr(true)}).Validate())
}

// TestMarshalPluginSchema_TrailingNewline guards the canonical encoding contract
// the generator and drift tests both rely on.
func TestMarshalPluginSchema_TrailingNewline(t *testing.T) {
	schema, err := kitchenSinkSchema().NewPluginSchema("v0alpha1", nil)
	require.NoError(t, err)
	out, err := dsconfig.MarshalPluginSchema(schema)
	require.NoError(t, err)
	require.True(t, strings.HasSuffix(string(out), "}\n"), "output must end with a single trailing newline")
}
