---
slug: '/graphql'
title: 'GraphQL'
menuTitle: GraphQL
description: GraphQL
hero:
  title: Visualize GraphQL with Infinity
  level: 1
  width: 110
  image: https://www.svgrepo.com/show/353834/graphql.svg
  height: 110
  description: Visualize data from your GraphQL APIs using infinity data source plugin
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
weight: 23
---

{{< docs/hero-simple key="hero" >}}

<hr style="margin-bottom:30px"/>

## 📊 Overview

<div style="margin-bottom:30px"></div>

With the Infinity datasource, you can also scrap data from any GraphQL endpoints. This works exactly in the same way as JSON API, but instead of using `GET` method used by the `JSON` API, this uses `POST` method with a body.

{{< docs/play title="Infinity plugin GraphQL demo" url="https://play.grafana.org/d/infinity-graphql" >}}

For example, consider the below GraphQL Endpoint. This returns list of countries and their calling codes.

![image](https://user-images.githubusercontent.com/153843/93589049-2e012080-f9a4-11ea-9c08-8a02b6a98df1.png#center)

With our plugin, we are going to list the above data as table with country name and calling code (1st calling code).

![image](https://user-images.githubusercontent.com/153843/93588983-17f36000-f9a4-11ea-9070-8d135394768c.png#center)

As shown in the image above, you need to specify the URL and fields you need. Next to the URL, you can see **advanced options** (expand icon) where you can enter your query as shown below:

![image](https://user-images.githubusercontent.com/153843/93589000-1de94100-f9a4-11ea-8887-d5a4b39dcbe9.png#center)

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

Make sure to select `POST` method when using the `graphql` API.
