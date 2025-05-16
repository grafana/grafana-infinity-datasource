---
slug: '/backend'
title: 'JSONata backend parser'
menuTitle: JSONata backend parser
description: JSONata backend parser
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
  - jsonata
labels:
  products:
    - oss
weight: 301
---

# JSONata (backend parser)

JSONata backend parser helps you to manipulate the data using JSONata style syntax. You have to select JSONata/backend as the parser type in the query editor.

Setting the parser to JSONata/backend allow you to use features such as [Alerting](https://grafana.com/docs/grafana/latest/alerting/), [Shared Dashboards](https://grafana.com/docs/grafana/latest/dashboards/share-dashboards-panels/shared-dashboards/), [SQL Expressions](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/sql-expressions/), [Query Caching](https://grafana.com/docs/grafana/latest/administration/data-source-management/#query-and-resource-caching), [Recorded Queries](https://grafana.com/docs/grafana/latest/administration/recorded-queries/).

## Root selector/Field selector

Root selector allows you to manipulate the data received from the server. You can use [JSONata style syntax](https://docs.jsonata.org/overview.html) in root selector to manipulate your data.

## Computed fields

Once you have some fields already and you want to compute new field based on existing columns, you can use computed fields to do. This is something similar to the `Add field from calculation -> Binary Operation` transformation but enhanced with powerful expression language. For example `price * qty` gives the multiplication value of two columns names `price` and `qty`

![calculated fields](https://user-images.githubusercontent.com/153843/196197153-306bbf2a-bc95-4be2-b3ad-75e12c8ea404.png#center)

## Filter

If you want to filter data, you can use filter expressions. The expression should yield `true` or `false`. Example: `price > 500`, `name != 'MacBook' && price != null`, `name IN ('MacBook','MacBook Air')` and `!(name IN ('MacBook','MacBook Air'))` are valid filter expressions.

![Filter expression](https://user-images.githubusercontent.com/153843/196344664-33733b04-3ac9-4c00-9c3c-970a9cb63bb3.png#center)

## Summarize

Backend parser also supports summarizing the fields into a metric. For example, `count(something)` or `max(some-other-thing)` or `mean([some other thing])` can be calculated from the array of data. You can also use numeric options such as `sum`,`min`,`max`,`mean`,`first` and `last`. You can also use expressions like `sum(price) / count(id)`.

When specifying the field name, all special characters must be replaced with `-` and also transformed to lower case. Or the field name can also be specified within square brackets if they contain special characters. For example if the field name is `Something Else!`, then that can be specified like `min(something-else-)` or `min([Something Else!])`.

You can optionally specify the alias for the summarize expression using **Summarize alias** option. If nothing specified, `summary` will be used as alias. This alias will be helpful when you want to use merge transformation with results from different queries.
