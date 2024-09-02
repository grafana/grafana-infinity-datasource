---
slug: '/series'
title: 'Mock Series'
menuTitle: Mock Series
description: Creating Mock time series data using Infinity
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
weight: 7900
---

# Creating Mock time series data using Infinity

This **Expression** query type helps you to simulate/mock the time series data.

## Expression

In order to generate simulated timeseries using mathematical expressions, you need to choose `Series` as Query type and `Expression` as query scenario/source.

## Number of series

If you need more series, you can specify the number of series you needed.

## Alias

You can specify the alias for the series names generated. Consider the following scenarios to predict the series name

| Alias                            | Count | Output / Series list           |
| -------------------------------- | ----- | ------------------------------ |
|                                  |       | Random Walk                    |
|                                  | 2     | lorem,ipsum                    |
| Foo                              |       | Foo                            |
| Server                           |       | Foo                            |
| Server                           | 2     | Server 1, Server 2             |
| `Server ${__series.index} - CPU` | 2     | Server 1 - CPU, Server 2 - CPU |
