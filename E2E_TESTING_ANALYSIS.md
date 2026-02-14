# E2E Testing Analysis and Improvement Plan

**Document Version**: 1.0  
**Date**: February 14, 2026  
**Purpose**: Assess current E2E test quality, coverage, identify use cases, and create an actionable improvement plan

---

## Executive Summary

The Grafana Infinity Datasource plugin is a comprehensive data integration tool supporting 11+ query types, 6+ data sources, and 5+ parsers. Currently, E2E testing coverage is **minimal** with only 2 test files covering basic functionality. This document provides a complete analysis of the current state and a detailed improvement plan to achieve comprehensive E2E coverage.

### Current State
- **Total E2E Test Files**: 2
- **Test Coverage**: ~5% of critical user workflows
- **Coverage Type**: Basic smoke tests and configuration editor validation
- **CI Integration**: Enabled via Playwright with `@grafana/plugin-e2e`

### Target State
- **Comprehensive E2E Coverage**: 80%+ of critical user workflows
- **Test Scenarios**: 50+ test cases across all query types, sources, and parsers
- **Automated CI**: Full E2E test suite running on every PR
- **Visual Regression**: Screenshot comparisons for UI changes

---

## 1. Current E2E Test Coverage

### 1.1 Existing Test Files

#### `tests/e2e/smoke.spec.ts`
**Coverage**: Plugin initialization and basic loading
```typescript
- Plugin loads successfully
- Datasource config page displays
- Welcome message is visible
```
**Scope**: Minimal smoke test

#### `tests/e2e/configeditor.spec.ts`
**Coverage**: Configuration editor UI
```typescript
- Global queries can be added
- Query source selector works
- Reference source selection displays correct fields
```
**Scope**: Basic config editor interaction

### 1.2 Current Test Infrastructure

**Framework**: Playwright Test with `@grafana/plugin-e2e`
**Configuration**: `playwright.config.ts`
- Auth setup with admin user
- Chromium browser testing
- HTML reporter
- CI integration enabled

**Test Command**: `yarn e2e`

### 1.3 Coverage Gaps

The current E2E tests cover approximately **5%** of the plugin's functionality. Major gaps include:

#### Query Types (0/11 tested)
- ❌ JSON queries (simple, backend, jq-backend, UQL, GROQ parsers)
- ❌ CSV/TSV queries
- ❌ XML queries
- ❌ HTML queries (web scraping)
- ❌ GraphQL queries
- ❌ Google Sheets queries
- ❌ UQL queries
- ❌ GROQ queries
- ❌ Series (Random Walk, Expression)
- ❌ Global query execution
- ❌ Transformations queries

#### Data Sources (1/6 partially tested)
- ⚠️ URL source (not fully tested)
- ❌ Inline data
- ⚠️ Reference data (only config tested, not execution)
- ❌ Azure Blob Storage
- ❌ Random Walk
- ❌ Expression

#### Authentication Methods (0/7 tested)
- ❌ No auth (basic test exists but not comprehensive)
- ❌ Basic Auth
- ❌ API Key (header/query)
- ❌ Bearer Token
- ❌ OAuth2 (client credentials, JWT)
- ❌ AWS Signature
- ❌ Azure Blob auth

#### Data Transformations (0/5 tested)
- ❌ Filtering (15+ operators)
- ❌ Computed columns
- ❌ Pagination (5 modes)
- ❌ Column mapping
- ❌ Format transformations

#### Output Formats (0/8 tested)
- ❌ Table
- ❌ Time Series
- ❌ Logs
- ❌ Traces
- ❌ DataFrame
- ❌ Node Graph (Nodes/Edges)
- ❌ As-Is

#### Variables (0/5 tested)
- ❌ Collection
- ❌ CollectionLookup
- ❌ Join
- ❌ Random
- ❌ UnixTimeStamp

#### Configuration Features (1/8 partially tested)
- ⚠️ Global queries (UI tested, not execution)
- ❌ Reference data
- ❌ Custom health checks
- ❌ TLS/SSL configuration
- ❌ Proxy settings
- ❌ Secure fields (secrets)
- ❌ Headers/cookies persistence
- ❌ Timeout configurations

---

## 2. Identified Use Cases and Test Scenarios

### 2.1 Critical User Workflows

Based on plugin capabilities and expected usage patterns, the following are critical workflows that require E2E testing:

#### Priority 1: Core Query Execution (Must Have)

1. **JSON API Queries**
   - Simple JSON parsing with column selectors
   - Backend parser with JSONata expressions
   - JQ backend parser
   - UQL transformations
   - GROQ queries
   - Nested JSON navigation
   - Array data extraction
   - Error handling (invalid JSON, network failures)

2. **CSV/TSV Data Processing**
   - Basic CSV parsing
   - Custom delimiters
   - Header detection
   - Skip empty lines
   - Handle errors in lines
   - Column mapping

3. **HTML Web Scraping**
   - CSS selector extraction
   - Table extraction
   - Multiple elements selection
   - Attribute extraction

4. **XML Data Parsing**
   - Basic XML parsing
   - XPath selection
   - Namespace handling

5. **GraphQL Queries**
   - Basic GraphQL execution
   - Variables support
   - Nested query results

6. **Data Source Variations**
   - URL with GET/POST/PUT/DELETE methods
   - Inline data processing
   - Reference data lookup
   - Azure Blob Storage reading

7. **Output Format Conversions**
   - Table format
   - Time series format
   - Logs format
   - Node graph format

#### Priority 2: Data Transformations (Should Have)

8. **Filtering**
   - Equals, Not Equals
   - Contains, Not Contains
   - Regex matching
   - Greater than, Less than
   - In, Not In
   - Date range filters

9. **Computed Columns**
   - Simple expressions
   - Math operations
   - String manipulation
   - Date/time functions

10. **Pagination**
    - Offset pagination
    - Page-based pagination
    - Cursor pagination
    - List pagination

11. **Column Configuration**
    - Column type mapping (string, number, timestamp, boolean)
    - Timestamp format parsing
    - Column renaming
    - Column selection/filtering

#### Priority 3: Authentication & Security (Should Have)

12. **Authentication Flows**
    - Basic Authentication
    - API Key in header
    - API Key in query params
    - Bearer token
    - OAuth2 client credentials
    - OAuth2 JWT
    - AWS Signature V4

13. **Secure Configuration**
    - Password field masking
    - API key encryption
    - Certificate upload
    - Secure headers

#### Priority 4: Advanced Features (Nice to Have)

14. **Variables**
    - Collection variables
    - CollectionLookup variables
    - Join variables
    - Dashboard variable integration

15. **Global Queries**
    - Create global query
    - Reference global query
    - Override global query parameters

16. **Custom Features**
    - Custom health checks
    - Proxy configuration
    - TLS/SSL custom certificates
    - Request/response body customization

### 2.2 Edge Cases and Error Scenarios

17. **Error Handling**
    - Network timeout
    - 404 Not Found
    - 500 Server Error
    - Authentication failures
    - Invalid JSON/CSV/XML
    - Rate limiting
    - CORS errors

18. **Data Quality**
    - Empty responses
    - Large datasets (pagination required)
    - Special characters in data
    - Unicode support
    - Null/undefined handling

19. **UI/UX Validation**
    - Form validation
    - Error messages display
    - Loading states
    - Query result previews
    - Panel integration

---

## 3. E2E Test Quality Assessment

### 3.1 Current Quality Metrics

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Test Coverage | ~5% | 80% | 75% |
| Critical Path Coverage | 2/19 workflows | 19/19 workflows | 17 workflows |
| Query Type Coverage | 0/11 types | 11/11 types | 11 types |
| Data Source Coverage | 0/6 sources | 6/6 sources | 6 sources |
| Parser Coverage | 0/5 parsers | 5/5 parsers | 5 parsers |
| Auth Method Coverage | 0/7 methods | 6/7 methods | 6 methods |
| Output Format Coverage | 0/8 formats | 8/8 formats | 8 formats |
| Error Scenario Coverage | 0/8 scenarios | 8/8 scenarios | 8 scenarios |

### 3.2 Test Quality Characteristics

**Current Tests:**
- ✅ Use official `@grafana/plugin-e2e` framework
- ✅ Follow Playwright best practices
- ✅ Proper authentication setup
- ✅ CI integration enabled
- ⚠️ Limited assertions
- ⚠️ No data validation
- ⚠️ No end-to-end workflow validation
- ❌ No visual regression testing
- ❌ No performance testing
- ❌ No API mocking for reliable tests

**Recommended Improvements:**
- Add comprehensive assertions for data correctness
- Implement visual regression with screenshot comparison
- Add API mocking for deterministic tests
- Include performance benchmarks
- Add accessibility testing
- Implement cross-browser testing (Firefox, Safari)

---

## 4. Improvement Plan

### 4.1 Testing Strategy

**Approach**: Incremental test development organized by priority and complexity

**Principles**:
1. **Test Pyramid**: More unit tests (existing), fewer E2E tests (focus on critical paths)
2. **Deterministic Tests**: Use mocked APIs for consistent results
3. **Maintainability**: Reusable test utilities and page objects
4. **CI Integration**: Fast feedback on every PR
5. **Visual Regression**: Catch UI regressions early

### 4.2 Test Organization Structure

```
tests/e2e/
├── smoke.spec.ts (existing)
├── configeditor.spec.ts (existing)
├── queries/
│   ├── json.spec.ts (JSON queries with all parsers)
│   ├── csv.spec.ts (CSV/TSV queries)
│   ├── xml.spec.ts (XML queries)
│   ├── html.spec.ts (HTML web scraping)
│   ├── graphql.spec.ts (GraphQL queries)
│   ├── google-sheets.spec.ts (Google Sheets integration)
│   ├── uql.spec.ts (UQL language)
│   ├── groq.spec.ts (GROQ language)
│   ├── series.spec.ts (Random Walk, Expression)
│   └── global-queries.spec.ts (Global query execution)
├── sources/
│   ├── url.spec.ts (URL source with HTTP methods)
│   ├── inline.spec.ts (Inline data)
│   ├── reference.spec.ts (Reference data)
│   └── azure-blob.spec.ts (Azure Blob Storage)
├── transformations/
│   ├── filters.spec.ts (All filter operators)
│   ├── computed-columns.spec.ts (Computed columns)
│   ├── pagination.spec.ts (All pagination modes)
│   └── columns.spec.ts (Column mapping and types)
├── formats/
│   ├── table.spec.ts (Table format)
│   ├── timeseries.spec.ts (Time series format)
│   ├── logs.spec.ts (Logs format)
│   ├── traces.spec.ts (Traces format)
│   └── node-graph.spec.ts (Node graph format)
├── auth/
│   ├── basic-auth.spec.ts (Basic authentication)
│   ├── api-key.spec.ts (API key auth)
│   ├── bearer-token.spec.ts (Bearer token)
│   ├── oauth2.spec.ts (OAuth2 flows)
│   └── aws-signature.spec.ts (AWS Signature V4)
├── variables/
│   ├── collection.spec.ts (Collection variables)
│   ├── collection-lookup.spec.ts (CollectionLookup)
│   └── dashboard-variables.spec.ts (Integration with Grafana variables)
├── config/
│   ├── datasource-config.spec.ts (Full datasource configuration)
│   ├── reference-data.spec.ts (Reference data setup)
│   ├── custom-health.spec.ts (Custom health checks)
│   └── tls-proxy.spec.ts (TLS and proxy settings)
├── errors/
│   └── error-handling.spec.ts (Error scenarios)
├── integration/
│   ├── panel-integration.spec.ts (Panel data display)
│   └── dashboard-workflow.spec.ts (End-to-end dashboard)
├── utils/
│   ├── test-helpers.ts (Reusable test utilities)
│   ├── mock-api.ts (API mocking setup)
│   ├── fixtures.ts (Test data fixtures)
│   └── page-objects.ts (Page object models)
└── visual/
    └── visual-regression.spec.ts (Screenshot comparisons)
```

### 4.3 Implementation Phases

#### Phase 1: Foundation (Weeks 1-2)
**Goal**: Establish test infrastructure and utilities

Tasks:
- Create test utilities and helper functions
- Set up API mocking framework (MSW or similar)
- Create reusable page object models
- Implement test data fixtures
- Add visual regression testing setup
- Update CI configuration for expanded tests

**Deliverables**:
- `tests/e2e/utils/` directory with helpers
- Mock API server setup
- Page object models for editors
- Documentation for writing new tests

#### Phase 2: Core Query Types (Weeks 3-5)
**Goal**: Test all 11 query types with basic scenarios

Tasks:
- JSON queries (simple, backend, UQL, GROQ parsers)
- CSV/TSV queries
- XML queries
- HTML queries
- GraphQL queries
- Google Sheets queries
- Series queries
- Global queries
- Transformations queries

**Deliverables**:
- 9 test files in `tests/e2e/queries/`
- 50+ test cases covering basic query execution
- Documentation for each query type

#### Phase 3: Data Sources & Authentication (Weeks 6-7)
**Goal**: Test all data sources and authentication methods

Tasks:
- URL source with all HTTP methods
- Inline data
- Reference data
- Azure Blob Storage
- Basic Auth, API Key, Bearer Token
- OAuth2 flows
- AWS Signature V4

**Deliverables**:
- 4 test files in `tests/e2e/sources/`
- 5 test files in `tests/e2e/auth/`
- 30+ test cases

#### Phase 4: Transformations & Formats (Weeks 8-9)
**Goal**: Test data transformations and output formats

Tasks:
- All 15+ filter operators
- Computed columns with expressions
- All 5 pagination modes
- Column mapping and type conversions
- All 8 output formats

**Deliverables**:
- 4 test files in `tests/e2e/transformations/`
- 5 test files in `tests/e2e/formats/`
- 40+ test cases

#### Phase 5: Advanced Features (Weeks 10-11)
**Goal**: Test variables, configuration, and integration

Tasks:
- Collection variables
- CollectionLookup variables
- Dashboard variable integration
- Datasource configuration (TLS, proxy, health checks)
- Reference data configuration
- Panel integration
- End-to-end dashboard workflows

**Deliverables**:
- 3 test files in `tests/e2e/variables/`
- 4 test files in `tests/e2e/config/`
- 2 test files in `tests/e2e/integration/`
- 25+ test cases

#### Phase 6: Error Handling & Polish (Weeks 12-13)
**Goal**: Test error scenarios and edge cases

Tasks:
- Network errors (timeout, 404, 500)
- Authentication failures
- Invalid data formats
- Empty responses
- Large datasets
- Visual regression tests
- Performance benchmarks
- Cross-browser testing

**Deliverables**:
- 1 test file in `tests/e2e/errors/`
- Visual regression suite
- Performance baseline
- Browser compatibility matrix
- 20+ edge case tests

#### Phase 7: Documentation & Maintenance (Week 14)
**Goal**: Comprehensive documentation and CI optimization

Tasks:
- Complete E2E testing guide
- Contributing guidelines for tests
- CI optimization for fast feedback
- Test maintenance procedures
- Coverage reporting setup

**Deliverables**:
- `docs/e2e-testing.md`
- CI workflow optimizations
- Coverage reports in CI
- Test maintenance runbook

---

## 5. Detailed Task List

### 5.1 Infrastructure Tasks

- [ ] **E2E-001**: Create test utilities module (`tests/e2e/utils/test-helpers.ts`)
  - Query creation helpers
  - Datasource setup helpers
  - Assertion utilities
  - Wait/retry utilities

- [ ] **E2E-002**: Set up API mocking framework
  - Install MSW or similar mocking library
  - Create mock API handlers
  - Set up fixtures for test data
  - Document mocking patterns

- [ ] **E2E-003**: Create page object models
  - QueryEditorPage
  - ConfigEditorPage
  - DashboardPage
  - PanelPage
  - Reusable component selectors

- [ ] **E2E-004**: Add visual regression testing
  - Install @playwright/test-snapshots or similar
  - Create baseline screenshots
  - Set up screenshot comparison workflow
  - Add visual tests to CI

- [ ] **E2E-005**: Update CI configuration
  - Increase test timeout for expanded suite
  - Add parallel execution
  - Set up test sharding
  - Add coverage reporting
  - Configure artifact retention

- [ ] **E2E-006**: Create test data fixtures
  - Sample JSON responses
  - Sample CSV data
  - Sample XML data
  - Sample HTML pages
  - Sample GraphQL schemas

### 5.2 Query Type Testing Tasks

- [ ] **E2E-100**: JSON query tests (`tests/e2e/queries/json.spec.ts`)
  - Simple parser with array data
  - Simple parser with nested objects
  - Backend parser with JSONata
  - JQ backend parser
  - UQL parser
  - GROQ parser
  - Root selector usage
  - Column mapping
  - Error handling

- [ ] **E2E-101**: CSV/TSV query tests (`tests/e2e/queries/csv.spec.ts`)
  - Basic CSV parsing
  - Custom delimiter
  - Header row detection
  - Skip empty lines
  - Handle malformed rows
  - Column type inference
  - TSV parsing

- [ ] **E2E-102**: XML query tests (`tests/e2e/queries/xml.spec.ts`)
  - Basic XML parsing
  - XPath selectors
  - Namespace handling
  - Nested element extraction
  - Attribute extraction

- [ ] **E2E-103**: HTML query tests (`tests/e2e/queries/html.spec.ts`)
  - CSS selector extraction
  - Table scraping
  - Multiple element selection
  - Attribute extraction
  - Text content extraction

- [ ] **E2E-104**: GraphQL query tests (`tests/e2e/queries/graphql.spec.ts`)
  - Basic query execution
  - Query with variables
  - Nested query results
  - Error handling
  - JSONata parsing of results

- [ ] **E2E-105**: Google Sheets tests (`tests/e2e/queries/google-sheets.spec.ts`)
  - Read from spreadsheet
  - Multiple sheets
  - Range selection
  - Column mapping

- [ ] **E2E-106**: UQL query tests (`tests/e2e/queries/uql.spec.ts`)
  - UQL language syntax
  - Filtering with UQL
  - Transformations with UQL
  - Multiple data sources

- [ ] **E2E-107**: GROQ query tests (`tests/e2e/queries/groq.spec.ts`)
  - GROQ language syntax
  - Filtering with GROQ
  - Projections
  - Aggregations

- [ ] **E2E-108**: Series query tests (`tests/e2e/queries/series.spec.ts`)
  - Random Walk generation
  - Expression-based series
  - Multiple series
  - Data overrides

- [ ] **E2E-109**: Global query tests (`tests/e2e/queries/global-queries.spec.ts`)
  - Create global query
  - Reference global query in panel
  - Override parameters
  - Multiple global queries

- [ ] **E2E-110**: Transformations query tests (`tests/e2e/queries/transformations.spec.ts`)
  - Limit transformation
  - Filter transformation
  - Summarize transformation
  - Computed column transformation

### 5.3 Data Source Testing Tasks

- [ ] **E2E-200**: URL source tests (`tests/e2e/sources/url.spec.ts`)
  - GET request
  - POST request with body
  - PUT request
  - DELETE request
  - Query parameters
  - Custom headers
  - Form data
  - JSON body
  - GraphQL body

- [ ] **E2E-201**: Inline data tests (`tests/e2e/sources/inline.spec.ts`)
  - JSON inline data
  - CSV inline data
  - XML inline data
  - Large inline data

- [ ] **E2E-202**: Reference data tests (`tests/e2e/sources/reference.spec.ts`)
  - Configure reference data
  - Query reference data
  - Multiple reference datasets
  - Reference data updates

- [ ] **E2E-203**: Azure Blob Storage tests (`tests/e2e/sources/azure-blob.spec.ts`)
  - Connect to Azure Blob
  - Read blob data
  - Multiple containers
  - Authentication

### 5.4 Authentication Testing Tasks

- [ ] **E2E-300**: Basic Auth tests (`tests/e2e/auth/basic-auth.spec.ts`)
  - Configure Basic Auth
  - Successful authentication
  - Failed authentication
  - Secure field handling

- [ ] **E2E-301**: API Key tests (`tests/e2e/auth/api-key.spec.ts`)
  - API Key in header
  - API Key in query parameter
  - Multiple API keys
  - Key rotation

- [ ] **E2E-302**: Bearer Token tests (`tests/e2e/auth/bearer-token.spec.ts`)
  - Configure Bearer token
  - Token-based authentication
  - Token expiration handling

- [ ] **E2E-303**: OAuth2 tests (`tests/e2e/auth/oauth2.spec.ts`)
  - Client credentials flow
  - JWT bearer flow
  - Token refresh
  - Scope handling

- [ ] **E2E-304**: AWS Signature tests (`tests/e2e/auth/aws-signature.spec.ts`)
  - AWS Signature V4
  - Credential configuration
  - Region selection
  - Service selection

### 5.5 Transformation Testing Tasks

- [ ] **E2E-400**: Filter tests (`tests/e2e/transformations/filters.spec.ts`)
  - Equals operator
  - Not Equals operator
  - Contains operator
  - Not Contains operator
  - Regex operator
  - Greater Than operator
  - Less Than operator
  - Greater Than or Equal operator
  - Less Than or Equal operator
  - In operator
  - Not In operator
  - Starts With operator
  - Ends With operator
  - Empty operator
  - Not Empty operator
  - Multiple filters (AND logic)

- [ ] **E2E-401**: Computed columns tests (`tests/e2e/transformations/computed-columns.spec.ts`)
  - Simple expression
  - Math operations
  - String functions
  - Date/time functions
  - Conditional expressions
  - Multiple computed columns

- [ ] **E2E-402**: Pagination tests (`tests/e2e/transformations/pagination.spec.ts`)
  - None (no pagination)
  - Offset pagination
  - Page-based pagination
  - Cursor pagination
  - List pagination

- [ ] **E2E-403**: Column tests (`tests/e2e/transformations/columns.spec.ts`)
  - String column type
  - Number column type
  - Timestamp column type
  - Timestamp epoch type
  - Boolean column type
  - Column renaming
  - Column selector
  - Column ordering

### 5.6 Output Format Testing Tasks

- [ ] **E2E-500**: Table format tests (`tests/e2e/formats/table.spec.ts`)
  - Basic table output
  - Multiple columns
  - Data types in table
  - Column headers

- [ ] **E2E-501**: Time series format tests (`tests/e2e/formats/timeseries.spec.ts`)
  - Single time series
  - Multiple time series
  - Time format parsing
  - Aggregation over time

- [ ] **E2E-502**: Logs format tests (`tests/e2e/formats/logs.spec.ts`)
  - Log line parsing
  - Timestamp extraction
  - Log levels
  - Multiple log sources

- [ ] **E2E-503**: Traces format tests (`tests/e2e/formats/traces.spec.ts`)
  - Trace span creation
  - Parent-child relationships
  - Trace attributes
  - Service mapping

- [ ] **E2E-504**: Node graph format tests (`tests/e2e/formats/node-graph.spec.ts`)
  - Node creation
  - Edge creation
  - Node attributes
  - Graph layout

- [ ] **E2E-505**: DataFrame format tests (`tests/e2e/formats/dataframe.spec.ts`)
  - DataFrame structure
  - Field configuration
  - DataFrame metadata

- [ ] **E2E-506**: As-is format tests (`tests/e2e/formats/as-is.spec.ts`)
  - Raw data passthrough
  - Minimal transformation

### 5.7 Variable Testing Tasks

- [ ] **E2E-600**: Collection variable tests (`tests/e2e/variables/collection.spec.ts`)
  - Create collection variable
  - Query data source
  - Use in dashboard

- [ ] **E2E-601**: CollectionLookup variable tests (`tests/e2e/variables/collection-lookup.spec.ts`)
  - Lookup by key
  - Nested lookups
  - Fallback values

- [ ] **E2E-602**: Dashboard variable tests (`tests/e2e/variables/dashboard-variables.spec.ts`)
  - Variable interpolation in queries
  - Multi-value variables
  - Chained variables
  - Variable refresh

### 5.8 Configuration Testing Tasks

- [ ] **E2E-700**: Datasource config tests (`tests/e2e/config/datasource-config.spec.ts`)
  - Create new datasource
  - Save configuration
  - Edit configuration
  - Delete datasource
  - Test connection
  - Default configuration values

- [ ] **E2E-701**: Reference data tests (`tests/e2e/config/reference-data.spec.ts`)
  - Add reference data
  - Edit reference data
  - Delete reference data
  - Use reference data in query

- [ ] **E2E-702**: Custom health check tests (`tests/e2e/config/custom-health.spec.ts`)
  - Configure custom health check
  - Execute health check
  - Health check failure
  - Health check success

- [ ] **E2E-703**: TLS and proxy tests (`tests/e2e/config/tls-proxy.spec.ts`)
  - Configure proxy
  - TLS client certificate
  - CA certificate
  - Server name override
  - Skip TLS verification

### 5.9 Error Handling Testing Tasks

- [ ] **E2E-800**: Error handling tests (`tests/e2e/errors/error-handling.spec.ts`)
  - Network timeout
  - 404 Not Found
  - 500 Internal Server Error
  - 401 Unauthorized
  - 403 Forbidden
  - Invalid JSON response
  - Invalid CSV response
  - CORS errors
  - Empty response
  - Large response handling
  - Rate limiting
  - Connection refused

### 5.10 Integration Testing Tasks

- [ ] **E2E-900**: Panel integration tests (`tests/e2e/integration/panel-integration.spec.ts`)
  - Create panel with query
  - Display table data
  - Display time series data
  - Display logs
  - Panel refresh
  - Query inspector

- [ ] **E2E-901**: Dashboard workflow tests (`tests/e2e/integration/dashboard-workflow.spec.ts`)
  - End-to-end workflow: Create dashboard → Add datasource → Create query → View data
  - Multiple panels with different query types
  - Dashboard variables with Infinity queries
  - Save and load dashboard
  - Export dashboard

### 5.11 Visual & Performance Testing Tasks

- [ ] **E2E-1000**: Visual regression tests (`tests/e2e/visual/visual-regression.spec.ts`)
  - Config editor UI
  - Query editor UI for each query type
  - Panel displays
  - Error states
  - Loading states

- [ ] **E2E-1001**: Performance tests
  - Query execution time benchmarks
  - Large dataset handling
  - Concurrent query performance
  - Memory usage monitoring

### 5.12 Documentation Tasks

- [ ] **DOC-001**: Create E2E testing guide
  - How to run E2E tests locally
  - How to write new E2E tests
  - Testing patterns and best practices
  - Debugging failed tests

- [ ] **DOC-002**: Update CONTRIBUTING.md
  - Add E2E testing section
  - Test coverage requirements
  - PR testing guidelines

- [ ] **DOC-003**: Create test maintenance guide
  - Updating snapshots
  - Handling flaky tests
  - Test infrastructure maintenance
  - CI troubleshooting

---

## 6. Success Metrics

### 6.1 Coverage Metrics

**Target Metrics** (by end of Phase 7):

| Metric | Baseline | Target | Tracking |
|--------|----------|--------|----------|
| E2E Test Count | 2 tests | 150+ tests | Count test files/cases |
| Query Type Coverage | 0% (0/11) | 100% (11/11) | Test execution |
| Data Source Coverage | 0% (0/6) | 100% (6/6) | Test execution |
| Parser Coverage | 0% (0/5) | 100% (5/5) | Test execution |
| Auth Method Coverage | 0% (0/7) | 85% (6/7) | Test execution |
| Output Format Coverage | 0% (0/8) | 100% (8/8) | Test execution |
| Critical Workflow Coverage | 10% (2/19) | 100% (19/19) | Manual checklist |
| CI Test Execution Time | <1 min | <15 min | CI metrics |
| Test Pass Rate | N/A | >95% | CI metrics |
| Flaky Test Rate | N/A | <2% | CI metrics |

### 6.2 Quality Metrics

- **Bug Detection**: E2E tests catch 70%+ of critical bugs before release
- **Regression Prevention**: 90%+ of regressions caught by E2E tests
- **Developer Experience**: E2E test results available within 15 minutes of PR submission
- **Maintenance Cost**: <5% of development time spent on test maintenance

### 6.3 Reporting

**Weekly Reports**:
- Test coverage progress
- New tests added
- Failed tests analysis
- Flaky test tracking

**Monthly Reports**:
- Overall coverage trends
- CI performance metrics
- Bug detection effectiveness
- Test maintenance costs

---

## 7. Risks and Mitigations

### 7.1 Identified Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Test Flakiness** | High | Medium | Use deterministic mocks, proper waits, retry logic |
| **Slow Test Execution** | Medium | High | Parallel execution, test sharding, optimize queries |
| **High Maintenance Cost** | High | Medium | Page objects, reusable utilities, good documentation |
| **External API Dependencies** | High | Low | Mock all external APIs, use fixtures |
| **CI Resource Constraints** | Medium | Medium | Optimize test suite, use caching, parallel runners |
| **Incomplete Coverage** | High | Low | Phased approach, prioritization, regular reviews |
| **Developer Adoption** | Medium | Medium | Good documentation, examples, training |
| **Test Data Management** | Low | Low | Fixtures, generators, cleanup procedures |

### 7.2 Mitigation Strategies

**Test Flakiness**:
- Use `@grafana/plugin-e2e` best practices
- Implement explicit waits for elements
- Mock all external dependencies
- Add retry logic for transient failures
- Regular flaky test reviews

**Slow Execution**:
- Parallel test execution in CI
- Test sharding across multiple runners
- Optimize test setup/teardown
- Use cached Grafana instances
- Profile slow tests

**High Maintenance**:
- Page object pattern for UI stability
- Reusable test utilities
- Clear naming conventions
- Comprehensive documentation
- Automated dependency updates

**External Dependencies**:
- Mock all HTTP requests
- Use deterministic test data
- Fixtures for common scenarios
- No real API calls in tests

---

## 8. Resources and Timeline

### 8.1 Resource Requirements

**Personnel**:
- 1 Senior QA Engineer (full-time, 14 weeks)
- 1 Frontend Developer (part-time, 20% allocation)
- 1 Backend Developer (part-time, 10% allocation)
- 1 Tech Writer (part-time, 10% allocation for documentation)

**Infrastructure**:
- CI runners for parallel test execution
- Test data storage
- Screenshot storage for visual regression

**Tools**:
- Playwright (existing)
- `@grafana/plugin-e2e` (existing)
- MSW or similar for API mocking (to be added)
- Percy or similar for visual regression (to be evaluated)

### 8.2 Timeline

**Total Duration**: 14 weeks (3.5 months)

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1: Foundation | 2 weeks | Week 1 | Week 2 |
| Phase 2: Core Query Types | 3 weeks | Week 3 | Week 5 |
| Phase 3: Data Sources & Auth | 2 weeks | Week 6 | Week 7 |
| Phase 4: Transformations & Formats | 2 weeks | Week 8 | Week 9 |
| Phase 5: Advanced Features | 2 weeks | Week 10 | Week 11 |
| Phase 6: Error Handling & Polish | 2 weeks | Week 12 | Week 13 |
| Phase 7: Documentation & Maintenance | 1 week | Week 14 | Week 14 |

**Milestones**:
- **Week 2**: Test infrastructure complete, 5+ helper utilities created
- **Week 5**: All 11 query types have basic E2E tests (50+ tests)
- **Week 7**: Data sources and authentication tested (30+ tests)
- **Week 9**: Transformations and formats tested (40+ tests)
- **Week 11**: Advanced features tested (25+ tests)
- **Week 13**: Error handling and visual regression complete (20+ tests)
- **Week 14**: Documentation complete, full test suite running in CI

---

## 9. Maintenance and Continuous Improvement

### 9.1 Ongoing Maintenance

**Regular Activities**:
- Weekly review of flaky tests
- Monthly test coverage analysis
- Quarterly test suite optimization
- Bi-annual test infrastructure updates

**Test Updates**:
- Add E2E tests for all new features
- Update tests when UI changes
- Remove obsolete tests
- Refactor tests for maintainability

### 9.2 Continuous Improvement

**Feedback Loop**:
1. Collect metrics from CI
2. Analyze bug reports and correlate with test coverage
3. Identify gaps in coverage
4. Prioritize new test scenarios
5. Implement improvements

**Regular Reviews**:
- Quarterly test coverage review
- Annual testing strategy review
- Continuous feedback from developers

---

## 10. Conclusion

The Grafana Infinity Datasource plugin currently has minimal E2E test coverage (~5%). This comprehensive improvement plan provides a structured approach to achieving 80%+ coverage across all critical workflows, query types, data sources, and features.

By following the 7-phase implementation plan over 14 weeks, the team will:
1. Establish robust test infrastructure and utilities
2. Cover all 11 query types with comprehensive tests
3. Test all 6 data sources and 7 authentication methods
4. Validate all data transformations and output formats
5. Test advanced features including variables and configuration
6. Handle error scenarios and edge cases
7. Maintain comprehensive documentation

**Expected Outcomes**:
- **150+ E2E tests** covering critical user workflows
- **100% coverage** of query types, data sources, parsers, and formats
- **<15 minute** CI execution time with parallel testing
- **>95% test pass rate** with <2% flaky tests
- **Comprehensive documentation** for test development and maintenance

**Key Success Factors**:
- Dedicated QA resources
- Phased implementation approach
- Focus on test reliability and maintainability
- Strong CI integration
- Regular reviews and continuous improvement

This plan provides a clear roadmap from the current minimal E2E coverage to a comprehensive, maintainable test suite that will significantly improve plugin quality and reduce regression risk.

---

## Appendix A: Test Case Examples

### Example 1: JSON Query with Simple Parser

```typescript
test('JSON query with simple parser extracts array data', async ({ page, createDataSourceConfigPage }) => {
  // Setup datasource
  await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });
  
  // Navigate to explore
  await page.goto('/explore');
  
  // Configure JSON query
  await page.getByTestId('infinity-query-type-selector').click();
  await page.getByText('JSON').click();
  
  await page.getByTestId('infinity-query-source-selector').click();
  await page.getByText('Inline').click();
  
  await page.getByTestId('infinity-query-data-field').fill(`
    [
      {"name": "Alice", "age": 30, "city": "New York"},
      {"name": "Bob", "age": 25, "city": "London"}
    ]
  `);
  
  // Add columns
  await page.getByRole('button', { name: 'Add Column' }).click();
  await page.getByTestId('column-selector-0').fill('name');
  await page.getByTestId('column-type-0').selectOption('string');
  
  // Execute query
  await page.getByRole('button', { name: 'Run query' }).click();
  
  // Verify results
  await expect(page.getByText('Alice')).toBeVisible();
  await expect(page.getByText('Bob')).toBeVisible();
  await expect(page.getByText('New York')).toBeVisible();
});
```

### Example 2: CSV Query with Filters

```typescript
test('CSV query with filters returns filtered data', async ({ page, createDataSourceConfigPage }) => {
  // Setup datasource
  await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });
  
  // Navigate to explore
  await page.goto('/explore');
  
  // Configure CSV query
  await page.getByTestId('infinity-query-type-selector').click();
  await page.getByText('CSV').click();
  
  await page.getByTestId('infinity-query-source-selector').click();
  await page.getByText('Inline').click();
  
  await page.getByTestId('infinity-query-data-field').fill(`
    name,age,city
    Alice,30,New York
    Bob,25,London
    Charlie,35,Paris
  `);
  
  // Add filter: age > 25
  await page.getByRole('button', { name: 'Add Filter' }).click();
  await page.getByTestId('filter-field-0').fill('age');
  await page.getByTestId('filter-operator-0').selectOption('Greater Than');
  await page.getByTestId('filter-value-0').fill('25');
  
  // Execute query
  await page.getByRole('button', { name: 'Run query' }).click();
  
  // Verify results (Alice and Charlie, but not Bob)
  await expect(page.getByText('Alice')).toBeVisible();
  await expect(page.getByText('Charlie')).toBeVisible();
  await expect(page.getByText('Bob')).not.toBeVisible();
});
```

### Example 3: Authentication with Bearer Token

```typescript
test('Query with Bearer token authentication', async ({ page, createDataSourceConfigPage }) => {
  // Setup datasource with auth
  await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });
  
  // Configure authentication
  await page.getByLabel('Authentication').click();
  await page.getByText('Bearer Token').click();
  
  await page.getByLabel('Token').fill('test-bearer-token-123');
  
  // Save datasource
  await page.getByRole('button', { name: 'Save & test' }).click();
  
  // Verify health check passes
  await expect(page.getByText('Data source is working')).toBeVisible();
});
```

---

## Appendix B: Useful Commands

```bash
# Run all E2E tests
yarn e2e

# Run specific test file
yarn e2e tests/e2e/queries/json.spec.ts

# Run tests in headed mode (see browser)
yarn e2e --headed

# Run tests in debug mode
yarn e2e --debug

# Update visual snapshots
yarn e2e --update-snapshots

# Run tests with specific tag
yarn e2e --grep @smoke

# Generate test report
yarn e2e --reporter=html

# Run tests in specific browser
yarn e2e --project=chromium
yarn e2e --project=firefox
```

---

## Appendix C: References

**Documentation**:
- [Playwright Documentation](https://playwright.dev/)
- [@grafana/plugin-e2e Documentation](https://github.com/grafana/plugin-tools/tree/main/packages/plugin-e2e)
- [Grafana Plugin Development Guide](https://grafana.com/docs/grafana/latest/developers/plugins/)

**Related Issues**:
- Current E2E tests: `tests/e2e/smoke.spec.ts`, `tests/e2e/configeditor.spec.ts`
- CI configuration: `.github/workflows/push.yaml`
- Plugin CI workflows: `grafana/plugin-ci-workflows`

**Tools**:
- Playwright: End-to-end testing framework
- @grafana/plugin-e2e: Grafana-specific test utilities
- MSW (Mock Service Worker): API mocking
- Percy/Chromatic: Visual regression testing
