---
slug: '/graphql'
title: 'GraphQL'
menuTitle: GraphQL
description: GraphQL
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
weight: 23
---

# Visualizing GraphQL data

With the infinity datasource, you can also scrap data from any GraphQL endpoints. This works exactly same way as JSON api. Instead of using `GET` method used by `JSON` api, this uses `POST` method with a body.

For example, consider the below GraphQL Endpoint. This returns list of countries and their calling codes.

![image](https://user-images.githubusercontent.com/153843/93589049-2e012080-f9a4-11ea-9c08-8a02b6a98df1.png#center)

With our plugin, we are going to list the above data as table with country name and calling code(1st calling code).

![image](https://user-images.githubusercontent.com/153843/93588983-17f36000-f9a4-11ea-9070-8d135394768c.png#center)

As shown in the above image, you need to specify the URL and fields you need. Next to the URL, you can see **advanced options** (expand icon) where you can enter your query as shown below

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

Make sure to choose `POST` method when using the `graphql` api.
