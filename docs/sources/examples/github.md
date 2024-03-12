---
slug: '/github'
title: 'Github GraphQL API'
menuTitle: Github GraphQL API
description: Visualizing data from Github GraphQL API using Infinity
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
weight: 8002
---

# Visualizing data from Github GraphQL API

![image](https://user-images.githubusercontent.com/153843/93846498-1d9abf80-fc9c-11ea-90ed-4c569b088d99.png#center)

We can leverage [Github graphql API](https://docs.github.com/en/graphql) to query the github stats using this infinity plugin graphql api.

Sample Query given in the below example. You can customize your query to bring the stats you needed.

## Query Editor

![image](https://user-images.githubusercontent.com/153843/93736996-d3510a00-fbd9-11ea-8c05-065758d66e82.png#center)

![image](https://user-images.githubusercontent.com/153843/93737011-e1068f80-fbd9-11ea-8c82-ea516f83cf3d.png#center)

Query Used:

```graphql
{
  repository(owner: "$GithubUser", name: "$GithubRepo") {
    issues(last: 20) {
      edges {
        node {
          author {
            login
          }
          state
          title
          url
        }
      }
    }
  }
}
```

## Datasource Configuration

Select **Basic user authentication** mode and use your github username and PAT token as password

![image](https://user-images.githubusercontent.com/153843/93736929-b1578780-fbd9-11ea-9413-5585ff79d3a8.png#center)

## Github Organization Summary example

![image](https://user-images.githubusercontent.com/153843/93846498-1d9abf80-fc9c-11ea-90ed-4c569b088d99.png#center)

corresponding query used is given below

```graphql
{
  repositoryOwner(login: "$GithubUser") {
    repositories(first: 100) {
      data: nodes {
        name
        stargazers {
          totalCount
        }
        openissues: issues(states: OPEN) {
          totalCount
        }
        openpr: pullRequests(states: OPEN) {
          totalCount
        }
      }
    }
  }
}
```

Note:

- Queries are not paginated
- Github rate limits apply
- If you need paginated and full set of results, use grafana [github stats plugin](https://grafana.com/grafana/plugins/grafana-github-datasource)
