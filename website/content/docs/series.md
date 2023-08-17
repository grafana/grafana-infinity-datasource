---
slug: '/wiki/series'
title: 'Series'
previous_page_title: 'CSV'
previous_page_slug: '/wiki/csv'
next_page_title: 'Global Queries'
next_page_slug: '/wiki/global-queries'
---

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
| Server ${\_\_series.index} - CPU | 2     | Server 1 - CPU, Server 2 - CPU |
