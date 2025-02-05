---
slug: '/jq-backend'
title: 'JQ Backend Parser'
menuTitle: JQ Backend Parser
description: JQ Backend Parser
aliases:
  - infinity
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
labels:
  products:
    - oss
weight: 302
---

JQ Backend parser (**Beta**) for infinity is introduced in version 3.0.0. Setting the parser to **jq-backend** in your query editor will allow you to use features such as `alerting`, `grafana expressions` ,`recorded queries`, `enterprise query caching` and `shared dashboards`.

This parser is very similar to default backend parser where you use JSONata syntax in root selector. But with JQ backend parser, you will be using jq syntax in the root selector.

All other backend features such as **Computed fields**, **Filter**, **Summarize** and **Pagination** works similar to backend parser

## Example 1 - Simple JSON array

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

```csv
age,name
123,foo
456,bar
```

## Example 2 - Nested JSON

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

```csv
age,name
123,foo
456,bar
```

## More examples

For more examples and to learn more about jq syntax, refer official [jq documentation](https://jqlang.org/).
