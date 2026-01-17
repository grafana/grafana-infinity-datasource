---
slug: '/integrations/github'
title: GitHub GraphQL API
menuTitle: GitHub
description: Query GitHub repositories and issues using the Infinity data source.
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/examples/github/
keywords:
  - infinity
  - GitHub
  - GraphQL
  - API
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 300
---

# GitHub GraphQL API integration

Query GitHub repositories, issues, pull requests, and organization data using the GitHub GraphQL API.

## Before you begin

- A GitHub account
- A [Personal Access Token (PAT)](https://github.com/settings/tokens) with appropriate scopes (for example, `repo`, `read:org`)

## Configure the data source

1. In Grafana, navigate to **Connections** > **Data sources**.
1. Click **Add data source** and select **Infinity**.
1. Expand the **Authentication** section and select **Bearer Token**.
1. Enter your GitHub Personal Access Token.
1. In **Allowed hosts**, enter `https://api.github.com`.
1. Click **Save & test**.

{{< admonition type="tip" >}}
You can also use **Basic Authentication** with your GitHub username and PAT as the password, but Bearer Token is the recommended approach.
{{< /admonition >}}

## Query GitHub data

Use GraphQL queries to retrieve GitHub data. The GitHub GraphQL endpoint is `https://api.github.com/graphql`.

### Basic query setup

1. In the query editor, set **Type** to **GraphQL**.
2. Set **URL** to `https://api.github.com/graphql`.
3. Set **Parser** to **Backend** or **UQL**.
4. Enter your GraphQL query.
5. Set the **Root selector** to extract your data (for example, `data.repository.issues.edges`).

## Query examples

### List repository issues

**GraphQL query:**

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

**Root selector:** `data.repository.issues.edges`

**Columns:**

| Selector | Alias |
|----------|-------|
| `node.title` | Title |
| `node.state` | State |
| `node.author.login` | Author |
| `node.url` | URL |

### Organization repository summary

Query multiple repositories in an organization:

```graphql
{
  repositoryOwner(login: "grafana") {
    repositories(first: 100) {
      nodes {
        name
        stargazerCount
        issues(states: OPEN) {
          totalCount
        }
        pullRequests(states: OPEN) {
          totalCount
        }
      }
    }
  }
}
```

**Root selector:** `data.repositoryOwner.repositories.nodes`

**Columns:**

| Selector | Alias | Type |
|----------|-------|------|
| `name` | Repository | string |
| `stargazerCount` | Stars | number |
| `issues.totalCount` | Open Issues | number |
| `pullRequests.totalCount` | Open PRs | number |

### Pull request metrics

```graphql
{
  repository(owner: "grafana", name: "grafana") {
    pullRequests(last: 50, states: MERGED) {
      nodes {
        title
        mergedAt
        author {
          login
        }
        additions
        deletions
      }
    }
  }
}
```

**Root selector:** `data.repository.pullRequests.nodes`

## Use template variables

Replace hardcoded values with Grafana template variables:

```graphql
{
  repository(owner: "${GithubOrg}", name: "${GithubRepo}") {
    issues(last: 20, states: OPEN) {
      edges {
        node {
          title
          state
          createdAt
        }
      }
    }
  }
}
```

Create dashboard variables for `GithubOrg` and `GithubRepo` to make the dashboard dynamic.

## Provision the data source

Configure GitHub authentication through provisioning:

```yaml
apiVersion: 1
datasources:
  - name: GitHub Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: bearerToken
      allowedHosts:
        - https://api.github.com
    secureJsonData:
      bearerToken: YOUR_GITHUB_PAT
```

## Troubleshoot

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Bad credentials | Invalid or expired PAT | Generate a new Personal Access Token |
| 403 Forbidden | Insufficient PAT scopes | Add required scopes (repo, read:org) to your PAT |
| Empty response | Wrong root selector | Check the GraphQL response structure and update selector |
| Rate limit exceeded | Too many requests | Wait for rate limit reset or use a PAT with higher limits |

## Limitations

- Queries are not automatically paginated. For large result sets, use cursor-based pagination in your GraphQL query.
- GitHub API rate limits apply (5,000 requests per hour for authenticated requests).
- For comprehensive GitHub analytics with built-in pagination, consider the [GitHub data source](https://grafana.com/grafana/plugins/grafana-github-datasource).

## Additional resources

- [GitHub GraphQL API documentation](https://docs.github.com/en/graphql)
- [GitHub GraphQL Explorer](https://docs.github.com/en/graphql/overview/explorer)
- [Creating a Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
