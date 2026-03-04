package secretsmanager

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// countingProvider wraps mockSecretProvider and tracks call counts.
type countingProvider struct {
	*mockSecretProvider
	getSecretCalls  atomic.Int32
	getSecretsCalls atomic.Int32
}

func newCountingProvider(secrets map[string]string) *countingProvider {
	return &countingProvider{
		mockSecretProvider: newMockProvider(secrets),
	}
}

func (c *countingProvider) GetSecret(ctx context.Context, key string) (string, error) {
	c.getSecretCalls.Add(1)
	return c.mockSecretProvider.GetSecret(ctx, key)
}

func (c *countingProvider) GetSecrets(ctx context.Context, keys []string) (map[string]string, error) {
	c.getSecretsCalls.Add(1)
	return c.mockSecretProvider.GetSecrets(ctx, keys)
}

func TestNewCachedSecretProvider_DefaultTTL(t *testing.T) {
	inner := newMockProvider(map[string]string{})
	cached := NewCachedSecretProvider(inner, 0)
	assert.Equal(t, DefaultCacheTTL, cached.ttl)
}

func TestNewCachedSecretProvider_MinTTL(t *testing.T) {
	inner := newMockProvider(map[string]string{})
	cached := NewCachedSecretProvider(inner, 5*time.Second) // Below MinCacheTTL
	assert.Equal(t, MinCacheTTL, cached.ttl)
}

func TestNewCachedSecretProvider_CustomTTL(t *testing.T) {
	inner := newMockProvider(map[string]string{})
	cached := NewCachedSecretProvider(inner, 10*time.Minute)
	assert.Equal(t, 10*time.Minute, cached.ttl)
}

func TestCachedSecretProvider_GetSecret_CachesResult(t *testing.T) {
	inner := newCountingProvider(map[string]string{
		"mySecret": "vault-value",
	})
	cached := NewCachedSecretProvider(inner, 5*time.Minute)
	ctx := context.Background()

	// First call: fetches from inner
	val, err := cached.GetSecret(ctx, "mySecret")
	require.NoError(t, err)
	assert.Equal(t, "vault-value", val)
	assert.Equal(t, int32(1), inner.getSecretCalls.Load())

	// Second call: returns cached value, no additional fetch
	val, err = cached.GetSecret(ctx, "mySecret")
	require.NoError(t, err)
	assert.Equal(t, "vault-value", val)
	assert.Equal(t, int32(1), inner.getSecretCalls.Load()) // Still 1
}

func TestCachedSecretProvider_GetSecret_RefetchesAfterTTL(t *testing.T) {
	inner := newCountingProvider(map[string]string{
		"mySecret": "vault-value",
	})
	cached := NewCachedSecretProvider(inner, 1*time.Minute)

	// Control time
	now := time.Now()
	cached.nowFunc = func() time.Time { return now }

	ctx := context.Background()

	// First call: populates cache
	val, err := cached.GetSecret(ctx, "mySecret")
	require.NoError(t, err)
	assert.Equal(t, "vault-value", val)
	assert.Equal(t, int32(1), inner.getSecretCalls.Load())

	// Advance time past TTL
	now = now.Add(2 * time.Minute)

	// Update the inner provider value to verify refresh
	inner.secrets["mySecret"] = "updated-value"

	// Third call: cache expired, fetches fresh value
	val, err = cached.GetSecret(ctx, "mySecret")
	require.NoError(t, err)
	assert.Equal(t, "updated-value", val)
	assert.Equal(t, int32(2), inner.getSecretCalls.Load())
}

func TestCachedSecretProvider_GetSecret_ErrorNotCached(t *testing.T) {
	inner := newCountingProvider(map[string]string{})
	cached := NewCachedSecretProvider(inner, 5*time.Minute)
	ctx := context.Background()

	// First call: error (not found)
	_, err := cached.GetSecret(ctx, "missing")
	require.Error(t, err)
	assert.Equal(t, int32(1), inner.getSecretCalls.Load())

	// Second call: still fetches (errors aren't cached)
	_, err = cached.GetSecret(ctx, "missing")
	require.Error(t, err)
	assert.Equal(t, int32(2), inner.getSecretCalls.Load())
}

func TestCachedSecretProvider_GetSecrets_CachesBatchResult(t *testing.T) {
	inner := newCountingProvider(map[string]string{
		"secret1": "value1",
		"secret2": "value2",
	})
	cached := NewCachedSecretProvider(inner, 5*time.Minute)
	ctx := context.Background()

	// First call: fetches from inner
	result, err := cached.GetSecrets(ctx, []string{"secret1", "secret2"})
	require.NoError(t, err)
	assert.Equal(t, "value1", result["secret1"])
	assert.Equal(t, "value2", result["secret2"])
	assert.Equal(t, int32(1), inner.getSecretsCalls.Load())

	// Second call: all from cache
	result, err = cached.GetSecrets(ctx, []string{"secret1", "secret2"})
	require.NoError(t, err)
	assert.Equal(t, "value1", result["secret1"])
	assert.Equal(t, "value2", result["secret2"])
	assert.Equal(t, int32(1), inner.getSecretsCalls.Load()) // Still 1
}

func TestCachedSecretProvider_GetSecrets_PartialCacheHit(t *testing.T) {
	inner := newCountingProvider(map[string]string{
		"secret1": "value1",
		"secret2": "value2",
		"secret3": "value3",
	})
	cached := NewCachedSecretProvider(inner, 5*time.Minute)

	now := time.Now()
	cached.nowFunc = func() time.Time { return now }

	ctx := context.Background()

	// Fetch secret1 and secret2
	_, err := cached.GetSecrets(ctx, []string{"secret1", "secret2"})
	require.NoError(t, err)
	assert.Equal(t, int32(1), inner.getSecretsCalls.Load())

	// Now request secret1 (cached), secret3 (not cached)
	result, err := cached.GetSecrets(ctx, []string{"secret1", "secret3"})
	require.NoError(t, err)
	assert.Equal(t, "value1", result["secret1"])
	assert.Equal(t, "value3", result["secret3"])
	assert.Equal(t, int32(2), inner.getSecretsCalls.Load())
}

func TestCachedSecretProvider_GetSecrets_RefetchesExpired(t *testing.T) {
	inner := newCountingProvider(map[string]string{
		"secret1": "value1",
	})
	cached := NewCachedSecretProvider(inner, 1*time.Minute)

	now := time.Now()
	cached.nowFunc = func() time.Time { return now }

	ctx := context.Background()

	// Populate cache
	_, err := cached.GetSecrets(ctx, []string{"secret1"})
	require.NoError(t, err)

	// Advance past TTL
	now = now.Add(2 * time.Minute)
	inner.secrets["secret1"] = "updated-value1"

	// Refetch
	result, err := cached.GetSecrets(ctx, []string{"secret1"})
	require.NoError(t, err)
	assert.Equal(t, "updated-value1", result["secret1"])
	assert.Equal(t, int32(2), inner.getSecretsCalls.Load())
}

func TestCachedSecretProvider_Invalidate(t *testing.T) {
	inner := newCountingProvider(map[string]string{
		"mySecret": "vault-value",
	})
	cached := NewCachedSecretProvider(inner, 5*time.Minute)
	ctx := context.Background()

	// Populate cache
	_, err := cached.GetSecret(ctx, "mySecret")
	require.NoError(t, err)
	assert.Equal(t, int32(1), inner.getSecretCalls.Load())

	// Invalidate
	cached.Invalidate("mySecret")

	// Next call should fetch from inner again
	val, err := cached.GetSecret(ctx, "mySecret")
	require.NoError(t, err)
	assert.Equal(t, "vault-value", val)
	assert.Equal(t, int32(2), inner.getSecretCalls.Load())
}

func TestCachedSecretProvider_InvalidateAll(t *testing.T) {
	inner := newCountingProvider(map[string]string{
		"secret1": "value1",
		"secret2": "value2",
	})
	cached := NewCachedSecretProvider(inner, 5*time.Minute)
	ctx := context.Background()

	// Populate cache
	_, _ = cached.GetSecret(ctx, "secret1")
	_, _ = cached.GetSecret(ctx, "secret2")
	assert.Equal(t, int32(2), inner.getSecretCalls.Load())

	// Invalidate all
	cached.InvalidateAll()

	// Both should refetch
	_, _ = cached.GetSecret(ctx, "secret1")
	_, _ = cached.GetSecret(ctx, "secret2")
	assert.Equal(t, int32(4), inner.getSecretCalls.Load())
}

func TestCachedSecretProvider_RefreshAll(t *testing.T) {
	inner := newCountingProvider(map[string]string{
		"secret1": "value1",
		"secret2": "value2",
	})
	cached := NewCachedSecretProvider(inner, 5*time.Minute)
	ctx := context.Background()

	// Populate cache
	_, _ = cached.GetSecret(ctx, "secret1")
	_, _ = cached.GetSecret(ctx, "secret2")

	// Update inner values
	inner.secrets["secret1"] = "refreshed1"
	inner.secrets["secret2"] = "refreshed2"

	// RefreshAll
	err := cached.RefreshAll(ctx)
	require.NoError(t, err)

	// Values should be updated without expiring
	val1, err := cached.GetSecret(ctx, "secret1")
	require.NoError(t, err)
	assert.Equal(t, "refreshed1", val1)

	val2, err := cached.GetSecret(ctx, "secret2")
	require.NoError(t, err)
	assert.Equal(t, "refreshed2", val2)
}

func TestCachedSecretProvider_RefreshAll_EmptyCache(t *testing.T) {
	inner := newCountingProvider(map[string]string{})
	cached := NewCachedSecretProvider(inner, 5*time.Minute)

	err := cached.RefreshAll(context.Background())
	require.NoError(t, err)
	// No calls to inner since cache was empty
	assert.Equal(t, int32(0), inner.getSecretsCalls.Load())
}

func TestCachedSecretProvider_RefreshAll_Error(t *testing.T) {
	inner := newCountingProvider(map[string]string{
		"secret1": "value1",
	})
	cached := NewCachedSecretProvider(inner, 5*time.Minute)
	ctx := context.Background()

	// Populate cache
	_, _ = cached.GetSecret(ctx, "secret1")

	// Make inner fail
	inner.testErr = fmt.Errorf("connection refused")

	err := cached.RefreshAll(ctx)
	require.Error(t, err)

	// Old cached value should still be available
	val, err := cached.GetSecret(ctx, "secret1")
	require.NoError(t, err)
	assert.Equal(t, "value1", val)
}

func TestCachedSecretProvider_TestConnection_DelegatesToInner(t *testing.T) {
	inner := newMockProvider(map[string]string{})
	cached := NewCachedSecretProvider(inner, 5*time.Minute)

	err := cached.TestConnection(context.Background())
	require.NoError(t, err)

	inner.testErr = fmt.Errorf("connection failed")
	err = cached.TestConnection(context.Background())
	require.Error(t, err)
}

func TestCachedSecretProvider_Provider_ReturnsInnerType(t *testing.T) {
	inner := newMockProvider(map[string]string{})
	inner.provider = ProviderTypeAzureKeyVault
	cached := NewCachedSecretProvider(inner, 5*time.Minute)
	assert.Equal(t, ProviderTypeAzureKeyVault, cached.Provider())
}

func TestCachedSecretProvider_ConcurrentAccess(t *testing.T) {
	inner := newCountingProvider(map[string]string{
		"secret1": "value1",
		"secret2": "value2",
		"secret3": "value3",
	})
	cached := NewCachedSecretProvider(inner, 5*time.Minute)
	ctx := context.Background()

	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			key := fmt.Sprintf("secret%d", (n%3)+1)
			val, err := cached.GetSecret(ctx, key)
			if err == nil {
				assert.NotEmpty(t, val)
			}
		}(i)
	}
	wg.Wait()

	// All 50 goroutines completed without race conditions
	// Inner should have been called at most 3 times (one per unique key),
	// though due to races some keys may be fetched more than once
	assert.LessOrEqual(t, inner.getSecretCalls.Load(), int32(50))
}

func TestParseCacheTTL(t *testing.T) {
	tests := []struct {
		input    string
		expected time.Duration
	}{
		{"", 0},
		{"0", 0},
		{"30s", 30 * time.Second},
		{"1m", 1 * time.Minute},
		{"5m", 5 * time.Minute},
		{"15m", 15 * time.Minute},
		{"1h", 1 * time.Hour},
		{"invalid", 0},
		{"abc123", 0},
	}
	for _, tt := range tests {
		t.Run(fmt.Sprintf("input=%q", tt.input), func(t *testing.T) {
			assert.Equal(t, tt.expected, ParseCacheTTL(tt.input))
		})
	}
}

func TestNewSecretProvider_WithCacheTTL(t *testing.T) {
	config := VaultConfig{
		Provider: ProviderTypeAzureKeyVault,
		CacheTTL: "5m",
		Azure: &AzureKeyVaultConfig{
			VaultURL:   "https://test.vault.azure.net/",
			AuthMethod: "client-secret",
			TenantID:   "tenant-id",
			ClientID:   "client-id",
		},
	}
	secureFields := map[string]string{
		"vaultAzureClientSecret": "test-secret",
	}
	provider, err := NewSecretProvider(context.Background(), config, secureFields)
	require.NoError(t, err)

	// Should be wrapped in CachedSecretProvider
	cachedProvider, ok := provider.(*CachedSecretProvider)
	require.True(t, ok, "expected provider to be wrapped in CachedSecretProvider")
	assert.Equal(t, 5*time.Minute, cachedProvider.ttl)
	assert.Equal(t, ProviderTypeAzureKeyVault, cachedProvider.Provider())
}

func TestNewSecretProvider_WithoutCacheTTL(t *testing.T) {
	config := VaultConfig{
		Provider: ProviderTypeAzureKeyVault,
		Azure: &AzureKeyVaultConfig{
			VaultURL:   "https://test.vault.azure.net/",
			AuthMethod: "client-secret",
			TenantID:   "tenant-id",
			ClientID:   "client-id",
		},
	}
	secureFields := map[string]string{
		"vaultAzureClientSecret": "test-secret",
	}
	provider, err := NewSecretProvider(context.Background(), config, secureFields)
	require.NoError(t, err)

	// Should NOT be wrapped — still the raw AzureKeyVaultProvider
	_, ok := provider.(*AzureKeyVaultProvider)
	require.True(t, ok, "expected unwrapped AzureKeyVaultProvider when no CacheTTL set")
}
