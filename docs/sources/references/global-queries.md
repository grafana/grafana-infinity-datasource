---
slug: '/global-queries'
title: 'Global Queries / Registered Queries'
menuTitle: Global Queries
description: Global Queries
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
weight: 7901
---

<!-- markdownlint-disable MD028 -->

# Global Queries / Registered Queries

> **DEPRECATED**. From v0.7.8, This feature is deprecated in favour of Grafana panel library.

Working with the same queries in multiple dashboards might be hard some times. To change a query, you need to update all the dashboards. To solve this, Infinity data source gives an option to register queries globally and allows to reuse the queries across dashboards.

## Creating a global query

To register a query, in the data source instance settings follow the steps below:

1. Click **Add Global Query** button.
1. Change the name and id of the query. ID should be unique per data source instance.
1. Enter the query fields.
1. Click **Save**.

![image](https://user-images.githubusercontent.com/153843/93780448-1635d080-fc20-11ea-8c92-d6e91dbcf003.png#center)

You can have multiple queries registered per data source instance.

## Using global queries in the panel

In order to use the registered query in the dashboard, you have to select `Global Query` / `global` as type. Then select the query you needed from the list.

![image](https://user-images.githubusercontent.com/153843/93780923-ab38c980-fc20-11ea-9d87-078233102905.png#center)

## Provision the global queries

You can also provision the global queries in the data source provisioning. The example below provides a sample of inline CSV query provisioning:
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

> **Note**: When using global queries, queries will be loaded from the data source setting when loading the dashboard only. If the query changes, dashboards will reflect the change only when they are reloaded. (Query refresh won't fetch the latest query).

{{< admonition type="note" >}}
When provisioning, Grafana variables like `${__from}` aren't supported.
{{< /admonition >}}
