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
    - enterprise
    - grafana cloud
weight: 7901
---
<!-- markdownlint-disable MD028 -->

# Global Queries / Registered Queries

> **DEPRECATED**. From v0.7.8, This feature is deprecated in favour of Grafana panel library.

Working with same queries in multiple dashboards might be hard some times. To change a query, you need to update all the dashboards. So Infinity datasource gives an option to register queries globally and then allows to reuse the queries across dashboards.

## Creating a global query

To register a query, in the datasource instance settings perform the following actions

- Click **Add Global Query** button
- Change the name and id of the query. Id should be unique per datasource instance.
- Enter the query fields.
- Click `Save`

![image](https://user-images.githubusercontent.com/153843/93780448-1635d080-fc20-11ea-8c92-d6e91dbcf003.png#center)

You can have multiple queries registered per datasource instance.

## Using global queries in the panel

In order to use the registered query in the dashboard, you have to select `Global Query` / `global` as type. Then select the query you needed from the list.

![image](https://user-images.githubusercontent.com/153843/93780923-ab38c980-fc20-11ea-9d87-078233102905.png#center)

## Provision the global queries

You can also provision the global queries in the datasource provisioning. Below example provides a sample of inline csv query provisioning

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

> **Note**: When using global queries, queries will be loaded from the datasource setting when loading the dashboard only. If the query changed, dashboards will get reflected only when they are reloaded. (Query refresh won't fetch the latest query).

> **Note**: When provisioning, grafana variables / tokens like `${__from}` are not supported yet.
