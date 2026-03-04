package secretsmanager

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azsecrets"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

// AzureKeyVaultProvider implements SecretProvider for Azure Key Vault.
type AzureKeyVaultProvider struct {
	client *azsecrets.Client
	config AzureKeyVaultConfig
}

// NewAzureKeyVaultProvider creates a new Azure Key Vault secret provider.
// It supports two authentication methods:
//   - "client-secret": Uses a service principal with client ID, tenant ID, and client secret.
//   - "managed-identity": Uses Azure Managed Identity (no credentials needed, works on Azure-hosted VMs/containers).
func NewAzureKeyVaultProvider(ctx context.Context, config AzureKeyVaultConfig, clientSecret string) (*AzureKeyVaultProvider, error) {
	if err := validateAzureKeyVaultURL(config.VaultURL); err != nil {
		return nil, err
	}

	var client *azsecrets.Client
	var err error

	switch config.AuthMethod {
	case "client-secret":
		if config.TenantID == "" || config.ClientID == "" || clientSecret == "" {
			return nil, fmt.Errorf("tenantId, clientId, and clientSecret are required for client-secret authentication")
		}
		cred, credErr := azidentity.NewClientSecretCredential(config.TenantID, config.ClientID, clientSecret, nil)
		if credErr != nil {
			return nil, fmt.Errorf("failed to create Azure client secret credential: %w", credErr)
		}
		client, err = azsecrets.NewClient(config.VaultURL, cred, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create Azure Key Vault client: %w", err)
		}

	case "managed-identity":
		cred, credErr := azidentity.NewManagedIdentityCredential(nil)
		if credErr != nil {
			return nil, fmt.Errorf("failed to create Azure managed identity credential: %w", credErr)
		}
		client, err = azsecrets.NewClient(config.VaultURL, cred, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create Azure Key Vault client: %w", err)
		}

	default:
		return nil, fmt.Errorf("unsupported Azure Key Vault auth method: %s (supported: client-secret, managed-identity)", config.AuthMethod)
	}

	return &AzureKeyVaultProvider{
		client: client,
		config: config,
	}, nil
}

// GetSecret retrieves a single secret from Azure Key Vault.
func (p *AzureKeyVaultProvider) GetSecret(ctx context.Context, key string) (string, error) {
	logger := log.DefaultLogger.FromContext(ctx)
	resp, err := p.client.GetSecret(ctx, key, "", nil)
	if err != nil {
		if isAzureKeyVaultNotFound(err) {
			return "", fmt.Errorf("%w", ErrSecretNotFound)
		}
		logger.Warn("azure key vault secret lookup failed", "provider", "azure-keyvault", "statusCode", responseStatusCode(err))
		return "", fmt.Errorf("failed to retrieve secret from Azure Key Vault: %w", err)
	}
	if resp.Value == nil {
		return "", fmt.Errorf("%w", ErrSecretNotFound)
	}
	return *resp.Value, nil
}

// GetSecrets retrieves multiple secrets from Azure Key Vault.
// It fetches each secret individually (Azure Key Vault doesn't support batch gets).
// Secrets that are not found are silently omitted from the result.
func (p *AzureKeyVaultProvider) GetSecrets(ctx context.Context, keys []string) (map[string]string, error) {
	logger := log.DefaultLogger.FromContext(ctx)
	results := make(map[string]string, len(keys))

	for _, key := range keys {
		val, err := p.GetSecret(ctx, key)
		if err != nil {
			if errors.Is(err, ErrSecretNotFound) {
				continue
			}
			logger.Warn("azure key vault batch secret lookup failed", "provider", "azure-keyvault")
			return nil, err
		}
		results[key] = val
	}

	return results, nil
}

// TestConnection verifies connectivity to Azure Key Vault by listing secrets (with a page size of 1).
func (p *AzureKeyVaultProvider) TestConnection(ctx context.Context) error {
	pager := p.client.NewListSecretPropertiesPager(nil)
	if pager.More() {
		_, err := pager.NextPage(ctx)
		if err != nil {
			return fmt.Errorf("failed to connect to Azure Key Vault at %s: %w", p.config.VaultURL, err)
		}
	}
	return nil
}

// Provider returns the provider type.
func (p *AzureKeyVaultProvider) Provider() ProviderType {
	return ProviderTypeAzureKeyVault
}

func validateAzureKeyVaultURL(vaultURL string) error {
	vaultURL = strings.TrimSpace(vaultURL)
	if vaultURL == "" {
		return fmt.Errorf("azure key vault URL is required")
	}
	u, err := url.Parse(vaultURL)
	if err != nil {
		return fmt.Errorf("invalid azure key vault URL: %w", err)
	}
	if !strings.EqualFold(u.Scheme, "https") {
		return fmt.Errorf("azure key vault URL must use https")
	}
	if u.Host == "" {
		return fmt.Errorf("azure key vault URL host is required")
	}
	if u.User != nil {
		return fmt.Errorf("azure key vault URL must not contain credentials")
	}
	if u.RawQuery != "" || u.Fragment != "" {
		return fmt.Errorf("azure key vault URL must not contain query or fragment")
	}
	host := strings.ToLower(u.Hostname())
	if !(strings.HasSuffix(host, ".vault.azure.net") || strings.HasSuffix(host, ".vault.usgovcloudapi.net") || strings.HasSuffix(host, ".vault.azure.cn")) {
		return fmt.Errorf("azure key vault URL host is invalid")
	}
	return nil
}

func isAzureKeyVaultNotFound(err error) bool {
	var responseErr *azcore.ResponseError
	if errors.As(err, &responseErr) {
		return responseErr.StatusCode == 404
	}
	return false
}

func responseStatusCode(err error) int {
	var responseErr *azcore.ResponseError
	if errors.As(err, &responseErr) {
		return responseErr.StatusCode
	}
	return 0
}
