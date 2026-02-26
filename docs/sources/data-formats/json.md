---
slug: '/json'
title: JSON
menuTitle: JSON
description: Query JSON APIs and files with the Infinity data source
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/json/
keywords:
  - infinity
  - JSON
  - REST API
  - JSONPath
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 10
---

# JSON

Select **JSON** as the query type to retrieve data from JSON APIs or files. You can query data from a URL or provide inline JSON data.

{{< admonition type="tip" >}}
For a guided introduction, check out the [Visualize JSON data using the Infinity data source](https://grafana.com/docs/learning-journeys/infinity-json/) learning journey.
{{< /admonition >}}

{{< docs/play title="Infinity plugin JSON demo" url="https://play.grafana.org/d/infinity-json" >}}

## Query a public JSON API

To fetch data from a publicly accessible JSON API endpoint, enter the URL in the query editor.

**Example URL**: `https://jsonplaceholder.typicode.com/users`

When the API returns an array at the root level, no additional configuration is required. The plugin automatically detects the fields.

## Access nested properties

When your data is nested within a property, use the **Root selector** field to specify the path to the data array.

**Example URL**: `https://thingspeak.com/channels/38629/feed.json`

If the data is in the `feeds` property, set the root selector to `feeds`. Then add columns to define the fields and their types.

## Query data without a time field

For data without timestamps, set the **Format** to **Timeseries** to add a simulated time field. This allows visualization in time-based panels.

**Example data**:

```json
[
  { "country": "india", "population": 300 },
  { "country": "usa", "population": 200 },
  { "country": "uk", "population": 150 },
  { "country": "china", "population": 400 }
]
```

## Use inline JSON data

Instead of querying a URL, you can provide JSON data directly in the query editor:

1. Set **Source** to **Inline**.
1. Enter your JSON data in the data field.
1. Define columns to specify which fields to display.

**Example inline data**:

```json
[
  { "country": "india", "population": 420 },
  { "country": "usa", "population": 200 },
  { "country": "uk", "population": 150 },
  { "country": "china", "population": 400 }
]
```

## Use JSONPath in the root selector

The root selector supports JSONPath syntax for complex data extraction. Any selector starting with `$` is treated as a JSONPath expression.

**Example data**:

```json
{
  "customers": [
    { "name": "mary", "age": 22, "gender": "female" },
    { "name": "joseph", "age": 41, "gender": "male" }
  ],
  "premium_customers": [
    { "name": "john doe", "age": 21, "gender": "male" }
  ]
}
```

| Root selector | Result |
|---------------|--------|
| `$.premium_customers` | Returns only `john doe` |
| `$.*` | Returns all three rows from both arrays |

## Parser options

The Infinity data source offers multiple parsers for JSON data:

### Default parser

The default parser handles most JSON structures. Use this for simple queries without advanced transformations.

### UQL parser

Use the [UQL parser](/docs/plugins/yesoreyeram-infinity-datasource/latest/query/uql/) for advanced operations like grouping, ordering, and field manipulation.

**Example UQL query**:

```sql
parse-json
| scope "feeds"
| project "ts"=todatetime("created_at"), "Density"=tonumber("field1")
```

### Backend parser

Use the **Backend** parser when you need:

- Alerting support
- Recorded queries
- Server-side processing

When using the backend parser:

- Timestamp fields must use ISO 8601 format (for example, `2006-01-02T15:04:05Z07:00`) or specify a custom layout using [Go time format](https://www.geeksforgeeks.org/time-formatting-in-golang/).
- Use the **Summarize** field to aggregate numeric values with functions like `sum`, `min`, `max`, `mean`, `first`, and `last`.

**Example summarize expression**: `last(density_of_eastbound_cars) - last(density_of_westbound_cars)`
