---
description: "Use when writing or modifying Go backend tests. Covers table-driven tests, testify assertions, HTTP mocking, golden files, and test helpers."
applyTo: "pkg/**/*_test.go"
---
# Go Test Conventions

## Package Declaration

Use external test packages (`package foo_test`) by default. Use internal packages only when testing unexported functions.

## Table-Driven Tests

Use `tests` as the slice name and `tt` as the iterator:

```go
func TestSomething(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    SomeType
        wantErr error
    }{
        {name: "descriptive case name", input: "...", want: SomeType{...}},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := SomeFunc(tt.input)
            if tt.wantErr != nil {
                require.NotNil(t, err)
                assert.Equal(t, tt.wantErr, err)
                return
            }
            require.Nil(t, err)
            assert.Equal(t, tt.want, got)
        })
    }
}
```

## Assertions

Use `testify/require` for fatal checks and `testify/assert` for non-fatal:

```go
import (
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)
```

- Nil-error check: `require.Nil(t, err)` (not `require.NoError`)
- Error expected: `require.NotNil(t, err)` then `assert.Equal(t, tt.wantErr, err)`
- Sentinel errors: `require.ErrorIs(t, err, models.ErrSomething)`
- Error source: `require.Equal(t, backend.ErrorSourceDownstream, res.ErrorSource)`

## HTTP Mocking

For unit tests, use the `InfinityMocker` RoundTripper from `pkg/testsuite/`:

```go
client.HttpClient.Transport = &InfinityMocker{Body: `{"key":"value"}`}
client.IsMock = true
```

For integration tests, use `httptest.Server`:

```go
server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, `{"message":"OK"}`)
}))
defer server.Close()
```

## Golden Files

For parser output validation, use `experimental.CheckGoldenJSONResponse`:

```go
experimental.CheckGoldenJSONResponse(t, "golden", testName, &response, UPDATE_GOLDEN_DATA)
```

Golden files live in `pkg/testsuite/golden/` as `.jsonc` files.

## Context

Prefer `t.Context()` in new tests. `context.Background()` is acceptable.

## Helpers

Mark all test helpers with `t.Helper()` for correct failure line reporting. Use pointer helpers `toFP()` / `toSP()` from `pkg/testsuite/` for nullable fields.

## Query Construction

Build queries using inline JSON strings passed to `models.LoadQuery`:

```go
query, err := models.LoadQuery(ctx, backend.DataQuery{
    JSON: []byte(`{"type":"json","source":"url","url":"http://example.com"}`),
}, models.InfinitySettings{})
```
