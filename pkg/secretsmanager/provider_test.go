package secretsmanager

import (
	"context"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// mockSecretProvider is a test double for SecretProvider.
type mockSecretProvider struct {
	secrets  map[string]string
	provider ProviderType
	testErr  error
}

func newMockProvider(secrets map[string]string) *mockSecretProvider {
	return &mockSecretProvider{
		secrets:  secrets,
		provider: "mock",
	}
}

func (m *mockSecretProvider) GetSecret(ctx context.Context, key string) (string, error) {
	val, ok := m.secrets[key]
	if !ok {
		return "", fmt.Errorf("%w: %s", ErrSecretNotFound, key)
	}
	return val, nil
}

func (m *mockSecretProvider) GetSecrets(ctx context.Context, keys []string) (map[string]string, error) {
	if m.testErr != nil {
		return nil, m.testErr
	}
	result := make(map[string]string)
	for _, k := range keys {
		if val, ok := m.secrets[k]; ok {
			result[k] = val
		}
	}
	return result, nil
}

func (m *mockSecretProvider) TestConnection(ctx context.Context) error {
	return m.testErr
}

func (m *mockSecretProvider) Provider() ProviderType {
	return m.provider
}

func TestResolveSecret_NilProvider(t *testing.T) {
	// When provider is nil, should return local value
	result, err := ResolveSecretWithError(context.Background(), nil, VaultConfig{}, "bearerToken", "local-value")
	require.NoError(t, err)
	assert.Equal(t, "local-value", result)
}

func TestResolveSecret_VaultHasValue(t *testing.T) {
	provider := newMockProvider(map[string]string{
		"bearerToken": "vault-value",
	})
	result, err := ResolveSecretWithError(context.Background(), provider, VaultConfig{}, "bearerToken", "local-value")
	require.NoError(t, err)
	assert.Equal(t, "vault-value", result)
}

func TestResolveSecret_VaultMissing_ReturnsError(t *testing.T) {
	provider := newMockProvider(map[string]string{})
	_, err := ResolveSecretWithError(context.Background(), provider, VaultConfig{}, "bearerToken", "local-value")
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrSecretResolveFailed)
}

func TestResolveSecret_WithSecretMapping(t *testing.T) {
	provider := newMockProvider(map[string]string{
		"my-custom-token": "mapped-vault-value",
	})
	config := VaultConfig{
		SecretMapping: map[string]string{
			"bearerToken": "my-custom-token",
		},
	}
	result, err := ResolveSecretWithError(context.Background(), provider, config, "bearerToken", "local-value")
	require.NoError(t, err)
	assert.Equal(t, "mapped-vault-value", result)
}

func TestResolveSecret_MappingEmpty_UsesFieldName(t *testing.T) {
	provider := newMockProvider(map[string]string{
		"bearerToken": "vault-value",
	})
	config := VaultConfig{
		SecretMapping: map[string]string{
			"bearerToken": "", // empty mapping
		},
	}
	result, err := ResolveSecretWithError(context.Background(), provider, config, "bearerToken", "local-value")
	require.NoError(t, err)
	assert.Equal(t, "vault-value", result)
}

func TestResolveSecrets_NilProvider(t *testing.T) {
	fields := map[string]string{
		"bearerToken": "local-bearer",
		"apiKeyValue": "local-api-key",
	}
	result, err := ResolveSecretsWithError(context.Background(), nil, VaultConfig{}, fields)
	require.NoError(t, err)
	assert.Equal(t, fields, result)
}

func TestResolveSecrets_VaultResolvesAll(t *testing.T) {
	provider := newMockProvider(map[string]string{
		"bearerToken": "vault-bearer",
		"apiKeyValue": "vault-api-key",
	})
	fields := map[string]string{
		"bearerToken": "local-bearer",
		"apiKeyValue": "local-api-key",
	}
	result, err := ResolveSecretsWithError(context.Background(), provider, VaultConfig{}, fields)
	require.NoError(t, err)
	assert.Equal(t, "vault-bearer", result["bearerToken"])
	assert.Equal(t, "vault-api-key", result["apiKeyValue"])
}

func TestResolveSecrets_PartialVault_ReturnsError(t *testing.T) {
	provider := newMockProvider(map[string]string{
		"bearerToken": "vault-bearer",
		// apiKeyValue not in vault — should fail since no fallback
	})
	fields := map[string]string{
		"bearerToken": "local-bearer",
		"apiKeyValue": "local-api-key",
	}
	_, err := ResolveSecretsWithError(context.Background(), provider, VaultConfig{}, fields)
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrSecretResolveFailed)
}

func TestResolveSecrets_VaultError_ReturnsError(t *testing.T) {
	provider := newMockProvider(map[string]string{})
	provider.testErr = fmt.Errorf("connection refused")
	fields := map[string]string{
		"bearerToken": "local-bearer",
	}
	_, err := ResolveSecretsWithError(context.Background(), provider, VaultConfig{}, fields)
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrSecretResolveFailed)
}

func TestResolveSecrets_WithMapping(t *testing.T) {
	provider := newMockProvider(map[string]string{
		"my-bearer":  "vault-bearer",
		"my-api-key": "vault-api-key",
	})
	config := VaultConfig{
		SecretMapping: map[string]string{
			"bearerToken": "my-bearer",
			"apiKeyValue": "my-api-key",
		},
	}
	fields := map[string]string{
		"bearerToken": "local-bearer",
		"apiKeyValue": "local-api-key",
	}
	result, err := ResolveSecretsWithError(context.Background(), provider, config, fields)
	require.NoError(t, err)
	assert.Equal(t, "vault-bearer", result["bearerToken"])
	assert.Equal(t, "vault-api-key", result["apiKeyValue"])
}

func TestNewSecretProvider_None(t *testing.T) {
	_, err := NewSecretProvider(context.Background(), VaultConfig{Provider: ProviderTypeNone}, nil)
	require.ErrorIs(t, err, ErrProviderNotConfigured)
}

func TestNewSecretProvider_Empty(t *testing.T) {
	_, err := NewSecretProvider(context.Background(), VaultConfig{}, nil)
	require.ErrorIs(t, err, ErrProviderNotConfigured)
}

func TestNewSecretProvider_Unsupported(t *testing.T) {
	_, err := NewSecretProvider(context.Background(), VaultConfig{Provider: "unknown-vault"}, nil)
	require.ErrorIs(t, err, ErrUnsupportedProvider)
}

func TestNewSecretProvider_AzureKeyVault_MissingConfig(t *testing.T) {
	_, err := NewSecretProvider(context.Background(), VaultConfig{Provider: ProviderTypeAzureKeyVault}, nil)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "azure key vault configuration is required")
}

func TestNewSecretProvider_AzureKeyVault_MissingCredentials(t *testing.T) {
	config := VaultConfig{
		Provider: ProviderTypeAzureKeyVault,
		Azure: &AzureKeyVaultConfig{
			VaultURL:   "https://test.vault.azure.net/",
			AuthMethod: "client-secret",
			TenantID:   "tenant-id",
			ClientID:   "client-id",
			// clientSecret missing
		},
	}
	_, err := NewSecretProvider(context.Background(), config, map[string]string{})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "tenantId, clientId, and clientSecret are required")
}

func TestNewSecretProvider_AzureKeyVault_MissingVaultURL(t *testing.T) {
	config := VaultConfig{
		Provider: ProviderTypeAzureKeyVault,
		Azure: &AzureKeyVaultConfig{
			VaultURL:   "",
			AuthMethod: "client-secret",
		},
	}
	_, err := NewSecretProvider(context.Background(), config, map[string]string{
		"vaultAzureClientSecret": "secret",
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "azure key vault URL is required")
}

func TestNewSecretProvider_AzureKeyVault_UnsupportedAuthMethod(t *testing.T) {
	config := VaultConfig{
		Provider: ProviderTypeAzureKeyVault,
		Azure: &AzureKeyVaultConfig{
			VaultURL:   "https://test.vault.azure.net/",
			AuthMethod: "unknown-method",
		},
	}
	_, err := NewSecretProvider(context.Background(), config, map[string]string{})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "unsupported Azure Key Vault auth method")
}
