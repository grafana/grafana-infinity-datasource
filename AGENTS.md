# AI Coding Agent Instructions

> Canonical AI/LLM instructions for the Grafana Infinity Datasource project.
> Other AI config files (CLAUDE.md, SKILLS.md, .cursorrules, .clinerules, .windsurfrules) are symlinks to this file.

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

- **Language**: Go 1.26.1+
- **Grafana SDK**: `github.com/grafana/grafana-plugin-sdk-go`
- **Build**: Mage (`Magefile.go`)
- **Testing**: Go's `testing` package + `testify`

## Repository Structure

```md
/src                  # Frontend TypeScript/React code
  /app                # Query execution providers (UQL, GROQ, Series)
  /components         # Reusable UI components
  /editors            # Query and config editor React components
    /config           # Datasource configuration UI (Auth, TLS, OAuth, etc.)
    /query            # Query editor UI (URL, columns, filters, pagination, etc.)
    config.editor.tsx # Top-level config editor entry
    query.editor.tsx  # Top-level query editor entry
  /types              # TypeScript type definitions (split across 4 files)
    config.types.ts   # Datasource config/settings types
    query.types.ts    # Query types with discriminated unions
    misc.types.ts     # Shared miscellaneous types
    variables.types.ts# Variable query types
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
mage -v           # Build Go plugin binary
go test -v ./...  # Run Go tests

# Both
docker-compose up # Start local Grafana with the plugin for development
```

## Coding Conventions

### TypeScript / Frontend

- Use the `@/*` path alias for imports from `src/` (e.g. `import { Foo } from '@/types'`)
- React components use `.tsx` extension; utilities/logic use `.ts`
- Test files use `.test.ts` or `.test.tsx` suffix, co-located with source
- Follow existing ESLint rules (`eslint.config.mjs`) and Prettier formatting (`.prettierrc.js`)
- Grafana UI components from `@grafana/ui` are preferred over custom implementations
- Query types use discriminated unions: `InfinityQueryBase<T extends InfinityQueryType>` as the generic base
- Types are split across `src/types/` — import from the specific file, not a barrel index

### Go / Backend

- Package path: `github.com/grafana/grafana-infinity-datasource/pkg/{module}`
- Handler files follow the pattern: `handler_*.go` in `pkg/pluginhost/`
- Test files: `*_test.go` co-located with the source; use external test package (`package foo_test`)
- Propagate `context.Context` through call chains as the first argument
- Open an OpenTelemetry span at the start of every handler: `tracing.DefaultTracer().Start(ctx, "...")`
- Use `github.com/grafana/dskit/concurrency` for concurrent query execution in handlers
- Follow standard Go error handling with typed errors and `errors.Is()` / `errors.As()`
- Query types are typed string constants defined in `pkg/models/query.go`

## Key Files

| File | Description |
|------|-------------|
| `src/module.ts` | Frontend plugin entry point; registers DataSource, ConfigEditor, QueryEditor |
| `src/datasource.ts` | Main `Datasource` class extending `DataSourceWithBackend` |
| `src/types/query.types.ts` | Query types — discriminated unions with generic base `InfinityQueryBase<T>` |
| `src/types/config.types.ts` | Datasource settings and config types |
| `pkg/main.go` | Backend entry point; bootstraps the plugin with `datasource.Manage` |
| `pkg/pluginhost/plugin.go` | Plugin host and DataSource instance |
| `pkg/pluginhost/handler_querydata.go` | QueryData handler — concurrent via `dskit/concurrency` |
| `pkg/infinity/client.go` | Core infinity HTTP client (`Client` struct) |
| `pkg/models/query.go` | Query model with typed string enums for `QueryType`, `InfinityParser`, `PaginationMode` |
| `pkg/models/settings.go` | Datasource settings model |
| `src/plugin.json` | Plugin metadata and capabilities |

## Plugin Architecture

The plugin follows Grafana's standard plugin model:

1. **Frontend** renders the configuration editor (`InfinityConfigEditor`) and query editor (`QueryEditor`), serializes the query to JSON, and sends it to the backend.
2. **Backend** receives the query via `QueryData`, fetches data from the target URL using the configured authentication, parses and transforms it, and returns a `DataResponse` with Grafana data frames.
3. **Authentication** is handled backend-side and supports: No Auth, Basic Auth, API Key, Bearer Token, OAuth2 (client credentials, JWT, others), AWS SigV4, Azure, and Google JWT.
4. **Data formats** supported: JSON, CSV, TSV, XML, HTML (web scraping), GraphQL, UQL, GROQ, JSONata, Google Sheets, RSS/ATOM, and Azure Blob.

## Testing Guidelines

### Frontend Tests

- Place `.test.ts(x)` files next to the code being tested
- Use Jest + React Testing Library; prefer `userEvent` over `fireEvent`
- Use `@/` path alias for all project imports
- Use `Object.freeze()` on mock props/queries to verify components don't mutate them
- Mock Grafana SDK types using `@grafana/data` test utilities where available
- Selector priority: `data-testid` > role with name > text/display value > placeholder/label
- Use `jest.fn()` for all callbacks; clear mocks between tests with `jest.clearAllMocks()`
- Mock `react-router-dom` and `@grafana/ui` Link components when rendering components that use Links:

  ```tsx
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  }));
  ```

### Backend Tests

- Use `*_test.go` co-located with source; use `testify` for assertions; prefer table-driven tests
- Use external test packages (`package foo_test`) by default
- Use `tests` as the slice name and `tt` as the iterator for table-driven tests
- Use `testify/require` for fatal checks and `testify/assert` for non-fatal
- Nil-error check: `require.Nil(t, err)` (not `require.NoError`)
- For HTTP mocking, use `InfinityMocker` from `pkg/testsuite/` or `httptest.Server`
- Golden files live in `pkg/testsuite/golden/` as `.jsonc` files
- Build queries using inline JSON strings passed to `models.LoadQuery`
- Prefer `t.Context()` in new tests

### E2E Tests

- Located in `tests/e2e/`; use Playwright; always run against a real Grafana instance

## Go Handler Patterns

When creating or modifying handlers in `pkg/pluginhost/`:

- Open an OpenTelemetry span at the start of every handler and defer its closure
- Classify errors by source using `backend.ErrorResponseWithErrorSource(err)`
- Use `dskit/concurrency.ForEachJob` with a `sync.Mutex` to protect shared state for concurrent query execution
- Use structured logging from context: `backend.Logger.FromContext(ctx)`
- Always propagate `context.Context` as the first argument through the full call chain

## Releases

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation. Run `yarn changeset` to create a changeset before merging feature/fix PRs.

## Available Skills

Workflow skills provide step-by-step procedures for common multi-file tasks. Detailed instructions are in `.github/skills/`:

| Skill | Description | File |
|-------|-------------|------|
| `add-auth-type` | Add a new authentication type (frontend + backend) | `.github/skills/add-auth-type/SKILL.md` |

## Contextual Instructions

Detailed coding instructions for specific file patterns are in `.github/instructions/`:

| File | Applies to | Description |
|------|-----------|-------------|
| `frontend-test.instructions.md` | `src/**/*.{test,spec}.{ts,tsx}` | Jest, React Testing Library, selectors, mocking patterns |
| `go-handler.instructions.md` | `pkg/pluginhost/handler_*.go` | OTel tracing, error handling, concurrency, logging |
| `go-test.instructions.md` | `pkg/**/*_test.go` | Table-driven tests, testify, HTTP mocking, golden files |

When working on files matching those patterns, read the corresponding instruction file for full details.

## Rules for AI Agents

1. **Read before edit** — Always read a file before modifying it. Understand existing patterns.
2. **Match conventions** — Follow the coding conventions above. Don't introduce new patterns unless asked.
3. **Test co-location** — Place tests next to their source files, not in separate directories.
4. **Type safety** — Use proper TypeScript types; avoid `any` unless explicitly casting test mocks.
5. **Secrets** — Never put secrets in `jsonData`. Use `secureJsonData` / `DecryptedSecureJSONData`.
6. **Auth string parity** — Auth type string values must match exactly between frontend and backend.
7. **No over-engineering** — Don't add error handling, abstractions, or features beyond what's asked.
8. **Changeset on feature/fix** — Run `yarn changeset` to create a changeset for any feature or fix PR.
9. **Verify changes** — Run `yarn typecheck`, `yarn lint`, and `go test ./...` after making changes.
10. **Context propagation** — Always pass `context.Context` as the first argument in Go code.
