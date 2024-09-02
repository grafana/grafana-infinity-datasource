---
slug: '/groq'
title: 'GROQ Parser'
menuTitle: GROQ Parser
description: GROQ Parser
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
weight: 320
---

# GROQ Parser

[GROQ](https://groq.dev/) is query language which is designed to work directly on JSON documents. [GROQ](https://www.sanity.io/docs/groq) was developed by [Sanity.io](https://www.sanity.io/docs/groq) (where it’s used as the primary query language).

> GROQ is still in ALPHA.

## Using GROQ with infinity

The following example shows how to make use of GROQ inside Grafana Infinity data source.

![groq query type in grafana](https://user-images.githubusercontent.com/153843/151544429-1c039a19-75c5-4dfc-bc52-e2f74f9c8a51.png#center)

## Known limitations

- The library used under the hood is still is in [alpha](https://github.com/sanity-io/groq-js).
- With the initial test, only works with array type of docs.
