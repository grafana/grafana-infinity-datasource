// Package dsconfig is a declarative datasource configuration schema.
//
// This is a temporary local mirror of
// github.com/grafana/grafana-plugin-sdk-go/experimental/dsconfig, kept in tree
// until that package ships in a published SDK release. Once the SDK release that
// contains it is adopted here, delete this package and switch imports to the SDK.
// Keep the two copies in sync in the meantime.
//
// The schema is the single source of truth for a datasource's configuration:
// every field declares its storage location (root / jsonData / secureJsonData),
// type, and validation. ToSettings converts it to the grafana-plugin-sdk-go
// experimental/pluginschema Settings shape (see convert.go).
package dsconfig

import "fmt"

// DatasourceConfigSchema is the top-level declarative schema for a datasource's
// configuration. It is the single source of truth consumed by config editors,
// validation, documentation, and the SDK plugin-schema converter.
type DatasourceConfigSchema struct {
	SchemaVersion string        `json:"schemaVersion"`
	PluginType    string        `json:"pluginType"`
	PluginName    string        `json:"pluginName"`
	DocURL        string        `json:"docURL,omitempty"`
	Fields        []ConfigField `json:"fields"`
}

// ConfigField represents a single configuration field.
type ConfigField struct {
	// ID is globally unique (used for references).
	ID string `json:"id"`
	// Key is the local key used in storage or object structures.
	Key string `json:"key"`

	Label       string `json:"label,omitempty"`
	Description string `json:"description,omitempty"`
	DocURL      string `json:"docURL,omitempty"`

	ValueType    ValueType    `json:"valueType"`
	SemanticType SemanticType `json:"semanticType,omitempty"`
	DefaultValue any          `json:"defaultValue,omitempty"`
	Required     bool         `json:"required,omitempty"`

	// Target is the storage location (required for storage fields).
	Target *TargetLocation `json:"target,omitempty"`

	// Section is the dotted path prefix within the target for nested objects.
	// Example: for jsonData.oauth2.endpoints.tokenUrl, target="jsonData",
	// section="oauth2.endpoints", key="tokenUrl".
	Section string `json:"section,omitempty"`

	// Kind is the field kind: storage (default) or virtual.
	Kind FieldKind `json:"kind,omitempty"`

	// IsItemField is true if the field is part of an array/object item schema.
	IsItemField *bool `json:"isItemField,omitempty"`

	// UI hints (used by the converter to derive enums from select/radio options).
	UI *FieldUI `json:"ui,omitempty"`

	// Validations are field-level validation rules.
	Validations []FieldValidationRule `json:"validations,omitempty"`

	// Conditional behavior (CEL expressions), surfaced as vendor extensions.
	DependsOn    string `json:"dependsOn,omitempty"`
	RequiredWhen string `json:"requiredWhen,omitempty"`
	DisabledWhen string `json:"disabledWhen,omitempty"`

	// Item is the element schema (required when ValueType is array; optional for object).
	Item *FieldItemSchema `json:"item,omitempty"`
}

// FieldItemSchema defines the schema for array elements or object sub-fields.
type FieldItemSchema struct {
	ValueType ValueType     `json:"valueType"`
	Fields    []ConfigField `json:"fields,omitempty"`
}

// ValueType is the core JSON type of a field.
type ValueType string

const (
	StringType  ValueType = "string"
	NumberType  ValueType = "number"
	BooleanType ValueType = "boolean"
	ArrayType   ValueType = "array"
	ObjectType  ValueType = "object"
	MapType     ValueType = "map"
	AnyType     ValueType = "any"
)

func (v ValueType) IsValid() bool {
	switch v {
	case StringType, NumberType, BooleanType, ArrayType, ObjectType, MapType, AnyType:
		return true
	default:
		return false
	}
}

// SemanticType adds meaning on top of ValueType (maps to a JSON Schema format).
type SemanticType string

const (
	URLType           SemanticType = "url"
	PasswordType      SemanticType = "password"
	TokenType         SemanticType = "token"
	HostnameType      SemanticType = "hostname"
	DurationType      SemanticType = "duration"
	DatasourceUIDType SemanticType = "datasourceUid"
	QueryType         SemanticType = "query"
)

// TargetLocation is where a field is stored in Grafana's datasource config.
type TargetLocation string

const (
	RootTarget       TargetLocation = "root"
	JSONDataTarget   TargetLocation = "jsonData"
	SecureJSONTarget TargetLocation = "secureJsonData"
)

func (t TargetLocation) IsValid() bool {
	switch t {
	case RootTarget, JSONDataTarget, SecureJSONTarget:
		return true
	default:
		return false
	}
}

// FieldKind is the field kind.
type FieldKind string

const (
	StorageField FieldKind = "storage"
	VirtualField FieldKind = "virtual"
)

// UIComponent identifies the rendering widget for a field.
type UIComponent string

const (
	UIInput       UIComponent = "input"
	UITextarea    UIComponent = "textarea"
	UISelect      UIComponent = "select"
	UIMultiselect UIComponent = "multiselect"
	UIRadio       UIComponent = "radio"
	UICheckbox    UIComponent = "checkbox"
	UISwitch      UIComponent = "switch"
	UICode        UIComponent = "code"
	UIKeyValue    UIComponent = "keyvalue"
	UIList        UIComponent = "list"
)

// FieldUI holds UI rendering hints consumed by config editors and by the
// converter (which derives enums from select/radio/multiselect options).
type FieldUI struct {
	Component   UIComponent   `json:"component"`
	Options     []FieldOption `json:"options,omitempty"`
	Placeholder string        `json:"placeholder,omitempty"`
}

// FieldOption is a select/radio option.
type FieldOption struct {
	Label       string `json:"label"`
	Value       any    `json:"value"`
	Description string `json:"description,omitempty"`
}

// ValidationType discriminates a FieldValidationRule.
type ValidationType string

const (
	PatternValidation       ValidationType = "pattern"
	RangeValidation         ValidationType = "range"
	LengthValidation        ValidationType = "length"
	ItemCountValidation     ValidationType = "itemCount"
	AllowedValuesValidation ValidationType = "allowedValues"
	CustomValidation        ValidationType = "custom"
)

// FieldValidationRule is a single validation rule. It is a flattened union of all
// rule variants; only the fields relevant to a given Type are populated.
type FieldValidationRule struct {
	Type    ValidationType `json:"type"`
	ID      string         `json:"id,omitempty"`
	Message string         `json:"message,omitempty"`

	// Pattern (pattern rule).
	Pattern string `json:"pattern,omitempty"`
	// Min/Max (range, length, itemCount rules).
	Min *float64 `json:"min,omitempty"`
	Max *float64 `json:"max,omitempty"`
	// Values (allowedValues rule).
	Values []any `json:"values,omitempty"`
	// Expression (custom rule).
	Expression string `json:"expression,omitempty"`
}

// Validate checks the schema for structural correctness.
func (s *DatasourceConfigSchema) Validate() error {
	if s.SchemaVersion == "" {
		return fmt.Errorf("schemaVersion is required")
	}
	if s.PluginType == "" {
		return fmt.Errorf("pluginType is required")
	}
	if s.PluginName == "" {
		return fmt.Errorf("pluginName is required")
	}
	if len(s.Fields) == 0 {
		return fmt.Errorf("fields is required")
	}
	seen := map[string]bool{}
	for i := range s.Fields {
		if err := s.Fields[i].validate(seen); err != nil {
			return err
		}
	}
	return nil
}

func (f *ConfigField) validate(seen map[string]bool) error {
	if f.ID == "" {
		return fmt.Errorf("field id is required")
	}
	if seen[f.ID] {
		return fmt.Errorf("duplicate field id: %s", f.ID)
	}
	seen[f.ID] = true

	if f.Key == "" {
		return fmt.Errorf("field %q: key is required", f.ID)
	}
	if !f.ValueType.IsValid() {
		return fmt.Errorf("field %q: invalid valueType %q", f.ID, f.ValueType)
	}
	isItem := f.IsItemField != nil && *f.IsItemField
	isVirtual := f.Kind == VirtualField
	if !isItem && !isVirtual {
		if f.Target == nil {
			return fmt.Errorf("field %q: target is required for storage fields", f.ID)
		}
		if !f.Target.IsValid() {
			return fmt.Errorf("field %q: invalid target %q", f.ID, *f.Target)
		}
	}
	if f.Item != nil {
		for i := range f.Item.Fields {
			if err := f.Item.Fields[i].validate(seen); err != nil {
				return err
			}
		}
	}
	return nil
}
