---
description: "Use when creating or modifying Go backend handlers in pluginhost. Covers OTel tracing, error handling, concurrency, and logging patterns."
applyTo: "pkg/pluginhost/handler_*.go"
---
# Go Handler Conventions

## Tracing

Open an OpenTelemetry span at the start of every handler and defer its closure:

```go
ctx, span := tracing.DefaultTracer().Start(ctx, "PluginHost.HandlerName")
defer span.End()
```

For inner query functions, add trace attributes:

```go
ctx, span := tracing.DefaultTracer().Start(ctx, "FunctionName", trace.WithAttributes(
    attribute.String("type", query.Type),
    attribute.String("source", query.Source),
))
defer span.End()
```

On error, record it on the span:

```go
span.RecordError(err)
span.SetStatus(500, err.Error())
```

## Error Handling

- Classify errors by source using `backend.ErrorResponseWithErrorSource(err)`
- Use `backend.IsDownstreamError(err)` to distinguish downstream (target API) from plugin errors
- Guard against nil clients: `backend.PluginError(errors.New("invalid infinity client"))`
- Use typed errors from `pkg/models/errors.go` with `errors.Is()`

## Concurrency (QueryData)

When running queries in parallel, use `dskit/concurrency.ForEachJob` with a `sync.Mutex` to protect shared state:

```go
var m sync.Mutex
_ = concurrency.ForEachJob(ctx, len(queries), concurrentQueryCount, func(ctx context.Context, idx int) error {
    result := processQuery(ctx, queries[idx])
    m.Lock()
    response.Responses[queries[idx].RefID] = result
    m.Unlock()
    return nil
})
```

## Logging

Use structured logging from context:

```go
logger := backend.Logger.FromContext(ctx)
logger.Info("performing action", "key", value)
logger.Error("action failed", "error", err.Error())
```

## Context

Always propagate `context.Context` as the first argument through the full call chain.

## Imports

Standard handler imports:

```go
import (
    "context"
    "errors"
    "fmt"

    "github.com/grafana/grafana-plugin-sdk-go/backend"
    "github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/trace"

    "github.com/grafana/grafana-infinity-datasource/pkg/infinity"
    "github.com/grafana/grafana-infinity-datasource/pkg/models"
)
```
