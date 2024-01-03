---
title: Infinity data source plugin for Grafana
menuTitle: Infinity data source
description: This document introduces the Infinity data source
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
weight: 10
---
<!-- markdownlint-disable MD033 -->

# Infinity data source plugin for Grafana

<p align="center">
  <img src="https://raw.githubusercontent.com/grafana/grafana-infinity-datasource/main/src/img/icon.svg" alt="Grafana Infinity Datasource" width="200" />
</p>

The Infinity data source plugin allows you to query and visualize data from JSON / CSV / GraphQL / XML / HTML endpoints.

## 🎯 Key Features

- Get data from multiple sources into grafana
- Flexible data manipulation with UQL, JSONata, GROQ
- Supports various data formats
  - JSON
  - CSV / TSV / any delimited format
  - XML
  - GraphQL
  - HTML
  - RSS/ATOM
- Support various authentication
  - Basic authentication
  - Bearer token authentication
  - API Key authentication
  - OAuth passthrough
  - OAuth2 client credentials
  - OAuth2 JWT authentication
  - AWS/Azure/GCP authentication
  - Digest authentication
- Supports alerting, recorded queries, public dashboards, query caching
- Utility variable functions
- Supports for Grafana node graph panel, annotations etc

## ⚠️ Known Limitations

Infinity plugin have the following known limitations

- Backend features such as alerting, public dashboards, recorded queries, enterprise query caching only available in **backend** parsing mode
- For list of all known bugs, check [here](https://github.com/grafana/grafana-infinity-datasource/issues)
