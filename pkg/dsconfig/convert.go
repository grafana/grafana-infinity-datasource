// This file converts the declarative DatasourceConfigSchema into the
// grafana-plugin-sdk-go experimental/pluginschema types. This package is a
// temporary local mirror of experimental/dsconfig (see schema.go).
package dsconfig

import (
	"encoding/json"
	"fmt"
	"strings"

	sdkschema "github.com/grafana/grafana-plugin-sdk-go/experimental/pluginschema"
	"k8s.io/kube-openapi/pkg/validation/spec"
)

// ToSettings converts the declarative schema into the SDK pluginschema.Settings
// shape: Spec describes the whole instance-settings object (root fields plus a
// nested jsonData object), and secureJsonData fields become SecureValues. Virtual
// fields are skipped.
func (s *DatasourceConfigSchema) ToSettings() (*sdkschema.Settings, error) {
	if err := s.Validate(); err != nil {
		return nil, fmt.Errorf("invalid schema: %w", err)
	}

	rootProps := make(map[string]spec.Schema)
	var rootRequired []string

	jsonDataProps := make(map[string]spec.Schema)
	var jsonDataRequired []string

	var secureValues []sdkschema.SecureValueInfo

	for _, f := range s.Fields {
		if f.Kind == VirtualField {
			continue
		}

		if f.Target != nil && *f.Target == SecureJSONTarget {
			secureValues = append(secureValues, sdkschema.SecureValueInfo{
				Key:         f.Key,
				Description: f.Description,
				Required:    f.Required,
			})
			continue
		}

		if f.Target != nil && *f.Target == JSONDataTarget {
			placeInSection(jsonDataProps, f)
			if f.Required && f.Section == "" {
				jsonDataRequired = append(jsonDataRequired, f.Key)
			}
		} else {
			rootProps[f.Key] = fieldToSpecSchema(f)
			if f.Required {
				rootRequired = append(rootRequired, f.Key)
			}
		}
	}

	if len(jsonDataProps) > 0 {
		jd := spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type:       spec.StringOrArray{"object"},
				Properties: jsonDataProps,
			},
		}
		if len(jsonDataRequired) > 0 {
			jd.Required = jsonDataRequired
		}
		rootProps["jsonData"] = jd
	}

	specSchema := &spec.Schema{
		SchemaProps: spec.SchemaProps{
			Type:       spec.StringOrArray{"object"},
			Properties: rootProps,
		},
	}
	if len(rootRequired) > 0 {
		specSchema.Required = rootRequired
	}

	return &sdkschema.Settings{
		Spec:         specSchema,
		SecureValues: secureValues,
	}, nil
}

// NewPluginSchema assembles a full SDK PluginSchema from the declarative single
// source of truth, for the given API version and optional settings examples.
func (s *DatasourceConfigSchema) NewPluginSchema(apiVersion string, examples *sdkschema.SettingsExamples) (*sdkschema.PluginSchema, error) {
	settings, err := s.ToSettings()
	if err != nil {
		return nil, err
	}
	return &sdkschema.PluginSchema{
		TargetAPIVersion: apiVersion,
		SettingsSchema:   settings,
		SettingsExamples: examples,
	}, nil
}

// MarshalPluginSchema renders a PluginSchema to the canonical JSON encoding used
// for both artifact generation and drift detection, so generators and tests never
// disagree on formatting.
func MarshalPluginSchema(schema *sdkschema.PluginSchema) ([]byte, error) {
	out, err := json.MarshalIndent(schema, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("marshal plugin schema: %w", err)
	}
	return append(out, '\n'), nil
}

// placeInSection places a field into the correct section sub-object within props.
// If the field has no Section, it is placed directly. If it has a Section, the
// field is nested under an object property path. Dotted sections (e.g.
// "oauth2.endpoints") are resolved recursively, creating intermediate objects.
func placeInSection(props map[string]spec.Schema, f ConfigField) {
	if f.Section == "" {
		props[f.Key] = fieldToSpecSchema(f)
		return
	}
	placeInSectionPath(props, strings.Split(f.Section, "."), f)
}

// placeInSectionPath recursively walks the section path segments, creating
// intermediate object schemas as needed, then places the field at the final level.
func placeInSectionPath(props map[string]spec.Schema, segments []string, f ConfigField) {
	seg := segments[0]

	section, exists := props[seg]
	if !exists {
		section = spec.Schema{
			SchemaProps: spec.SchemaProps{
				Type:       spec.StringOrArray{"object"},
				Properties: make(map[string]spec.Schema),
			},
		}
	}
	if section.Properties == nil {
		section.Properties = make(map[string]spec.Schema)
	}

	if len(segments) == 1 {
		section.Properties[f.Key] = fieldToSpecSchema(f)
		if f.Required {
			section.Required = append(section.Required, f.Key)
		}
	} else {
		placeInSectionPath(section.Properties, segments[1:], f)
	}

	props[seg] = section
}

// fieldToSpecSchema converts a ConfigField to an OpenAPI spec.Schema.
func fieldToSpecSchema(f ConfigField) spec.Schema {
	s := spec.Schema{
		SchemaProps: spec.SchemaProps{
			Description: f.Description,
		},
	}
	setSchemaType(&s, f.ValueType)

	if f.DefaultValue != nil {
		s.Default = f.DefaultValue
	}

	if f.SemanticType != "" {
		if format := semanticTypeToFormat(f.SemanticType); format != "" {
			s.Format = format
		}
	}

	applyValidations(&s, f)
	applyUIEnum(&s, f)
	applyConditions(&s, f)

	if f.ValueType == ArrayType && f.Item != nil {
		itemSchema := itemSchemaToSpec(*f.Item)
		s.Items = &spec.SchemaOrArray{Schema: &itemSchema}
	}

	if f.ValueType == ObjectType && f.Item != nil && len(f.Item.Fields) > 0 {
		props := make(map[string]spec.Schema)
		var required []string
		for _, sub := range f.Item.Fields {
			props[sub.Key] = fieldToSpecSchema(sub)
			if sub.Required {
				required = append(required, sub.Key)
			}
		}
		s.Properties = props
		if len(required) > 0 {
			s.Required = required
		}
	}

	return s
}

// applyConditions maps conditional behavior (CEL expressions) to vendor
// extensions on the spec.Schema.
func applyConditions(s *spec.Schema, f ConfigField) {
	if f.DependsOn == "" && f.RequiredWhen == "" && f.DisabledWhen == "" {
		return
	}
	s.Extensions = make(spec.Extensions)
	if f.DependsOn != "" {
		s.Extensions["x-dsconfig-depends-on"] = f.DependsOn
	}
	if f.RequiredWhen != "" {
		s.Extensions["x-dsconfig-required-when"] = f.RequiredWhen
	}
	if f.DisabledWhen != "" {
		s.Extensions["x-dsconfig-disabled-when"] = f.DisabledWhen
	}
}

// applyValidations maps dsconfig validation rules to JSON Schema keywords.
func applyValidations(s *spec.Schema, f ConfigField) {
	for _, v := range f.Validations {
		switch v.Type {
		case PatternValidation:
			s.Pattern = v.Pattern
		case RangeValidation:
			s.Minimum = v.Min
			s.Maximum = v.Max
		case LengthValidation:
			if v.Min != nil {
				n := int64(*v.Min)
				s.MinLength = &n
			}
			if v.Max != nil {
				n := int64(*v.Max)
				s.MaxLength = &n
			}
		case ItemCountValidation:
			if v.Min != nil {
				n := int64(*v.Min)
				s.MinItems = &n
			}
			if v.Max != nil {
				n := int64(*v.Max)
				s.MaxItems = &n
			}
		case AllowedValuesValidation:
			s.Enum = make([]any, len(v.Values))
			copy(s.Enum, v.Values)
		}
	}
}

// applyUIEnum sets enum values from select/radio/multiselect UI options when no
// explicit allowedValues validation is present.
func applyUIEnum(s *spec.Schema, f ConfigField) {
	if f.UI == nil || len(f.UI.Options) == 0 {
		return
	}
	switch f.UI.Component {
	case UISelect, UIRadio, UIMultiselect:
		if len(s.Enum) > 0 {
			return // explicit allowedValues takes precedence
		}
		for _, opt := range f.UI.Options {
			s.Enum = append(s.Enum, opt.Value)
		}
	}
}

func itemSchemaToSpec(item FieldItemSchema) spec.Schema {
	s := spec.Schema{}
	setSchemaType(&s, item.ValueType)

	if item.ValueType == ObjectType && len(item.Fields) > 0 {
		props := make(map[string]spec.Schema)
		var required []string
		for _, f := range item.Fields {
			props[f.Key] = fieldToSpecSchema(f)
			if f.Required {
				required = append(required, f.Key)
			}
		}
		s.Properties = props
		if len(required) > 0 {
			s.Required = required
		}
	}

	return s
}

// setSchemaType applies the JSON type for a ValueType to a spec.Schema. MapType
// becomes an object with free-form additionalProperties; AnyType leaves the type
// unconstrained (no "type" keyword emitted).
func setSchemaType(s *spec.Schema, vt ValueType) {
	if vt == AnyType {
		return
	}
	s.Type = spec.StringOrArray{valueTypeToJSONType(vt)}
	if vt == MapType {
		s.AdditionalProperties = &spec.SchemaOrBool{Allows: true}
	}
}

func valueTypeToJSONType(vt ValueType) string {
	switch vt {
	case StringType:
		return "string"
	case NumberType:
		return "number"
	case BooleanType:
		return "boolean"
	case ArrayType:
		return "array"
	case ObjectType, MapType:
		return "object"
	default:
		return "string"
	}
}

func semanticTypeToFormat(st SemanticType) string {
	switch st {
	case URLType:
		return "uri"
	case PasswordType:
		return "password"
	case HostnameType:
		return "hostname"
	case DurationType:
		return "duration"
	case TokenType:
		return "token"
	case DatasourceUIDType:
		return "datasource-uid"
	case QueryType:
		return "query"
	default:
		return ""
	}
}
