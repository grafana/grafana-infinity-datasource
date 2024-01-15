---
slug: '/docs/transformations'
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
    - enterprise
    - grafana cloud
weight: 7003
---

# Transformations

Server side transformations are introduced in Infinity 2.0. You can perform basic data manipulation in the server side.

To perform server side transformations, you need to add a query type of **transformations**. Once this added, **this will perform server side transformation over all the previous infinity queries with backend parser**.

> **Warning**: Infinity Transformations/Server side transformations, are not available neither for non infinity datasources nor infinity queries with non-backend parsers.

## Example

![image](https://github.com/grafana/grafana-infinity-datasource/assets/153843/a3116cff-d5eb-4092-83bb-2ca17ec1f052#center)
![image](https://github.com/grafana/grafana-infinity-datasource/assets/153843/bf8b5787-e8b2-4847-95a7-544aa2f4848e#center)

## Supported transformations

### Limit

Limit transformation limits the number of result items rows in each query.

### Filter Expression

Filter the results based on column values in each query.

### Computed Column

Appends a new column based on expression

### Summarize / Group by

Group by results based on aggregation and dimension.

> **Note**: All these transformations, are done post processing. ( once server responds with data, infinity backend client manipulates the data. ). If your API supports, such transformations on server side, use those instead of this.
