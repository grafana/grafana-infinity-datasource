---
name: debug-plugin
description: "Debug the Infinity datasource plugin frontend and/or backend. Use when: investigating runtime errors, query failures, HTTP client issues, UI rendering bugs, test failures, or unexpected data transformations."
argument-hint: "Description of the issue (e.g., 'JSON query returns empty data', 'config editor crashes on save', 'OAuth2 token not refreshing')"
---

# Debug Infinity Datasource Plugin

Systematic approach to debugging issues in the Grafana Infinity Datasource plugin across frontend (TypeScript/React) and backend (Go) codebases.

## When to Use

- Query returns unexpected/empty data
- Configuration editor UI crashes or behaves incorrectly
- HTTP requests fail or return errors
- Authentication doesn't work as expected
- Data parsing or transformation produces wrong results
- Test failures you need to diagnose
- Plugin health check fails

## Step 1: Classify the Issue

Determine which layer the issue is in:

| Symptom | Layer | Start at |
|---------|-------|----------|
| UI doesn't render / crashes | Frontend | Step 2 |
| Query editor doesn't save values | Frontend | Step 2 |
| "datasource error" in panel | Backend | Step 3 |
| Empty or malformed data frames | Backend | Step 3 |
| HTTP/auth errors in Grafana logs | Backend | Step 3 |
| Health check fails | Backend | Step 4 |
| Test failures | Either | Step 5 |
| Data looks wrong after parsing | Backend | Step 6 |

If unsure, check the **browser console** (frontend errors) and **Grafana server logs** (backend errors) first.

## Step 2: Debug Frontend Issues

### 2a. Set Up the Dev Environment

```bash
yarn dev          # Start webpack in watch mode (eval-source-map enabled)
docker-compose up # Start Grafana with the plugin mounted
```

The LiveReload plugin auto-refreshes the browser on code changes (port 35729).

### 2b. Inspect the Component Tree

Key entry points to trace through:

| Issue area | Start file | Key component |
|-----------|-----------|---------------|
| Query editor | `src/editors/query.editor.tsx` | `QueryEditor` |
| Config editor | `src/editors/config.editor.tsx` | `InfinityConfigEditor` |
| Query execution | `src/datasource.ts` | `Datasource` class |
| Type definitions | `src/types/query.types.ts` | Discriminated union types |

### 2c. Add Diagnostic Logging

In development mode, `console.log` and `console.info` are preserved (Terser only strips them in production). Add temporary logging:

```tsx
console.log('[DEBUG]', { query, options });
```

### 2d. Debug with Browser DevTools

1. Open Chrome DevTools → Sources tab
2. Source maps (`eval-source-map`) map back to original TypeScript files
3. Set breakpoints directly in `.tsx`/`.ts` sources under `webpack://`

### 2e. Run Frontend Tests for the Component

```bash
# Run tests for a specific file
yarn jest --testPathPattern="path/to/component.test.tsx"

# Run with verbose output
yarn jest --verbose --testPathPattern="path/to/component.test.tsx"

# Debug with Node inspector (attach VS Code or Chrome DevTools to localhost:9229)
node --inspect-brk node_modules/.bin/jest --runInBand --testPathPattern="component.test.tsx"
```

### 2f. Type-Check

```bash
yarn typecheck    # Full TypeScript type checking
```

Query types use discriminated unions — if the wrong branch is matched, fields will be missing. Check that `query.type` matches the expected `InfinityQueryType`.

## Step 3: Debug Backend Issues

### 3a. Check Grafana Logs

With Docker running, plugin-level debug logs are enabled:

```yaml
GF_LOG_LEVEL: debug
GF_LOG_FILTERS: plugin.yesoreyeram-infinity-datasource:debug
```

Look for log lines with `logger=plugin.yesoreyeram-infinity-datasource`.

### 3b. Trace the Query Path

Query execution flows through these files in order:

1. `pkg/pluginhost/handler_querydata.go` — Entry point, concurrent query dispatch
2. `pkg/models/query.go` → `LoadQuery()` — Deserializes and validates the query JSON
3. `pkg/infinity/client.go` — `Client` struct, dispatches to format-specific handlers
4. `pkg/infinity/remote.go` — HTTP request execution
5. `pkg/infinity/{jsonBackend,csvBackend,xmlBackend}.go` — Format-specific parsing
6. `pkg/infinity/postprocess.go` — Computed columns, filters, summarize
7. `pkg/dataplane/dataplane.go` — Converts to Grafana data frames

### 3c. Use VS Code Go Debugger (Standalone Mode)

The quickest way to debug backend logic:

1. Open VS Code
2. Use the **"Run standalone plugin"** launch configuration (`.vscode/launch.json`)
3. Set breakpoints in the handler or client code
4. The plugin runs with `--standalone=true` — no Docker needed

### 3d. Use Delve Remote Debugging (Docker Mode)

For debugging in a full Grafana environment:

1. Run `docker-compose up` (uses the scaffolded `.config/` setup)
2. Delve listens on **port 2345** (headless, auto-continue)
3. Attach VS Code debugger to `localhost:2345`
4. The `mage-watcher` auto-rebuilds Go on source changes; `build-watcher` restarts Delve

### 3e. Add Structured Logging

Use the context-aware logger throughout Go code:

```go
logger := backend.Logger.FromContext(ctx)
logger.Debug("debugging query", "type", query.Type, "source", query.Source, "url", query.URL)
```

### 3f. Check OpenTelemetry Traces

If Tempo is running (via `docker-compose.yaml`):

1. Open Grafana → Explore → Select Tempo datasource
2. Search for traces from `yesoreyeram-infinity-datasource`
3. Each `QueryData` call creates a span with query attributes

Traces are sent via OTLP gRPC to Tempo on port 4317.

### 3g. Run Backend Tests

```bash
go test -v ./pkg/...                        # All tests, verbose
go test -v -run TestFunctionName ./pkg/models/  # Single test
go test -v -count=1 ./...                   # Skip test cache
```

## Step 4: Debug Health Check Failures

Health check is implemented in `pkg/pluginhost/handler_checkhealth.go`.

1. Check which auth type is configured — some have dedicated health checks:
   - Azure Blob: `handler_checkhealth_azblob.go`
   - Others: Generic HTTP connectivity check
2. Look for validation errors from `pkg/models/settings.go` → `Validate()`
3. Check that `secureJsonData` fields are properly decrypted (secrets must use `DecryptedSecureJSONData`)

## Step 5: Debug Test Failures

### Frontend Test Failures

```bash
# Run failing test with full output
yarn jest --verbose --no-coverage --testPathPattern="failing.test.tsx"

# Check if the issue is a mock problem
# Common causes:
# - Missing react-router-dom / @grafana/ui Link mock
# - Stale jest.fn() mocks (add jest.clearAllMocks() in beforeEach)
# - Props mutation (use Object.freeze() on mock data)
# - Async timing (wrap assertions in waitFor())
```

### Backend Test Failures

```bash
# Run with verbose and race detection
go test -v -race -run TestName ./pkg/path/

# Check if it's a golden file mismatch
# Golden files are in pkg/testsuite/golden/*.jsonc
# Set UPDATE_GOLDEN_DATA=true to regenerate
```

## Step 6: Debug Data Parsing Issues

When query returns data but it looks wrong:

1. **Check the raw response** — Add logging in `pkg/infinity/remote.go` to see the actual HTTP response body
2. **Check root_selector** — For JSON/XML, verify the JSONPath/XPath expression matches the response structure
3. **Check column definitions** — Verify `columns` array in the query has correct selectors and types
4. **Check post-processing** — Computed columns, filters, and summarize operations in `pkg/infinity/postprocess.go`
5. **Check data frame conversion** — The `pkg/dataplane/` package converts parsed data to Grafana frames

### Format-Specific Tips

| Format | Parser file | Common issues |
|--------|------------|---------------|
| JSON | `jsonBackend.go` | Wrong `root_selector`, nested arrays |
| CSV/TSV | `csvBackend.go` | Header detection, delimiter mismatch |
| XML | `xmlBackend.go` | Namespace prefixes, attribute selectors |
| HTML | `xmlBackend.go` | Selector doesn't match rendered DOM |
| GraphQL | `jsonBackend.go` | Query syntax, variables not interpolated |

## Step 7: Debug HTTP/Auth Issues

1. **Enable data proxy logging** — Set `GF_DATAPROXY_LOGGING=1` in docker-compose
2. **Check request headers** — Add logging in `pkg/infinity/headers.go` or `pkg/infinity/request.go`
3. **Check TLS** — TLS settings are in `pkg/httpclient/tls.go`; verify cert paths and options
4. **Check OAuth2** — Token refresh logic is in `pkg/httpclient/oauth2.go`
5. **Check allowed hosts** — `pkg/models/settings.go` → `DoesAllowedHostsRequired()` may block requests

## Verification Checklist

Before concluding the debug session:

- [ ] Root cause identified and understood
- [ ] Fix applied and tested locally
- [ ] `yarn typecheck` passes (if frontend changes)
- [ ] `yarn lint` passes (if frontend changes)
- [ ] `go test ./...` passes (if backend changes)
- [ ] Temporary debug logging removed
- [ ] Changeset created if this is a bug fix (`yarn changeset`)

## File Quick Reference

| Area | Key files |
|------|-----------|
| Query execution entry | `pkg/pluginhost/handler_querydata.go` |
| Query model & validation | `pkg/models/query.go` |
| Settings & auth config | `pkg/models/settings.go` |
| HTTP client & auth | `pkg/httpclient/httpclient.go`, `pkg/infinity/client.go` |
| Request building | `pkg/infinity/request.go`, `pkg/infinity/headers.go` |
| Response parsing | `pkg/infinity/{json,csv,xml}Backend.go` |
| Post-processing | `pkg/infinity/postprocess.go` |
| Data frame output | `pkg/dataplane/dataplane.go` |
| Frontend datasource | `src/datasource.ts` |
| Query editor | `src/editors/query.editor.tsx` |
| Config editor | `src/editors/config.editor.tsx` |
| Debug launch config | `.vscode/launch.json` |
| Docker debug setup | `docker-compose.yaml`, `.config/docker-compose-base.yaml` |
