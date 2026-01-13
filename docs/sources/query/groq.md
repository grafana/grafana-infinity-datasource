---
slug: '/groq'
title: 'GROQ parser'
menuTitle: GROQ parser
description: Query and transform JSON data using GROQ (Graph-Relational Object Queries) syntax in the Infinity data source.
aliases:
  - /groq
keywords:
  - infinity
  - groq
  - parser
  - json query
weight: 320
---

# GROQ parser

The GROQ parser allows you to query and transform JSON data using [GROQ (Graph-Relational Object Queries)](https://groq.dev/) syntax. GROQ was developed by [Sanity.io](https://www.sanity.io/docs/groq) as a query language designed to work directly on JSON documents.

{{< admonition type="caution" >}}
The GROQ parser is currently in alpha. The underlying [groq-js library](https://github.com/sanity-io/groq-js) is still under development, and some features may be limited.
{{< /admonition >}}

## Supported data formats

GROQ is available as a frontend parser for the following data formats:

| Data format | Available |
|-------------|-----------|
| JSON | Yes |
| GraphQL | Yes |
| CSV | No |
| TSV | No |
| XML | No |
| HTML | No |

You can also use GROQ as a standalone query type by selecting **GROQ** from the Type drop-down.

## Basic syntax

GROQ queries start with `*` which represents all documents in the dataset. You can then filter and project the results.

### Select all data

To return all data without transformation:

```groq
*
```

### Filter by condition

Use square brackets to filter data:

```groq
*[age >= 20]
```

This returns only items where `age` is 20 or greater.

### Project specific fields

Use curly braces to select specific fields:

```groq
*{name, email}
```

This returns only the `name` and `email` fields from each item.

### Combine filter and projection

You can chain filtering and projection:

```groq
*[age >= 20]{name}
```

This filters items where `age` is 20 or greater, then returns only the `name` field.

## Query examples

### Filter by string value

```groq
*[status == "active"]
```

### Filter by multiple conditions

```groq
*[age >= 18 && country == "US"]
```

### Select nested fields

```groq
*{name, address{city, country}}
```

### Order results

```groq
*[_type == "user"] | order(name asc)
```

### Limit results

```groq
*[0...10]
```

Returns the first 10 items.

## Use GROQ with JSON data

To use GROQ with JSON data:

1. Select **JSON** as the Type
2. Set the Parser to **GROQ** (under Frontend options)
3. Enter your GROQ query in the GROQ Query field

Alternatively, select **GROQ** directly as the Type for a simplified interface.

## Known limitations

- **Array data**: GROQ works best with array-type JSON documents. Object-type responses may require additional handling.
- **Alpha status**: Some advanced GROQ features may not be available due to the alpha status of the groq-js library.
- **Frontend only**: GROQ runs in the browser, not on the Grafana server. This means GROQ queries don't support features that require backend processing, such as alerting or recorded queries.

## Additional resources

- [GROQ specification](https://groq.dev/)
- [GROQ cheat sheet](https://www.sanity.io/docs/groq-cheat-sheet)
- [GROQ functions reference](https://www.sanity.io/docs/groq-functions)
- [groq-js library](https://github.com/sanity-io/groq-js)
