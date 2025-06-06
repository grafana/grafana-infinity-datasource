---
title: Infinity data source plugin for Grafana
menuTitle: Infinity data source
description: This document introduces the Infinity data source
hero:
  title: Infinity data source plugin for Grafana
  level: 1
  width: 110
  image: https://raw.githubusercontent.com/grafana/grafana-infinity-datasource/main/src/img/icon.svg
  height: 110
  description: The Infinity data source plugin allows you to query and visualize data from JSON, CSV, GraphQL, XML, and HTML endpoints.
data-formats:
  title_class: pt-0 lh-1
  items:
    - title: JSON
      description: Visualize JSON data
      href: /docs/plugins/yesoreyeram-infinity-datasource/latest/json
    - title: CSV / TSV
      description: Visualize CSV, TSV or any delimited content
      href: /docs/plugins/yesoreyeram-infinity-datasource/latest/csv
    - title: XML / HTML
      description: Visualize XML / HTML data
      href: /docs/plugins/yesoreyeram-infinity-datasource/latest/xml
    - title: GraphQL
      description: Visualize data from GraphQL endpoints
      href: /docs/plugins/yesoreyeram-infinity-datasource/latest/graphql
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
weight: 10
---

{{< docs/hero-simple key="hero" >}}

<hr style="margin-bottom:30px"/>

## 📊 Overview

<div style="margin-bottom:30px"></div>

A universal data source plugin for pulling data from various systems into Grafana using existing REST APIs. Grafana's go-to plugin for cases when a native plugin doesn’t exist yet.

Watch this video to get started with the Grafana Infinity data source plugin:

{{< youtube id="BxWw4BWY5ns" >}}

{{< docs/play title="Infinity plugin demo" url="https://play.grafana.org/d/infinity" >}}

## 🎯 Key Features

<div style="margin-bottom:30px"></div>

{{< shared id="infinity-data-source-advantages" >}}

The Infinity data source supports the following key features:

- Bring data from multiple sources into Grafana
- Flexible data manipulation with UQL, JSONata, GROQ
- Various data formats such as JSON, CSV
- Various authentication methods
  - Basic authentication
  - Bearer token authentication
  - API key authentication
  - OAuth passthrough
  - OAuth2 client credentials
  - OAuth2 JWT authentication
  - AWS/Azure/GCP authentication
  - Digest authentication
- Alerting, recorded queries, shared dashboards, query caching
- Utility variable functions
- Grafana node graph panel, annotations, and so on

{{< /shared >}}

## 🎯 Supported data formats

{{< card-grid key="data-formats" type="simple" >}}

<div style="margin-bottom:30px"></div>

## ⚠️ Known Limitations

<div style="margin-bottom:30px"></div>

Infinity plugin has the following known limitations:

- Backend features such as alerting, shared dashboards, recorded queries or enterprise query caching only available in **backend** parsing mode.
- Infinity is not designed for handling a huge amount of data. When inlining the data, make sure they are small snippets less than 1MB of size.
- For a list of all known bugs, check [GitHub](https://github.com/grafana/grafana-infinity-datasource/issues).
