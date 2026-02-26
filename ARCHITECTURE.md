# Architecture Analysis & Modular Decomposition

This document analyzes the Grafana Infinity Datasource plugin architecture, identifies anti-patterns and coupling issues, and proposes a modular decomposition with clear layer boundaries.

## Table of Contents

- [Current Architecture Overview](#current-architecture-overview)
- [Identified Anti-Patterns](#identified-anti-patterns)
- [Coupling Issues](#coupling-issues)
- [Potential Failure Points](#potential-failure-points)
- [Proposed Modular Decomposition](#proposed-modular-decomposition)
- [Introduced Interfaces](#introduced-interfaces)

---

## Current Architecture Overview

The plugin has two main components:

### Backend (Go — `pkg/`)

| Package | Purpose |
|---------|---------|
| `pluginhost/` | Grafana plugin SDK integration — query, health check, resource handlers |
| `infinity/` | Core data processing — HTTP requests, parsing (JSON/CSV/XML), pagination, post-processing |
| `models/` | Shared data types — query models, settings, macros, errors |
| `httpclient/` | HTTP client construction with TLS, OAuth2, AWS auth, proxy support |
| `dataplane/` | Data plane type detection |

### Frontend (TypeScript — `src/`)

| Directory | Purpose |
|-----------|---------|
| `app/` | Data providers and parsers (JSON, CSV, XML, HTML) |
| `editors/` | React UI components for query/config editing |
| `components/` | Reusable UI components |
| `types/` | TypeScript type definitions |

---

## Identified Anti-Patterns

### 1. God Function: `QueryDataQuery` (`pluginhost/handler_querydata.go`)

The `QueryDataQuery` function (88–210) handles 8+ responsibilities in a single function:
- Query telemetry/logging
- Google Sheets special-case handling
- URL source frame building with validation
- Inline source frame building
- Three different parser dispatches (JSON, CSV, XML)
- Security checks (unsecured query handling, allowed hosts)
- Error wrapping with error-source classification
- Metadata attachment

**Impact**: Cannot add new source types or parsers without modifying this central function.

### 2. Mixed Parsing Dispatch (`infinity/remote.go`)

`GetFrameForURLSourcesWithPostProcessing` (145–236) uses cascading if-statements to dispatch to parsers:
```go
if query.Type == QueryTypeJSON || query.Type == QueryTypeGraphQL { ... }
if query.Type == QueryTypeCSV || query.Type == QueryTypeTSV { ... }
if query.Type == QueryTypeXML || query.Type == QueryTypeHTML { ... }
```

The same pattern repeats in `GetFrameForInlineSources` (`inline.go`). Adding a new format requires modifying both functions.

### 3. Implicit Auth Chain (`infinity/request.go`)

The `GetRequest` function calls 10 sequential auth/header functions with no abstraction:
```go
req = ApplyAcceptHeader(...)
req = ApplyBasicAuth(...)
req = ApplyBearerToken(...)
req = ApplyApiKeyAuth(...)
// ... etc
```

Each function independently checks whether it should apply, creating scattered guard clauses. There is no way to extend or reorder the chain without editing the function.

### 4. Monolithic Settings Struct (`models/settings.go`)

`InfinitySettings` (84–132) holds 40+ fields mixing concerns:
- Auth credentials (basic, bearer, API key, OAuth2, AWS, Azure Blob)
- TLS configuration
- Proxy settings
- Security policies
- Custom headers

The `LoadSettings` function (273–405) is 133 lines performing loading, validation, defaulting, and secret extraction in one pass.

### 5. Duplicated Inline vs. URL Parsing

`GetFrameForInlineSources` (`inline.go`) and `GetFrameForURLSourcesWithPostProcessing` (`remote.go`) both contain nearly identical parser dispatch logic (JSON → `GetJSONBackendResponse`, CSV → `GetCSVBackendResponse`, XML → `GetXMLBackendResponse`). This violates DRY.

### 6. String-Based Error Classification (`pluginhost/handler_checkhealth.go`)

Health check error handling uses fragile string matching:
```go
strings.Contains(err.Error(), "no such host")
strings.Contains(err.Error(), "network unreachable")
```

### 7. Frontend Type-String Dispatch

The frontend `datasource.ts` uses string comparisons (`query.type === 'json'`) scattered across `resolveData()`, `getResults()`, and editor visibility logic in `infinityQuery.tsx`.

---

## Coupling Issues

| From | To | Issue |
|------|----|-------|
| `pluginhost/handler_querydata.go` | All parsers, inline/remote handlers | Direct function calls; no interface boundary |
| `infinity/request.go` | All auth strategies in `headers.go` | Hard-coded sequential calls |
| `infinity/remote.go` + `inline.go` | `jsonBackend.go`, `csvBackend.go`, `xmlBackend.go` | Duplicated dispatch logic |
| `infinity/client.go` | `httpclient/` + response parsing | `req()` method handles HTTP execution AND response body processing |
| `models/settings.go` | All auth types | Single struct holds all credential types |
| Frontend editors | Data logic | UI visibility booleans duplicate backend type knowledge |

---

## Potential Failure Points

1. **Adding new data formats**: Requires editing `remote.go`, `inline.go`, `handler_querydata.go`, and frontend dispatch — four coordinated changes with no compiler enforcement.

2. **Adding new auth methods**: Requires editing `request.go` (add call), `headers.go` (add function), `httpclient.go` (add client setup), and `settings.go` (add fields) — four files with no interface contract.

3. **Pagination with non-JSON types**: Currently only JSON backend queries support pagination (`remote.go:25`). Extending pagination to CSV/XML requires modifying `GetFrameForURLSources` directly.

4. **Error source misclassification**: The `backend.DownstreamError` vs `backend.PluginError` decision is made inconsistently across parsers, with no centralized policy.

5. **Health check fragility**: String-based error detection (`"no such host"`) can break if Go standard library changes error messages.

---

## Proposed Modular Decomposition

### Layer Architecture

```
┌─────────────────────────────────────────────────┐
│              Interface Layer                      │
│  pluginhost/ — Grafana SDK integration            │
│  (QueryData, CheckHealth, CallResource)           │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Domain Layer                         │
│  infinity/ — Query orchestration, source handling │
│  (SourceHandler, pagination, post-processing)     │
└─────────┬────────────────────┬──────────────────┘
          │                    │
┌─────────▼──────────┐ ┌──────▼──────────────────┐
│   Parsing Layer     │ │     Auth Layer           │
│  ResponseParser     │ │  RequestModifier         │
│  (JSON, CSV, XML,   │ │  (Basic, Bearer, API Key,│
│   GSheets)          │ │   OAuth, Forward, Trace)  │
└─────────┬──────────┘ └──────┬──────────────────┘
          │                    │
┌─────────▼────────────────────▼──────────────────┐
│              Models Layer                         │
│  models/ — Query, Settings, Errors                │
│  (shared types, no business logic)                │
└─────────────────────────────────────────────────┘
```

### Key Principles

1. **Interface Layer** (`pluginhost/`): Only Grafana SDK adapter logic. Delegates all domain logic to the domain layer. No parser or auth knowledge.

2. **Domain Layer** (`infinity/`): Orchestrates query execution. Uses `SourceHandler` to abstract URL vs inline vs Azure Blob sources. Coordinates parsing and auth through interfaces.

3. **Parsing Layer**: Each format implements `ResponseParser`. New formats are added by implementing the interface and registering in a parser registry — no existing code modification needed.

4. **Auth Layer**: Each auth strategy implements `RequestModifier`. The request building chain iterates over registered modifiers instead of hard-coding calls.

5. **Models Layer** (`models/`): Pure data types and constants. No business logic, no imports from other layers.

---

## Introduced Interfaces

The following interfaces have been introduced to formalize layer boundaries. They are implemented by the existing code and enable future refactoring toward the proposed architecture.

### `ResponseParser` (Parsing Layer)

```go
// ResponseParser defines the contract for parsing raw response data into data frames.
// Located in: pkg/infinity/responseparser.go
type ResponseParser interface {
    Parse(ctx context.Context, response any, query models.Query) (*data.Frame, error)
    CanParse(query models.Query) bool
}
```

**Implementations**: `JSONResponseParser`, `CSVResponseParser`, `XMLResponseParser`, `GoogleSheetsResponseParser`

The `ParserRegistry` provides a centralized lookup:
```go
registry := NewParserRegistry()
parser, ok := registry.FindParser(query)
frame, err := parser.Parse(ctx, response, query)
```

### `RequestModifier` (Auth Layer)

```go
// RequestModifier defines the contract for modifying HTTP requests (auth headers, tracing, etc.)
// Located in: pkg/infinity/requestmodifier.go
type RequestModifier interface {
    Modify(ctx context.Context, req *http.Request) *http.Request
    Name() string
}
```

**Implementations**: `AcceptHeaderModifier`, `ContentTypeModifier`, `BasicAuthModifier`, `BearerTokenModifier`, `ApiKeyAuthModifier`, `ForwardedOAuthModifier`, `TraceModifier`, etc.

The `RequestModifierChain` replaces the hard-coded call sequence:
```go
chain := BuildRequestModifierChain(ctx, query, settings, requestHeaders, pCtx, includeSect)
req = chain.Apply(ctx, req)
```

### `SourceHandler` (Domain Layer — Proposed)

```go
// SourceHandler would define the contract for handling different data sources.
// This is proposed for future implementation.
type SourceHandler interface {
    CanHandle(source string) bool
    GetFrame(ctx context.Context, query models.Query) (*data.Frame, error)
}
```

---

## Migration Path

These interfaces are introduced alongside existing code using the **Strangler Fig** pattern:

1. **Phase 1** (this PR): Introduce interfaces, implement them wrapping existing functions, add `ParserRegistry` and `RequestModifierChain`. Existing call sites are updated to use the new abstractions.

2. **Phase 2** (future): Refactor `QueryDataQuery` to use `SourceHandler` interface. Extract URL/inline/Azure Blob handling into separate implementations.

3. **Phase 3** (future): Decompose `InfinitySettings` into composed sub-structs (`AuthConfig`, `TLSConfig`, `ProxyConfig`, `SecurityConfig`).

4. **Phase 4** (future): Introduce frontend `QueryTypeHandler` registry to replace scattered type-string checks.
