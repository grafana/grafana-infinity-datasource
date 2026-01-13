---
slug: '/integrations/github'
title: GitHub GraphQL API
menuTitle: GitHub
description: Query GitHub repositories and issues using the Infinity data source.
aliases:
  - infinity/github
  - /github
keywords:
  - infinity
  - GitHub
  - GraphQL
  - API
weight: 300
---

# GitHub GraphQL API integration

Query GitHub repositories, issues, pull requests, and organization data using the GitHub GraphQL API.

## Before you begin

- A GitHub account.
- A [Personal Access Token (PAT)](https://github.com/settings/tokens) with appropriate scopes.

## Configure the data source

1. In Grafana, navigate to **Connections** > **Data sources**.
1. Click **Add data source** and select **Infinity**.
1. Expand the **Authentication** section and select **Basic Authentication**.
1. Enter your GitHub username and Personal Access Token as the password.
1. In **Allowed hosts**, enter `https://api.github.com`.
1. Click **Save & test**.

## Query GitHub data

Use GraphQL queries to retrieve GitHub data. The GitHub GraphQL endpoint is `https://api.github.com/graphql`.

### Example: List repository issues

1. In the query editor, configure:
   - **Type**: GraphQL
   - **URL**: `https://api.github.com/graphql`

1. Enter the following GraphQL query:

```graphql
{
  repository(owner: "grafana", name: "grafana") {
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

### Example: Organization repository summary

Query multiple repositories in an organization:

```graphql
{
  repositoryOwner(login: "grafana") {
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

## Use template variables

Replace hardcoded values with Grafana template variables:

```graphql
{
  repository(owner: "$GithubUser", name: "$GithubRepo") {
    issues(last: 20) {
      edges {
        node {
          title
          state
        }
      }
    }
  }
}
```

## Limitations

- Queries are not paginated. For large result sets, you may need multiple queries.
- GitHub API rate limits apply.
- For paginated results and comprehensive GitHub analytics, consider the [Grafana GitHub data source](https://grafana.com/grafana/plugins/grafana-github-datasource).
