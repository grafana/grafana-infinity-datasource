---
slug: '/jq-backend'
title: 'JQ parser'
menuTitle: JQ parser
description: Transform and manipulate data using JQ syntax with the Infinity data source JQ parser.
aliases:
  - /jq-backend
keywords:
  - infinity
  - jq
  - parser
  - json query
  - data transformation
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 120
---

# JQ parser

The JQ parser allows you to transform and manipulate data using [JQ syntax](https://jqlang.org/). JQ is a lightweight command-line JSON processor that provides powerful filtering and transformation capabilities.

To use JQ, select **Backend → JQ** as the parser type in the query editor.

## Benefits of using the JQ parser

Using the JQ parser enables the following Grafana features:

- [Alerting](https://grafana.com/docs/grafana/latest/alerting/)
- [Shared dashboards](https://grafana.com/docs/grafana/latest/dashboards/share-dashboards-panels/shared-dashboards/)
- [SQL expressions](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/sql-expressions/)
- [Query caching](https://grafana.com/docs/grafana/latest/administration/data-source-management/#query-and-resource-caching)
- [Recorded queries](https://grafana.com/docs/grafana/latest/administration/recorded-queries/)

## Supported data formats

The JQ parser is available for the following data formats:

| Data format | Available |
|-------------|-----------|
| JSON | Yes |
| GraphQL | Yes |
| XML | Yes |
| HTML | Yes |
| CSV | No |
| TSV | No |

## Root selector

The root selector uses JQ syntax to extract and transform data. Enter your JQ expression in the **Rows / Root** field.

### Basic syntax

| Syntax | Description | Example |
|--------|-------------|---------|
| `.` | Current element | `.` |
| `.[]` | Iterate array | `.[]` |
| `.field` | Access field | `.name` |
| `.field[]` | Iterate nested array | `.data[]` |
| `.[0]` | Access array index | `.[0]` |
| `.field.nested` | Access nested field | `.user.address` |

## Examples

### Extract array elements

For JSON data:

```json
[
  { "name": "foo", "age": 123 },
  { "name": "bar", "age": 456 }
]
```

Root selector: `.[]`

Result:

| age | name |
|-----|------|
| 123 | foo |
| 456 | bar |

### Extract from nested object

For JSON data:

```json
{
  "meta": { "hello": "world" },
  "data": [
    { "name": "foo", "age": 123 },
    { "name": "bar", "age": 456 }
  ]
}
```

Root selector: `.data[]`

Result:

| age | name |
|-----|------|
| 123 | foo |
| 456 | bar |

### Filter array elements

Root selector: `.data[] | select(.age > 100)`

This returns only elements where `age` is greater than 100.

### Select specific fields

Root selector: `.data[] | {name, age}`

This returns only the `name` and `age` fields from each element.

### Transform field values

Root selector: `.[] | {name: .name, ageInMonths: (.age * 12)}`

This transforms the `age` field to months.

### Access first element

Root selector: `.[0]`

This returns only the first element of the array.

### Flatten nested arrays

Root selector: `.data[].items[]`

This flattens nested arrays into a single result set.

## Computed columns, filter, and summarize

Computed columns, filter, and summarize are shared backend parser features that work the same way in both the JQ and JSONata parsers.

For the full reference on these features — including available operators, expression syntax, filter examples, aggregation functions, and group-by options — refer to [Computed columns, filter, and summarize](./backend/#computed-columns-filter-and-summarize) in the JSONata parser documentation.

## JQ vs JSONata

Both parsers are backend parsers with the same post-processing features (computed columns, filter, summarize). The main difference is the root selector syntax:

| Feature | JQ | JSONata |
|---------|-----|---------|
| Iterate array | `.[]` | `$` (automatic) |
| Access nested data | `.data[]` | `data` |
| Filter in selector | `.[] \| select(.age > 20)` | `$[age > 20]` |
| Select fields | `.[] \| {name}` | `$.name` |

Choose the parser based on which syntax you're more familiar with.

## Additional resources

- [JQ manual](https://jqlang.org/manual/)
- [JQ tutorial](https://jqlang.org/tutorial/)
- [JQ playground](https://jqplay.org/)
