---
title: Query editor
menuTitle: Query
description: Use the Infinity query editor to retrieve and transform data from APIs
keywords:
  - infinity
  - query editor
  - JSON
  - CSV
  - API
labels:
  products:
    - oss
weight: 40
---

# Infinity query editor

The Infinity query editor allows you to retrieve data from HTTP endpoints and transform it for visualization in Grafana. This document explains the query editor interface and how to build queries.

## Before you begin

- You must have a configured Infinity data source. Refer to [Configure the Infinity data source](/docs/plugins/yesoreyeram-infinity-datasource/latest/configure/) for instructions.
- Familiarize yourself with the data format you want to query (JSON, CSV, XML, GraphQL, or HTML).

## Query editor overview

The query editor consists of several key components:

| Component | Description |
|-----------|-------------|
| **Type** | The data format to query: JSON, CSV, TSV, XML, GraphQL, or HTML |
| **Parser** | How to process the data: Default, JSONata, JQ, UQL, or GROQ |
| **Source** | Where to get the data: URL, Inline, Azure Blob, or Reference |
| **Format** | Output format: Table, Time series, Data frame, Logs, Trace, or Node graph |

## Create a query

To create a basic query:

1. In the query editor, select the **Type** that matches your data format (for example, JSON).
1. Select a **Parser** based on your transformation needs:
   - **Default** - Simple column mapping, runs in frontend
   - **JSONata** - JSONata expressions, runs in backend (supports alerting)
   - **JQ** - JQ expressions, runs in backend (supports alerting)
   - **UQL** - Unstructured Query Language, runs in frontend
   - **GROQ** - Graph-Relational Object Queries, runs in frontend
1. Select the **Source**:
   - **URL** - Fetch data from an HTTP endpoint
   - **Inline** - Enter data directly in the editor
   - **Azure Blob** - Retrieve from Azure Blob Storage
   - **Reference** - Use pre-configured reference data
1. Select the output **Format** based on your visualization needs.
1. If using URL source, enter the endpoint URL and configure the HTTP method.

## URL configuration

When using URL as the source:

| Setting | Description |
|---------|-------------|
| **Method** | HTTP method: GET, POST, PUT, PATCH, or DELETE |
| **URL** | The endpoint URL (supports Grafana variables) |
| **Headers, Request params** | Click to configure additional headers and query parameters |

### Use variables in URLs

You can use Grafana variables and time macros in URLs:

```
https://api.example.com/data?from=${__timeFrom}&to=${__timeTo}
```

For more information about URL configuration, refer to [URL configuration](/docs/plugins/yesoreyeram-infinity-datasource/latest/advanced-features/url/).

## Pagination

For APIs that return data across multiple pages, use the **Pagination** section to automatically fetch and combine results from all pages.

{{< admonition type="note" >}}
Pagination is a beta feature. The maximum number of pages is limited to 5 by default. Grafana administrators can increase this limit using the `GF_PLUGIN_PAGINATION_MAX_PAGES` environment variable. Refer to [Administrator configuration](/docs/plugins/yesoreyeram-infinity-datasource/latest/configure/#administrator-configuration) for details.
{{< /admonition >}}

### Pagination modes

| Mode | Description | Use when |
|------|-------------|----------|
| **None** | No pagination (default) | API returns all data in one response |
| **Offset** | Uses offset/limit parameters | API uses `offset=0&limit=100` style |
| **Page number** | Uses page number parameter | API uses `page=1&size=100` style |
| **Cursor** | Uses cursor from response | API returns a `nextCursor` token |
| **List of values** | Iterates through a list | Need to query multiple IDs or values |

### Configure offset pagination

Use offset pagination when your API accepts `offset` and `limit` (or similar) parameters.

| Setting | Description |
|---------|-------------|
| **Max pages** | Maximum number of pages to fetch (up to 5) |
| **Size field name** | Parameter name for page size (for example, `limit`, `size`, `count`) |
| **Size field type** | Where to send the parameter: Query param, Header, Body form, or Replace URL |
| **Size field value** | Number of items per page |
| **Offset field name** | Parameter name for offset (for example, `offset`, `skip`) |
| **Offset field type** | Where to send the parameter |
| **Initial value** | Starting offset value (usually 0) |

The offset is automatically calculated for each page: `initialValue + ((pageNumber - 1) * pageSize)`.

### Configure page number pagination

Use page number pagination when your API accepts a page number parameter.

| Setting | Description |
|---------|-------------|
| **Max pages** | Maximum number of pages to fetch (up to 5) |
| **Size field name** | Parameter name for page size |
| **Size field value** | Number of items per page |
| **Page field name** | Parameter name for page number (for example, `page`) |
| **Initial value** | Starting page number (usually 1) |

### Configure cursor pagination

Use cursor pagination when your API returns a cursor or token for the next page.

| Setting | Description |
|---------|-------------|
| **Max pages** | Maximum number of pages to fetch (up to 5) |
| **Size field name** | Parameter name for page size |
| **Size field value** | Number of items per page |
| **Cursor field name** | Parameter name for the cursor |
| **Extraction path** | JSONPath or selector to extract the cursor from the response |

The plugin extracts the cursor value from each response and uses it for the next request.

### Configure list pagination

Use list pagination to iterate through a set of values, making one request per value.

| Setting | Description |
|---------|-------------|
| **Field name** | Parameter name to replace |
| **Field type** | Where to send the parameter |
| **Field value** | Comma-separated list of values (for example, `id1,id2,id3`) |

This mode is useful when you need to query multiple resources by ID and combine the results.

## Parsing options

The **Parsing options & Result fields** section configures how data is extracted:

| Setting | Description |
|---------|-------------|
| **Rows/Root** | JSONPath or selector to the array of data rows |
| **Columns** | Define which fields to extract and their data types |

### Configure columns

Click **Add Columns** to define the fields to extract:

| Property | Description |
|----------|-------------|
| **Selector** | Path to the field in your data |
| **Title** | Display name for the column |
| **Type** | Data type: String, Number, Time, Time (UNIX ms), Time (UNIX s), or Boolean |

## Computed columns, filters, and grouping

The **Computed columns, Filter, Group by** section provides additional data transformation options when using backend parsers (JSONata or JQ):

| Feature | Description |
|---------|-------------|
| **Computed Columns** | Create new fields using expressions (for example, `price * qty`) |
| **Filter** | Filter rows using expressions (for example, `age >= 18`) |
| **Summarize** | Aggregate data using functions like `sum()`, `count()`, `mean()` |
| **Summarize By** | Group aggregations by a field |
| **Summarize Alias** | Name for the summarized result |

For detailed information about expressions and operators, refer to [JSONata backend parser](/docs/plugins/yesoreyeram-infinity-datasource/latest/query/backend/).

## Parser options

Choose a parser based on your needs:

| Parser | Runs in | Alerting support | Best for |
|--------|---------|------------------|----------|
| **Default** | Frontend | No | Simple queries with column mapping |
| **JSONata** | Backend | Yes | Complex transformations, alerting |
| **JQ** | Backend | Yes | JQ-style queries, alerting |
| **UQL** | Frontend | No | SQL-like queries, pivoting |
| **GROQ** | Frontend | No | Graph queries |

For detailed parser documentation:
- [JSONata parser](/docs/plugins/yesoreyeram-infinity-datasource/latest/query/backend/)
- [JQ parser](/docs/plugins/yesoreyeram-infinity-datasource/latest/query/jq-backend/)
- [UQL parser](/docs/plugins/yesoreyeram-infinity-datasource/latest/query/uql/)
- [GROQ parser](/docs/plugins/yesoreyeram-infinity-datasource/latest/query/groq/)

## Output formats

Select the appropriate format for your visualization:

| Format | Use case |
|--------|----------|
| **Table** | Display data in table panels |
| **Time series** | Time-based data for graph panels |
| **Data frame** | Generic format for most visualizations |
| **Logs** | Log data for the Logs panel |
| **Trace** | Trace data for the Traces panel |
| **Node graph (nodes/edges)** | Network topology visualization |

For specialized formats, refer to:
- [Logs format](/docs/plugins/yesoreyeram-infinity-datasource/latest/advanced-features/logs/)
- [Tracing format](/docs/plugins/yesoreyeram-infinity-datasource/latest/advanced-features/tracing/)
- [Node graph format](/docs/plugins/yesoreyeram-infinity-datasource/latest/advanced-features/node-graph/)

## Use queries for alerting

To use Infinity queries with Grafana Alerting, you must use a **backend parser** (JSONata or JQ). Frontend parsers (Default, UQL, GROQ) do not support alerting.

Backend parsers also enable:
- [Recorded queries](https://grafana.com/docs/grafana/latest/administration/recorded-queries/)
- [Query caching](https://grafana.com/docs/grafana/latest/administration/data-source-management/#query-and-resource-caching)
- [Shared dashboards](https://grafana.com/docs/grafana/latest/dashboards/share-dashboards-panels/shared-dashboards/)
- [SQL expressions](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/sql-expressions/)

## Use the parsing assistant

Click **Use Assistant to parse data** to open the AI-powered parsing assistant. The assistant can help you:
- Automatically detect data structure
- Suggest column configurations
- Generate parser expressions

{{< admonition type="note" >}}
The parsing assistant requires Grafana's AI features to be enabled.
{{< /admonition >}}

## Next steps

- Learn about [data formats](/docs/plugins/yesoreyeram-infinity-datasource/latest/data-formats/) supported by Infinity
- Explore [macros](/docs/plugins/yesoreyeram-infinity-datasource/latest/query/macros/) for dynamic queries
- Set up [template variables](/docs/plugins/yesoreyeram-infinity-datasource/latest/variables/template-variables/) for interactive dashboards
