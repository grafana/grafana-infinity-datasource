---
slug: '/global-queries'
title: 'Global queries'
menuTitle: Global queries
description: Create reusable queries that can be shared across dashboards.
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/references/global-queries/
keywords:
  - infinity
  - global queries
  - reusable queries
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 100
---

# Global queries

{{< admonition type="caution" >}}
Starting with Infinity plugin version 0.7.8, global queries is deprecated in favor of the Grafana panel library.
It will be removed in a future release.
{{< /admonition >}}

Global queries let you register queries in the data source configuration and reuse them across multiple dashboards. When the query definition changes, all dashboards using it reflect the change after reloading.

## Create a global query

1. Navigate to the data source configuration.
1. Click **Add Global Query**.
1. Enter a unique **Name** and **ID** for the query.
1. Configure the query fields (type, URL, parser, columns, etc.).
1. Click **Save**.

You can register multiple global queries per data source instance.

## Use a global query in a panel

1. In the query editor, set **Type** to **Global Query**.
1. Select the query from the drop-down list.
1. Click **Run query**.

## Provision global queries

Configure global queries through provisioning:

```yaml
apiVersion: 1
datasources:
  - name: ProvisionedQueries
    type: yesoreyeram-infinity-datasource
    access: proxy
    isDefault: false
    basicAuth: false
    jsonData:
      datasource_mode: 'basic'
      global_queries:
        - name: Countries
          id: countries
          query:
            type: csv
            source: inline
            format: table
            data: |
              country,continent
              india,asia
              china,asia
              uk,europe
            columns:
              - selector: country
                text: Country
                type: string
              - selector: continent
                text: Continent
                type: string
    version: 1
    readOnly: true
```

{{< admonition type="note" >}}
Global queries are loaded from the data source settings when the dashboard loads. If you change a global query, dashboards reflect the change only after reloading. Query refresh does not fetch the latest query definition.
{{< /admonition >}}

{{< admonition type="note" >}}
When provisioning, Grafana variables like `${__from}` are not supported in global queries.
{{< /admonition >}}
