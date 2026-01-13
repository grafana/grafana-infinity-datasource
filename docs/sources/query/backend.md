---
slug: '/backend'
title: 'JSONata parser'
menuTitle: JSONata parser
description: Transform and manipulate data using JSONata syntax with the Infinity data source JSONata parser.
aliases:
  - /backend
keywords:
  - infinity
  - jsonata
  - parser
  - backend parser
  - data transformation
weight: 100
---

# JSONata parser

The JSONata parser allows you to transform and manipulate data using [JSONata syntax](https://jsonata.org/).

{{< admonition type="note" >}}
In previous versions of the data source, this was referred to as the *backend parser*. In the current version, *backend* is a parser category that includes both the JSONata and JQ parsers.
{{< /admonition >}}

To use JSONata, select **Backend → JSONata** as the parser type in the query editor.

## Supported data formats

The JSONata parser is available for the following data formats:

| Data format | Parser label |
|-------------|--------------|
| JSON | JSONata |
| GraphQL | JSONata |
| XML | JSONata |
| HTML | JSONata |
| CSV | Backend |
| TSV | Backend |

{{< admonition type="note" >}}
For CSV and TSV formats, the backend parser provides the same computed columns, filter, and summarize features, but the root selector uses a different syntax since the data is already tabular.
{{< /admonition >}}

## Benefits of using the JSONata parser

Using the JSONata parser enables the following Grafana features:

- [Alerting](https://grafana.com/docs/grafana/latest/alerting/)
- [Shared dashboards](https://grafana.com/docs/grafana/latest/dashboards/share-dashboards-panels/shared-dashboards/)
- [SQL expressions](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/sql-expressions/)
- [Query caching](https://grafana.com/docs/grafana/latest/administration/data-source-management/#query-and-resource-caching)
- [Recorded queries](https://grafana.com/docs/grafana/latest/administration/recorded-queries/)

## Root selector

The root selector allows you to manipulate the data received from the server. Use [JSONata syntax](https://docs.jsonata.org/overview.html) in the root selector to transform your data before it's processed further.

You can use JSONata functions directly in the root selector. For example:

- `orders` — Select the `orders` array from the response
- `orders.price` — Extract all `price` values from the `orders` array
- `$sum(orders.price)` — Calculate the sum of all prices
- `$avg(orders.quantity)` — Calculate the average quantity

Refer to the [JSONata functions documentation](https://docs.jsonata.org/string-functions) for a complete list of available functions.

## Computed columns

Computed columns let you create new fields that calculate values based on existing data. This is similar to the **Add field from calculation → Binary Operation** transformation but enhanced with a powerful expression language.

For example, `price * qty` multiplies the values of the `price` and `qty` columns to create a new computed field.

### Referencing field names

You can reference field names in two ways:

- **Directly**: Use the field name as-is, matching is case-insensitive. For example, `horsepower` matches a field named `Horsepower`.
- **Brackets**: Use square brackets for exact matching or when field names contain special characters. For example, `[Cylinders] + [Horsepower]`.

### Available operators

Computed columns support a wide range of operators and functions for creating expressions.

| Category | Operators | Description |
|----------|-----------|-------------|
| Arithmetic | `+`, `-`, `*`, `/`, `**`, `%` | Addition, subtraction, multiplication, division, exponentiation, modulo |
| Comparison | `==`, `!=`, `>`, `>=`, `<`, `<=` | Equal, not equal, greater than, greater than or equal, less than, less than or equal |
| Logical | `&&`, `\|\|`, `!` | AND, OR, NOT |
| String | `+` | Concatenation |
| Membership | `IN` | Check if value is in a list |
| Regex | `=~`, `!~` | Match, not match |
| Ternary | `? :` | Conditional expression |

### Supported types

- Numeric types (integer, float)
- Boolean types
- String types
- Arrays/lists (for use with `IN` operator)

For more details on expression syntax and advanced usage, refer to the [govaluate documentation](https://pkg.go.dev/gopkg.in/Knetic/govaluate.v3).

## Filter

Filter expressions let you include or exclude rows based on conditions. The expression must evaluate to `true` or `false`.

**Example filter expressions:**

- `price > 500` — Include rows where price exceeds 500
- `name != 'MacBook' && price != null` — Exclude MacBook and rows with null prices
- `name IN ('MacBook','MacBook Air')` — Include only MacBook or MacBook Air
- `!(name IN ('MacBook','MacBook Air'))` — Exclude MacBook and MacBook Air

## Summarize

The JSONata parser supports summarizing fields into aggregated metrics. You can calculate values like `count(something)`, `max(some-other-thing)`, or `mean([some other thing])` from your data.

### Available aggregation functions

| Function | Description |
|----------|-------------|
| `sum` | Sum of all values |
| `min` | Minimum value |
| `max` | Maximum value |
| `mean` | Average value |
| `count` | Number of items |
| `first` | First value |
| `last` | Last value |

You can also combine functions in expressions, such as `sum(price) / count(id)`.

### Field name syntax

When specifying field names in summarize expressions:

- **Standard format**: Replace special characters with `-` and use lowercase. For example, `Something Else!` becomes `something-else-`. Field names are matched case-insensitively in this format.
- **Bracket format**: Enclose the original field name in square brackets to preserve exact casing and special characters. For example, `min([Something Else!])`.

### Summarize by (group by)

Use the **Summarize By** option to group your aggregation by a specific field, similar to SQL's `GROUP BY` clause.

**Example:**

For data containing employee records with `department` and `salary` fields:

- **Summarize expression**: `sum(salary)`
- **Summarize by**: `department`
- **Result**: Total salary grouped by each department

This produces one row per unique value in the grouping field, with the aggregated result for each group.

### Summarize alias

Use the **Summarize alias** option to specify a custom name for the aggregated result. If not specified, `summary` is used as the default alias. Custom aliases are useful when merging results from different queries using transformations.
