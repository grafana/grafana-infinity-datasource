---
slug: '/filters'
title: 'Filter data'
menuTitle: Filter data
description: Filter query results using filter expressions, visual filters, or UQL where clauses in the Infinity data source.
aliases:
  - /filters
keywords:
  - infinity
  - filter
  - where clause
  - template variables
weight: 200
---

# Filter data

The Infinity data source provides multiple ways to filter data depending on which parser you use. You can filter results using expressions, visual filters, or query language syntax.

{{< admonition type="note" >}}
All filtering happens after retrieving the content from the source.
For better performance, use filtering provided by the API when possible (for example, query parameters in the URL).
{{< /admonition >}}

## Filter methods by parser

| Parser | Filter method |
|--------|---------------|
| Backend (JSONata) | Filter expression field |
| Backend (JQ) | Filter expression field |
| Frontend | Visual filter editor |
| UQL | `where` clause in query |
| GROQ | Native GROQ filtering |

## Filter with the Backend parser

When using the Backend parser (JSONata or JQ), use the **Filter** expression field to filter rows. The expression must evaluate to `true` or `false`.

### Filter expression syntax

Filter expressions support the following operators:

| Category | Operators | Example |
|----------|-----------|---------|
| Comparison | `==`, `!=`, `>`, `>=`, `<`, `<=` | `price > 100` |
| Logical | `&&`, `\|\|`, `!` | `price > 100 && stock > 0` |
| String | `==`, `!=` | `status == 'active'` |
| Null check | `!= null`, `== null` | `name != null` |
| Membership | `IN`, `NOT IN` | `region IN ('US','EU')` |
| Negation | `!()` | `!(region IN ('US','EU'))` |

### Filter with a single value variable

To filter based on a single-value template variable:

```text
region == '${region}'
```

This filters rows where the `region` field matches the selected variable value.

### Filter with a multi-value variable

To filter based on a multi-value template variable, use the `IN` operator with the `singlequote` format:

```text
region IN (${region:singlequote})
```

This filters rows where the `region` field matches any of the selected values.

### Exclude values (NOT IN)

To exclude multiple values, wrap the condition with `!()`:

```text
!(region IN (${region:singlequote}))
```

### Combine multiple conditions

You can combine conditions using `&&` (AND) and `||` (OR):

```text
region == 'US' && status == 'active'
price > 100 || featured == true
```

## Filter with the Frontend parser

When using the Frontend parser with defined columns, you can use the visual filter editor. This provides a drop-down interface for selecting fields, operators, and values.

### Available filter operators

The visual filter editor supports the following operators:

| Operator | Description |
|----------|-------------|
| Equals | Exact match (case-sensitive) |
| Not Equals | Does not match (case-sensitive) |
| Contains | Field contains the value |
| Not Contains | Field does not contain the value |
| Starts With | Field starts with the value |
| Ends With | Field ends with the value |
| Equals - Ignore Case | Exact match (case-insensitive) |
| Not Equals - Ignore Case | Does not match (case-insensitive) |
| Contains - Ignore Case | Contains (case-insensitive) |
| Not Contains - Ignore Case | Does not contain (case-insensitive) |
| Starts With - Ignore Case | Starts with (case-insensitive) |
| Ends With - Ignore Case | Ends with (case-insensitive) |
| Regex | Matches regular expression |
| Regex not match | Does not match regular expression |
| In | Value is in a list |
| Not In | Value is not in a list |
| == | Numeric equals |
| != | Numeric not equals |
| < | Less than |
| <= | Less than or equal to |
| > | Greater than |
| >= | Greater than or equal to |

{{< admonition type="note" >}}
The visual filter editor is only available when using the Frontend parser and when you have defined at least one column.
{{< /admonition >}}

## Filter with UQL

When using UQL (Unified Query Language), use the `where` clause to filter data.

### Basic UQL filter

```uql
parse-json
| where "region" == 'US'
| summarize count("name") by "region"
```

### UQL with single-value variable

```uql
parse-json
| where "region" == '${region}'
| summarize count("name") by "region"
```

### UQL with multi-value variable

```uql
parse-json
| where "region" in (${region:singlequote})
| summarize count("name") by "region"
```

### UQL exclude values (NOT IN)

```uql
parse-json
| where "region" !in (${region:singlequote})
| summarize count("name") by "region"
```

### UQL with JSONata expressions

You can also use JSONata syntax within UQL for more complex filtering:

```uql
parse-json
| jsonata "$[region='${region}']"
| summarize count("name") by "region"
```

For multi-value variables with JSONata:

```uql
parse-json
| jsonata "$[region in [${region:singlequote}]]"
| summarize count("name") by "region"
```

To exclude values with JSONata:

```uql
parse-json
| jsonata "$[$not(region in [${region:singlequote}])]"
| summarize count("name") by "region"
```

## Use template variables in filters

Template variables make filters dynamic, allowing users to select values from dashboard drop-downs.

### Variable formatting options

When using multi-value variables in filters, use the appropriate format option:

| Format | Syntax | Output example |
|--------|--------|----------------|
| Single quote | `${var:singlequote}` | `'value1','value2'` |
| Double quote | `${var:doublequote}` | `"value1","value2"` |
| Raw | `${var:raw}` | `value1,value2` |

For more information about variable formatting, refer to [Advanced variable format options](https://grafana.com/docs/grafana/latest/dashboards/variables/variable-syntax/#advanced-variable-format-options).
