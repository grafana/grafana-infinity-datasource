---
slug: '/tracing'
title: Tracing
menuTitle: Tracing
description: Configure data for trace visualization with the Infinity data source.
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/references/display-options/format-tracing/
keywords:
  - infinity
  - tracing
  - traces
  - visualization
  - spans
labels:
  products:
    - oss
weight: 50
---

# Tracing

The Traces format transforms your API data into a format compatible with the Traces panel in Grafana. Use this feature to visualize distributed tracing data from any API that returns span information.

For general information about the Traces panel, refer to [Traces](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/traces/).

## Before you begin

- Ensure you have the Infinity data source installed and configured
- Familiarize yourself with distributed tracing concepts (spans, traces, parent-child relationships)

## Supported data formats

You can create trace visualizations from the following data formats:

- JSON
- CSV
- XML
- GraphQL

## Required fields

Your data must include the following fields for trace visualization:

| Field | Type | Description |
|-------|------|-------------|
| `spanID` | String | Unique identifier for the span |
| `parentSpanID` | String | ID of the parent span (empty for root spans) |
| `traceID` | String | Identifier that groups related spans |
| `startTime` | Timestamp | When the span started |
| `duration` | Number | Duration of the span in milliseconds |
| `serviceName` | String | Name of the service that generated the span |
| `operationName` | String | Name of the operation being traced |

## Optional fields

| Field | Type | Description |
|-------|------|-------------|
| `statusCode` | Number | Status code (0 = unset, 1 = OK, 2 = error) |
| `statusMessage` | String | Status message or error description |
| `tags` | Object | Key-value pairs for span metadata |
| `logs` | Array | Log entries associated with the span |

## Create a trace query

1. In the query editor, select your data **Type** (JSON, CSV, etc.).
2. Configure the **Source** and **URL** or inline data.
3. Set **Format** to **Traces**.
4. Configure columns to map your data fields to the required trace fields.

## Examples

### CSV example

**Data:**

```csv
spanID,parentSpanID,traceID,startTime,duration,serviceName,operationName
s1,,t1,1704067200000,10000,router,HTTP GET /api
s2,s1,t1,1704067200100,6000,frontend,renderPage
s3,s1,t1,1704067200200,4000,backend,fetchData
s4,s2,t1,1704067200150,1000,frontend,parseTemplate
s5,s2,t1,1704067200200,1500,frontend,formatOutput
s6,s3,t1,1704067200300,2200,database,SELECT query
```

**UQL query to convert timestamps:**

If your `startTime` is in Unix seconds rather than milliseconds, use UQL to convert:

```sql
parse-csv
| extend "startTime"=unixtime_seconds_todatetime("startTime")
```

### JSON example

```json
{
  "spans": [
    {
      "spanID": "s1",
      "parentSpanID": "",
      "traceID": "t1",
      "startTime": 1704067200000,
      "duration": 10000,
      "serviceName": "router",
      "operationName": "HTTP GET /api"
    },
    {
      "spanID": "s2",
      "parentSpanID": "s1",
      "traceID": "t1",
      "startTime": 1704067200100,
      "duration": 6000,
      "serviceName": "frontend",
      "operationName": "renderPage"
    }
  ]
}
```

Set the root selector to `spans` and the format to **Traces**.

## Column mapping

When your source data uses different field names, use column aliases to map them to the required trace fields:

| Source field | Alias (Trace field) |
|--------------|---------------------|
| `span_id` | `spanID` |
| `parent_id` | `parentSpanID` |
| `trace_id` | `traceID` |
| `start_time` | `startTime` |
| `service` | `serviceName` |
| `operation` | `operationName` |

## Timestamp formats

The `startTime` field should be a Unix timestamp in milliseconds. If your data uses a different format:

- **Unix seconds:** Use UQL `extend "startTime"=unixtime_seconds_todatetime("startTime")`
- **ISO 8601 string:** The parser automatically converts ISO 8601 timestamps

{{< admonition type="note" >}}
The `duration` field should be in milliseconds. If your data uses a different unit, use computed columns or UQL to convert it.
{{< /admonition >}}
