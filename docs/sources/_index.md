---
title: Infinity data source plugin for Grafana
menuTitle: Infinity data source
description: This document introduces the Infinity data source plugin for Grafana
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

# Infinity data source

The Infinity data source is a universal plugin for pulling data from various systems into Grafana using existing REST APIs. It's Grafana's go-to plugin for cases when a native plugin doesn't exist yet.

The following resources will help you get started with the Infinity data source:

- [Configure the Infinity data source](/docs/plugins/yesoreyeram-infinity-datasource/latest/configure/)
- [Infinity query editor](/docs/plugins/yesoreyeram-infinity-datasource/latest/query/)
- [Template variables](/docs/plugins/yesoreyeram-infinity-datasource/latest/variables/)
- [Annotations](/docs/plugins/yesoreyeram-infinity-datasource/latest/annotations/)
- [Examples](/docs/plugins/yesoreyeram-infinity-datasource/latest/examples/)

## Key capabilities

{{< shared id="infinity-data-source-advantages" >}}

The Infinity data source supports:

- **Multiple data formats:** Query JSON, CSV, TSV, XML, HTML, and GraphQL endpoints.
- **Flexible data manipulation:** Transform data with UQL, JSONata, and GROQ.
- **Various authentication methods:** Basic, Bearer token, API key, OAuth passthrough, OAuth2 client credentials, OAuth2 JWT, AWS/Azure/GCP authentication, and Digest authentication.
- **Backend features:** Alerting, recorded queries, shared dashboards, and query caching (in backend parsing mode).
- **Grafana integrations:** Node graph panel, annotations, and template variables.

{{< /shared >}}

## Before you begin

Before you configure the Infinity data source, you need:

- Grafana version 10.0 or later
- Network access from Grafana to your target API endpoints
- Appropriate credentials for authenticated endpoints (API keys, OAuth credentials, etc.)

## Supported data formats

This data source supports the following formats:

- [JSON](/docs/plugins/yesoreyeram-infinity-datasource/latest/json/) - Query JSON APIs and inline JSON data
- [CSV / TSV](/docs/plugins/yesoreyeram-infinity-datasource/latest/csv/) - Query CSV, TSV, or any delimited content
- [XML / HTML](/docs/plugins/yesoreyeram-infinity-datasource/latest/xml/) - Query XML and HTML endpoints
- [GraphQL](/docs/plugins/yesoreyeram-infinity-datasource/latest/graphql/) - Query GraphQL APIs

## Known limitations

- Backend features such as alerting, shared dashboards, recorded queries, or enterprise query caching are only available in **backend** parsing mode.
- Infinity is not designed for handling large amounts of data. When inlining data, ensure snippets are less than 1MB in size.
- For a list of all known issues, refer to [GitHub issues](https://github.com/grafana/grafana-infinity-datasource/issues).

## Additional resources

Once you have configured the Infinity data source, you can:

- Use [Explore](https://grafana.com/docs/grafana/latest/explore/) to run ad-hoc queries.
- Configure and use [template variables](/docs/plugins/yesoreyeram-infinity-datasource/latest/variables/) for dynamic dashboards.
- Add [transformations](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/transform-data/) to process query results.

## Get started

Watch this video to get started with the Grafana Infinity data source plugin:

{{< youtube id="BxWw4BWY5ns" >}}

{{< docs/play title="Infinity plugin demo" url="https://play.grafana.org/d/infinity" >}}
