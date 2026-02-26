---
slug: '/graphql'
title: GraphQL
menuTitle: GraphQL
description: Query GraphQL endpoints with the Infinity data source
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/graphql/
keywords:
  - infinity
  - GraphQL
  - API
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 30
---

# GraphQL

Select **GraphQL** as the query type to retrieve data from GraphQL endpoints. GraphQL queries work similarly to JSON queries but use the POST method with a query body.

{{< docs/play title="Infinity plugin GraphQL demo" url="https://play.grafana.org/d/infinity-graphql" >}}

## Configure a GraphQL query

To query a GraphQL endpoint:

1. Select **GraphQL** as the query type.
1. Enter the GraphQL endpoint URL.
1. Set the HTTP method to **POST**.
1. Click the expand icon next to the URL to open advanced options.
1. Enter your GraphQL query in the query field.
1. Define columns to extract specific fields from the response.

## Example query

The following example queries a countries API to retrieve country names and continent information:

**URL**: `https://countries.trevorblades.com/graphql`

**GraphQL query**:

```graphql
{
  countries {
    name
    continent {
      name
    }
  }
}
```

**Root selector**: `data.countries`

**Columns configuration**:

| Selector | Title | Type |
|----------|-------|------|
| `name` | Country | String |
| `continent.name` | Continent | String |

## GraphQL variables

You can include variables in your GraphQL queries. Enter variables as JSON in the variables field:

```json
{
  "code": "US"
}
```

Then reference them in your query:

```graphql
query($code: ID!) {
  country(code: $code) {
    name
    capital
  }
}
```

## Parser options

GraphQL responses are JSON, so all JSON parser options are available:

- **Default parser**: For simple queries
- **Backend parser**: For alerting and recorded queries
- **UQL parser**: For advanced transformations

Refer to [JSON](/docs/plugins/yesoreyeram-infinity-datasource/latest/data-formats/json/) for details on parser options.
