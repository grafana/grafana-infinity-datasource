package secretsmanager

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// ProviderType identifies the type of secret vault provider.
type ProviderType string

const (
	ProviderTypeNone          ProviderType = "none"
	ProviderTypeAzureKeyVault ProviderType = "azure-keyvault"
	// Future providers:
	// ProviderTypeHashiCorpVault    ProviderType = "hashicorp-vault"
	// ProviderTypeAWSSecretsManager ProviderType = "aws-secrets-manager"
	// ProviderTypeGCPSecretManager  ProviderType = "gcp-secret-manager"
)

var (
	ErrSecretNotFound        = errors.New("secret not found in vault")
	ErrProviderNotConfigured = errors.New("secret provider not configured")
	ErrUnsupportedProvider   = errors.New("unsupported secret provider type")
	ErrSecretResolveFailed   = errors.New("failed to resolve secret from vault")
)

// SecretProvider defines the interface that all secret vault backends must implement.
// This abstraction allows swapping between different vault providers (Azure Key Vault,
// HashiCorp Vault, AWS Secrets Manager, etc.) without changing the consuming code.
type SecretProvider interface {
	// GetSecret retrieves a single secret by its key/name from the vault.
	GetSecret(ctx context.Context, key string) (string, error)

	// GetSecrets retrieves multiple secrets by their keys from the vault.
	// Returns a map of key -> value. Missing keys are omitted from the result (not errored).
	GetSecrets(ctx context.Context, keys []string) (map[string]string, error)

	// TestConnection verifies that the vault is reachable and credentials are valid.
	TestConnection(ctx context.Context) error

	// Provider returns the type of this provider.
	Provider() ProviderType
}

// VaultConfig holds the configuration for connecting to an external secret vault.
// It is stored as part of the plugin's jsonData (non-secret fields) and secureJsonData (secret fields).
type VaultConfig struct {
	// Provider specifies which vault backend to use.
	Provider ProviderType `json:"provider,omitempty"`

	// CacheTTL is the duration (as a string like "5m", "30s", "1h") for which
	// fetched secrets are cached before being re-fetched from the vault.
	// When empty or "0", caching is disabled. Minimum is 30s.
	CacheTTL string `json:"cacheTTL,omitempty"`

	// Azure Key Vault configuration
	Azure *AzureKeyVaultConfig `json:"azure,omitempty"`

	// SecretMapping maps plugin secret field names (e.g. "bearerToken", "basicAuthPassword")
	// to vault secret names. If empty, the plugin field name is used as-is.
	SecretMapping map[string]string `json:"secretMapping,omitempty"`
}

// AzureKeyVaultConfig holds Azure Key Vault specific configuration.
type AzureKeyVaultConfig struct {
	// VaultURL is the URL of the Azure Key Vault, e.g. "https://myvault.vault.azure.net/"
	VaultURL string `json:"vaultUrl,omitempty"`

	// AuthMethod specifies how to authenticate with Azure Key Vault.
	// Supported values: "client-secret" (service principal with client secret),
	// "managed-identity" (Azure Managed Identity).
	AuthMethod string `json:"authMethod,omitempty"`

	// TenantID is the Azure AD tenant ID (required for client-secret auth).
	TenantID string `json:"tenantId,omitempty"`

	// ClientID is the Azure AD application (client) ID (required for client-secret auth).
	ClientID string `json:"clientId,omitempty"`
}

// NewSecretProvider creates a SecretProvider based on the given VaultConfig.
// The secureFields map contains sensitive values like client secrets that are stored
// in Grafana's secureJsonData.
func NewSecretProvider(ctx context.Context, config VaultConfig, secureFields map[string]string) (SecretProvider, error) {
	var provider SecretProvider
	var err error

	switch config.Provider {
	case ProviderTypeNone, "":
		return nil, ErrProviderNotConfigured
	case ProviderTypeAzureKeyVault:
		if config.Azure == nil {
			return nil, fmt.Errorf("azure key vault configuration is required when provider is %s", ProviderTypeAzureKeyVault)
		}
		clientSecret := secureFields["vaultAzureClientSecret"]
		provider, err = NewAzureKeyVaultProvider(ctx, *config.Azure, clientSecret)
		if err != nil {
			return nil, err
		}
	default:
		return nil, fmt.Errorf("%w: %s", ErrUnsupportedProvider, config.Provider)
	}

	// Wrap with caching layer if CacheTTL is configured
	if ttl := ParseCacheTTL(config.CacheTTL); ttl > 0 {
		provider = NewCachedSecretProvider(provider, ttl)
	}

	return provider, nil
}

// ParseCacheTTL parses a duration string (e.g. "5m", "30s", "1h") into a
// time.Duration. Returns 0 if the string is empty, "0", or unparseable.
func ParseCacheTTL(s string) time.Duration {
	if s == "" || s == "0" {
		return 0
	}
	d, err := time.ParseDuration(s)
	if err != nil {
		return 0
	}
	return d
}

// ResolveSecret resolves a single secret field. It first checks the vault using the mapped
// secret name (or the field name itself if no mapping exists), falling back to the local
// secureJsonData value if the vault is not configured or the secret is not found.
func ResolveSecret(ctx context.Context, provider SecretProvider, config VaultConfig, fieldName string, localValue string) string {
	resolved, err := ResolveSecretWithError(ctx, provider, config, fieldName, localValue)
	if err != nil {
		return localValue
	}
	return resolved
}

// ResolveSecretWithError resolves a single secret field and returns an error
// when vault is configured and resolution fails. When a vault provider is active,
// secrets are resolved exclusively from the vault — no fallback to local values.
func ResolveSecretWithError(ctx context.Context, provider SecretProvider, config VaultConfig, fieldName string, localValue string) (string, error) {
	if provider == nil {
		return localValue, nil
	}
	// vaultKey := fieldName
	// if config.SecretMapping != nil {
	// 	if mapped, ok := config.SecretMapping[fieldName]; ok && mapped != "" {
	// 		vaultKey = mapped
	// 	}
	// }
	val, err := provider.GetSecret(ctx, "foo")
	if err != nil {
		return "", fmt.Errorf("%w for field %s: %v", ErrSecretResolveFailed, fieldName, err)
	}
	if val == "" {
		return "", fmt.Errorf("%w for field %s: empty value", ErrSecretResolveFailed, fieldName)
	}
	backend.Logger.Error("DEBUG", "VAULT VALUE OF  "+fieldName, val)
	return val, nil
}

// ResolveSecrets resolves multiple secret fields at once. Works the same as ResolveSecret
// but batches the vault lookups for efficiency.
func ResolveSecrets(ctx context.Context, provider SecretProvider, config VaultConfig, fields map[string]string) map[string]string {
	resolved, err := ResolveSecretsWithError(ctx, provider, config, fields)
	if err != nil {
		return fields
	}
	return resolved
}

// ResolveSecretsWithError resolves multiple secret fields and returns an error
// when vault is configured and resolution fails. When a vault provider is active,
// secrets are resolved exclusively from the vault — no fallback to local values.
func ResolveSecretsWithError(ctx context.Context, provider SecretProvider, config VaultConfig, fields map[string]string) (map[string]string, error) {
	if provider == nil {
		return fields, nil
	}
	result := make(map[string]string, len(fields))
	// Build mapping: vault key -> field name
	vaultKeys := make([]string, 0, len(fields))
	vaultKeyToField := make(map[string]string, len(fields))
	for fieldName := range fields {
		vaultKey := fieldName
		if config.SecretMapping != nil {
			if mapped, ok := config.SecretMapping[fieldName]; ok && mapped != "" {
				vaultKey = mapped
			}
		}
		vaultKeys = append(vaultKeys, vaultKey)
		vaultKeyToField[vaultKey] = fieldName
	}
	vaultValues, err := provider.GetSecrets(ctx, vaultKeys)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrSecretResolveFailed, err)
	}
	for vaultKey, fieldName := range vaultKeyToField {
		if val, ok := vaultValues[vaultKey]; ok && val != "" {
			result[fieldName] = val
			backend.Logger.Error("DEBUG", "VAULT VALUE OF  "+fieldName, val)
		} else {
			return nil, fmt.Errorf("%w for field %s: not found", ErrSecretResolveFailed, fieldName)
		}
	}
	return result, nil
}
