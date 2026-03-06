package secretsmanager

import (
	"fmt"
	"testing"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore"
	"github.com/stretchr/testify/assert"
)

func TestValidateAzureKeyVaultURL_Valid(t *testing.T) {
	tests := []string{
		"https://my-vault.vault.azure.net/",
		"https://my-vault.vault.usgovcloudapi.net/",
		"https://my-vault.vault.azure.cn/",
	}
	for _, vaultURL := range tests {
		t.Run(vaultURL, func(t *testing.T) {
			err := validateAzureKeyVaultURL(vaultURL)
			assert.NoError(t, err)
		})
	}
}

func TestValidateAzureKeyVaultURL_Invalid(t *testing.T) {
	tests := []struct {
		name string
		url  string
	}{
		{name: "empty", url: ""},
		{name: "http scheme", url: "http://my-vault.vault.azure.net/"},
		{name: "non azure host", url: "https://example.com/"},
		{name: "query not allowed", url: "https://my-vault.vault.azure.net/?x=1"},
		{name: "fragment not allowed", url: "https://my-vault.vault.azure.net/#frag"},
		{name: "credentials not allowed", url: "https://user:pass@my-vault.vault.azure.net/"},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			err := validateAzureKeyVaultURL(tc.url)
			assert.Error(t, err)
		})
	}
}

func TestIsAzureKeyVaultNotFound(t *testing.T) {
	notFoundErr := &azcore.ResponseError{StatusCode: 404}
	unauthorizedErr := &azcore.ResponseError{StatusCode: 401}
	genericErr := fmt.Errorf("other error")

	assert.True(t, isAzureKeyVaultNotFound(notFoundErr))
	assert.False(t, isAzureKeyVaultNotFound(unauthorizedErr))
	assert.False(t, isAzureKeyVaultNotFound(genericErr))
}

func TestResponseStatusCode(t *testing.T) {
	assert.Equal(t, 403, responseStatusCode(&azcore.ResponseError{StatusCode: 403}))
	assert.Equal(t, 0, responseStatusCode(fmt.Errorf("other error")))
}
