---
slug: '/url'
title: URL configuration
menuTitle: URL
description: Configure URLs, HTTP methods, headers, and request bodies for Infinity queries.
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/references/url/
keywords:
  - infinity
  - URL
  - HTTP
  - headers
  - query parameters
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 60
---

# URL configuration

The Infinity data source supports advanced URL configuration options including HTTP methods, custom headers, query parameters, and request bodies. Use these options to connect to any REST API or web endpoint.

## Before you begin

- Ensure you have the Infinity data source installed and configured
- Know the API endpoint requirements (authentication, headers, body format)

## Configure URL options

In the query editor, click the expand icon next to the **URL** field to access advanced options.

### HTTP methods

| Method | Description |
|--------|-------------|
| **GET** | Retrieve data (default) |
| **POST** | Send data in request body |
| **PUT** | Update existing resource (requires admin configuration) |
| **PATCH** | Partial update (requires admin configuration) |
| **DELETE** | Remove resource (requires admin configuration) |

{{< admonition type="note" >}}
PUT, PATCH, and DELETE methods are considered dangerous and must be enabled by an administrator in the data source configuration.
{{< /admonition >}}

### Query parameters

Add query parameters that will be appended to the URL. Each parameter has a key and value.

### Request headers

Add custom headers to send with the request. Each header has a key and value.

### Request body

For POST, PUT, and PATCH requests, configure the request body:

| Body type | Description |
|-----------|-------------|
| **none** | No request body |
| **form-data** | Multipart form data |
| **x-www-form-urlencoded** | URL-encoded form data |
| **raw** | Raw text body with content type |
| **graphql** | GraphQL query and variables |

**Content types for raw body:**

| Content type | Use case |
|--------------|----------|
| `application/json` | JSON payloads |
| `application/xml` | XML payloads |
| `text/plain` | Plain text |
| `text/html` | HTML content |
| `application/javascript` | JavaScript |

## Variables in URLs

Use Grafana variables in your URL to create dynamic queries. This includes global variables and dashboard variables.

**Example:**

```
https://api.example.com/data?from=${__from:date:YYYY-MM-DD}&to=${__to:date:YYYY-MM-DD}
```

**Result:**

```
https://api.example.com/data?from=2024-01-01&to=2024-01-31
```

For more information about available variables, refer to [Macros](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/macros/).

## Secure keys in URLs

For API keys or tokens that must be included in URLs, use the secure key configuration in the data source settings instead of hardcoding them in queries.

1. Navigate to the data source configuration.
2. In the **Authentication** section, configure your API key.
3. Select whether to send the key as a **Header** or **Query parameter**.
4. Enter the key name and value.

The key value is stored securely and not exposed in dashboards or query logs.

## Custom headers

Configure headers in two locations:

| Location | Use case |
|----------|----------|
| **Data source configuration** | Headers applied to all queries |
| **Query editor** | Headers for specific queries |

**Default headers:**

The Infinity data source automatically sets these headers:

- `User-Agent: Go-http-client/1.1`
- `Content-Type: application/json` (for JSON requests)

You can override these defaults in the data source configuration.

{{< admonition type="note" >}}
Add secure or sensitive headers only in the data source configuration, not in individual queries.
{{< /admonition >}}

## Grafana metadata headers

Forward Grafana metadata to your API using macros in custom headers or query parameters.

| Macro | Description |
|-------|-------------|
| `${__org.id}` | Grafana organization ID |
| `${__plugin.id}` | Plugin ID |
| `${__plugin.version}` | Plugin version |
| `${__ds.uid}` | Data source UID |
| `${__ds.name}` | Data source name |
| `${__ds.id}` | Data source ID (deprecated) |
| `${__user.login}` | User login ID |
| `${__user.email}` | User email |
| `${__user.name}` | User display name |

{{< admonition type="warning" >}}
User macros (`${__user.*}`) are not available in alerts, recorded queries, or public dashboards because there is no user context in these scenarios.
{{< /admonition >}}

## Allowed hosts

By default, the Infinity data source can connect to any URL. To restrict access to specific hosts:

1. Navigate to the data source configuration.
2. In the **Network** section, add allowed host names.
3. Save the configuration.

**Requirements:**
- Host names are case-sensitive
- Use the full host name including protocol (for example, `https://api.example.com`)
- Multiple hosts can be configured

When allowed hosts are configured, queries to other hosts will be blocked.
