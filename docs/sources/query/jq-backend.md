---
slug: '/jq-backend'
title: 'JQ backend parser'
menuTitle: JQ backend parser
description: JQ backend parser
keywords:
  - data source
  - infinity
  - json
  - graphql
  - csv
  - tsv
  - xml
  - html
  - api
  - rest
  - jq
labels:
  products:
    - oss
weight: 302
---

# JQ backend parser

JQ backend parser helps you to manipulate the data using JQ style syntax. You have to select JQ/jq-backend as the parser type in the query editor.

Setting the parser to JQ enables features such as [Alerting](https://grafana.com/docs/grafana/latest/alerting/), [Shared Dashboards](https://grafana.com/docs/grafana/latest/dashboards/share-dashboards-panels/shared-dashboards/), [SQL Expressions](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/sql-expressions/), [Query Caching](https://grafana.com/docs/grafana/latest/administration/data-source-management/#query-and-resource-caching), [Recorded Queries](https://grafana.com/docs/grafana/latest/administration/recorded-queries/).

This parser is very similar to JSONata backend parser where you use [JSONata style syntax](https://docs.jsonata.org/overview.html) in root selector. With JQ backend parser, you use [jq style syntax](https://jqlang.org/tutorial/) in the root selector.

## Examples

### Manipulating simple JSON array

```json
[
  {
    "name": "foo",
    "age": 123
  },
  {
    "name": "bar",
    "age": 456
  }
]
```

and the root selector `.[]` will produce the following output

| age | name |
| --- | ---- |
| 123 | foo  |
| 456 | bar  |

### Manipulating nested JSON object

```json
{
  "meta": {
    "hello": "world"
  },
  "data": [
    {
      "name": "foo",
      "age": 123
    },
    {
      "name": "bar",
      "age": 456
    }
  ]
}
```

and the root selector `.data[]` will produce the following output

| age | name |
| --- | ---- |
| 123 | foo  |
| 456 | bar  |

For more examples and to learn more about jq syntax, refer official [jq documentation](https://jqlang.org/tutorial).

## Computed columns

Computed columns option with JQ parser works similar to JSONata parser. Computed columns let you create new fields that calculate their values based on your existing data.

For details on available operators and expression syntax, refer to the [Computed columns section in the JSONata backend parser documentation](../backend/#computed-columns).

## Filter

Filter option with JQ parser works similar to JSONata parser

## Summarize

Summarize option with JQ parser works similar to JSONata parser
