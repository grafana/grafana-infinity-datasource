---
slug: '/transformations'
title: 'Transformations'
menuTitle: Transformations
description: Transformations
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
weight: 7003
---

# Transformations

Server-side transformations are introduced in Infinity 2.0. You can perform basic data manipulation in the server side.

To perform server-side transformations, you need to add a query type of **transformations**. Once this added, **this will perform server side transformation over all the previous infinity queries with backend parser**.

{{< admonition type="note" >}}
Infinity Transformations/Server-side transformations are available only for Infinity data sources or Infinity queries with backend parsers.
{{< /admonition >}}

## Example

![image](https://github.com/grafana/grafana-infinity-datasource/assets/153843/a3116cff-d5eb-4092-83bb-2ca17ec1f052#center)
![image](https://github.com/grafana/grafana-infinity-datasource/assets/153843/bf8b5787-e8b2-4847-95a7-544aa2f4848e#center)

## Supported transformations

### Limit

Limit transformation limits the number of result items rows in each query.

### Filter Expression

Filter the results based on column values in each query.

### Computed Column

Appends a new column based on expression.

### Summarize / Group by

Group by results based on aggregation and dimension.

{{< admonition type="note" >}}
All these transformations are done after processing.
After the server responds with data, the Infinity backend client manipulates the data.
If your API supports server-side transformations, use those instead.
{{< /admonition >}}
