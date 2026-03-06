package secretsmanager

import (
	"context"
	"sync"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

const (
	// DefaultCacheTTL is the default time-to-live for cached secrets.
	DefaultCacheTTL = 5 * time.Minute
	// MinCacheTTL prevents excessively aggressive refresh cycles.
	MinCacheTTL = 30 * time.Second
)

// cachedEntry holds a single cached secret value with its fetch timestamp.
type cachedEntry struct {
	value     string
	fetchedAt time.Time
}

// CachedSecretProvider wraps a SecretProvider and caches fetched secrets
// for a configurable TTL. When a cached secret expires, the next call to
// GetSecret or GetSecrets will fetch fresh values from the underlying provider.
//
// This is safe for concurrent use.
type CachedSecretProvider struct {
	inner SecretProvider
	ttl   time.Duration

	mu    sync.RWMutex
	cache map[string]cachedEntry

	// nowFunc allows injecting a clock for testing.
	nowFunc func() time.Time
}

// NewCachedSecretProvider wraps the given provider with a TTL-based cache.
// If ttl <= 0, DefaultCacheTTL is used. Values below MinCacheTTL are clamped.
func NewCachedSecretProvider(inner SecretProvider, ttl time.Duration) *CachedSecretProvider {
	if ttl <= 0 {
		ttl = DefaultCacheTTL
	}
	if ttl < MinCacheTTL {
		ttl = MinCacheTTL
	}
	return &CachedSecretProvider{
		inner:   inner,
		ttl:     ttl,
		cache:   make(map[string]cachedEntry),
		nowFunc: time.Now,
	}
}

// GetSecret returns a cached value if fresh, otherwise fetches from the
// underlying provider and updates the cache.
func (c *CachedSecretProvider) GetSecret(ctx context.Context, key string) (string, error) {
	if val, ok := c.getCached(key); ok {
		return val, nil
	}

	val, err := c.inner.GetSecret(ctx, key)
	if err != nil {
		return "", err
	}

	c.putCached(key, val)
	return val, nil
}

// GetSecrets returns cached values for keys that are still fresh, and fetches
// the remaining keys from the underlying provider in a single batch call.
func (c *CachedSecretProvider) GetSecrets(ctx context.Context, keys []string) (map[string]string, error) {
	result := make(map[string]string, len(keys))
	var staleKeys []string

	// Collect fresh cache hits
	c.mu.RLock()
	now := c.nowFunc()
	for _, key := range keys {
		if entry, ok := c.cache[key]; ok && now.Sub(entry.fetchedAt) < c.ttl {
			result[key] = entry.value
		} else {
			staleKeys = append(staleKeys, key)
		}
	}
	c.mu.RUnlock()

	if len(staleKeys) == 0 {
		return result, nil
	}

	// Fetch stale/missing keys from the underlying provider
	fetched, err := c.inner.GetSecrets(ctx, staleKeys)
	if err != nil {
		return nil, err
	}

	// Update cache and merge into result
	c.mu.Lock()
	fetchTime := c.nowFunc()
	for key, val := range fetched {
		c.cache[key] = cachedEntry{value: val, fetchedAt: fetchTime}
		result[key] = val
	}
	c.mu.Unlock()

	return result, nil
}

// TestConnection delegates to the underlying provider (no caching needed).
func (c *CachedSecretProvider) TestConnection(ctx context.Context) error {
	return c.inner.TestConnection(ctx)
}

// Provider returns the underlying provider type.
func (c *CachedSecretProvider) Provider() ProviderType {
	return c.inner.Provider()
}

// Invalidate removes a specific key from the cache, forcing a fresh fetch on
// the next access.
func (c *CachedSecretProvider) Invalidate(key string) {
	c.mu.Lock()
	delete(c.cache, key)
	c.mu.Unlock()
}

// InvalidateAll clears the entire cache.
func (c *CachedSecretProvider) InvalidateAll() {
	c.mu.Lock()
	c.cache = make(map[string]cachedEntry)
	c.mu.Unlock()
}

// RefreshAll proactively fetches all currently cached keys from the vault,
// replacing stale values. Useful for periodic background refresh.
func (c *CachedSecretProvider) RefreshAll(ctx context.Context) error {
	logger := log.DefaultLogger.FromContext(ctx)

	c.mu.RLock()
	keys := make([]string, 0, len(c.cache))
	for k := range c.cache {
		keys = append(keys, k)
	}
	c.mu.RUnlock()

	if len(keys) == 0 {
		return nil
	}

	fetched, err := c.inner.GetSecrets(ctx, keys)
	if err != nil {
		logger.Warn("failed to refresh cached secrets", "provider", c.inner.Provider(), "error", err.Error())
		return err
	}

	c.mu.Lock()
	fetchTime := c.nowFunc()
	for key, val := range fetched {
		c.cache[key] = cachedEntry{value: val, fetchedAt: fetchTime}
	}
	c.mu.Unlock()

	logger.Debug("refreshed cached secrets", "provider", c.inner.Provider(), "count", len(fetched))
	return nil
}

// getCached returns a cached value if it exists and hasn't expired.
func (c *CachedSecretProvider) getCached(key string) (string, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	entry, ok := c.cache[key]
	if !ok {
		return "", false
	}
	if c.nowFunc().Sub(entry.fetchedAt) >= c.ttl {
		return "", false
	}
	return entry.value, true
}

// putCached stores a value in the cache with the current timestamp.
func (c *CachedSecretProvider) putCached(key string, value string) {
	c.mu.Lock()
	c.cache[key] = cachedEntry{value: value, fetchedAt: c.nowFunc()}
	c.mu.Unlock()
}
