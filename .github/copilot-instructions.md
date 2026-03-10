# GitHub Copilot Instructions

## Project Overview

Grafana Infinity Datasource is a Grafana data source plugin that allows visualizing data from HTTP APIs and various data formats including JSON, CSV, TSV, XML, GraphQL, HTML, and Google Sheets. It supports AWS, Azure, and GCP integrations and provides data transformation via UQL, GROQ, and JSONata.

- **Plugin ID**: `yesoreyeram-infinity-datasource`
- **Grafana minimum version**: 11.6.0
- **Repository**: https://github.com/grafana/grafana-infinity-datasource

## Tech Stack

### Frontend
- **Language**: TypeScript + React 18
- **Grafana SDK**: `@grafana/data`, `@grafana/ui`, `@grafana/runtime`, `@grafana/scenes`
- **Build**: Webpack 5 with SWC transpiler
- **Package manager**: Yarn 4 (Berry)
- **Testing**: Jest + React Testing Library, Playwright (E2E)
- **Linting/Formatting**: ESLint (flat config), Prettier

### Backend
- **Language**: Go 1.22+
- **Grafana SDK**: `github.com/grafana/grafana-plugin-sdk-go`
- **Build**: Mage (`Magefile.go`)
- **Testing**: Go's `testing` package + `testify`

## Repository Structure

```
/src                  # Frontend TypeScript/React code
  /app                # Query execution providers (UQL, GROQ, Series)
  /components         # Reusable UI components
  /editors            # Query and config editor React components
    /config           # Datasource configuration UI
    /query            # Query editor UI
  /types              # TypeScript type definitions
  module.ts           # Plugin entry point
  datasource.ts       # Main Datasource class
/pkg                  # Backend Go code
  /infinity           # Core HTTP client and data-fetching logic
  /models             # Query and settings data models
  /pluginhost         # Plugin handlers (QueryData, CheckHealth, CallResource)
  /dataplane          # Data processing pipeline
  /httpclient         # HTTP client utilities
  /testsuite          # Backend test utilities
  main.go             # Backend entry point
/tests/e2e            # Playwright E2E tests
/docs                 # Plugin documentation (sources)
/testdata             # Test data files
/provisioning         # Grafana provisioning examples
```

## Coding Conventions

### TypeScript/Frontend
- Use the `@/*` path alias for imports from `src/` (e.g. `import { Foo } from '@/types'`)
- React components use `.tsx` extension; utilities/logic use `.ts`
- Test files use `.test.ts` or `.test.tsx` suffix, co-located with source or in nearby `__tests__` folders
- Follow existing ESLint rules (`eslint.config.mjs`) and Prettier formatting (`.prettierrc.js`)
- Grafana UI components from `@grafana/ui` are preferred over custom implementations

### Go/Backend
- Package path: `github.com/grafana/grafana-infinity-datasource/pkg/{module}`
- Handler files follow the pattern: `handler_*.go` in `pkg/pluginhost/`
- Test files: `*_test.go` co-located with the source
- Propagate `context.Context` through call chains as the first argument
- Use OpenTelemetry spans for observability (tracing)
- Follow standard Go error handling with typed errors and `errors.Is()` / `errors.As()`

## Key Files

| File | Description |
|------|-------------|
| `src/module.ts` | Frontend plugin entry point; registers DataSource, ConfigEditor, QueryEditor |
| `src/datasource.ts` | Main `Datasource` class implementing Grafana's DataSource interface |
| `src/types/index.ts` | Core TypeScript type definitions (query, settings, etc.) |
| `pkg/main.go` | Backend entry point; bootstraps the plugin with `datasource.Manage` |
| `pkg/pluginhost/plugin.go` | Plugin host and DataSource instance |
| `pkg/pluginhost/handler_querydata.go` | QueryData request handler |
| `pkg/infinity/client.go` | Core infinity HTTP client |
| `pkg/models/` | Query and datasource settings models |
| `src/plugin.json` | Plugin metadata and capabilities |

## Development Commands

```bash
# Frontend
yarn dev          # Start webpack in watch mode
yarn build        # Production build
yarn test         # Run Jest tests (watch mode)
yarn test:ci      # Run Jest tests (CI mode)
yarn typecheck    # TypeScript type checking
yarn lint         # ESLint linting
yarn e2e          # Run Playwright E2E tests

# Backend
mage build        # Build Go plugin binary
mage test         # Run Go tests

# Both
docker-compose up # Start local Grafana with the plugin for development
```

## Testing Guidelines

- **Unit tests**: Place `.test.ts(x)` files next to the code being tested; use Jest + React Testing Library for frontend
- **Backend tests**: Use `*_test.go` co-located with source; use `testify` for assertions
- **E2E tests**: Located in `tests/e2e/`; use Playwright; always run against a real Grafana instance
- Mock Grafana SDK types using `@grafana/data` test utilities where available

## Plugin Architecture

The plugin follows Grafana's standard plugin model:

1. **Frontend** renders the configuration editor (`InfinityConfigEditor`) and query editor (`QueryEditor`), serializes the query to JSON, and sends it to the backend.
2. **Backend** receives the query via `QueryData`, fetches data from the target URL using the configured authentication, parses and transforms it, and returns a `DataResponse` with Grafana data frames.
3. **Authentication** is handled backend-side and supports: No Auth, Basic Auth, API Key, Bearer Token, OAuth2 (client credentials, JWT, others), AWS SigV4, Azure, and Google JWT.
4. **Data formats** supported: JSON, CSV, TSV, XML, HTML (web scraping), GraphQL, UQL, GROQ, JSONata, Google Sheets, RSS/ATOM, and Azure Blob.
