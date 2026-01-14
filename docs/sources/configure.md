---
title: Configure the Infinity data source
menuTitle: Configure
description: Learn how to configure the Infinity data source plugin for Grafana
aliases:
  - infinity/configure
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
  - configuration
  - authentication
labels:
  products:
    - oss
weight: 20
---

# Configure the Infinity data source

To configure the Infinity data source, you need to create an instance of the data source and optionally configure authentication, network settings, and other options.

This page explains how to:

- [Add the data source](#add-the-data-source)
- [Configure connection settings](#connection)
- [Configure authentication](#authentication)
- [Configure network settings](#network-settings)
- [Configure additional settings](#additional-settings)
- [Provision the data source](#provision-the-data-source)

## Before you begin

Before you configure the Infinity data source, you need:

- Grafana version 10.0 or later
- [Organization admin permissions](https://grafana.com/docs/grafana/latest/administration/roles-and-permissions/#organization-roles) in Grafana, or equivalent [RBAC permissions](https://grafana.com/docs/grafana/latest/administration/roles-and-permissions/access-control/) to manage data sources
- Network access from Grafana to your target API endpoints
- Appropriate credentials for authenticated endpoints (API keys, OAuth credentials, etc.)

## Add the data source

To add the Infinity data source to Grafana:

1. In Grafana, navigate to **Connections** > **Data sources**.
1. Click **Add data source**.
1. Search for **Infinity**.
1. Click the **Infinity** data source to configure it.
1. Enter a **Name** for the data source.
1. Configure the settings as described in the following sections.
1. Click **Save & test** to verify the connection.

The Infinity data source can work out of the box without any additional configuration. If you need the URL to be authenticated or pass additional headers/query/tls/timeout settings, configure the corresponding section.

{{< admonition type="note" >}}
Configuration applies to all queries using this data source instance. If you need different configuration for different queries, create separate instances of the data source.
{{< /admonition >}}

## Configuration options

The following sections describe the available configuration options for the Infinity data source.

### Connection

| Setting | Description |
|---------|-------------|
| **Base URL** | Optional. The base URL for all queries. If configured, this URL is prefixed to all query URLs. For example, if you set `https://example.com/api` as the base URL and `/users` as the query URL, the final URL will be `https://example.com/api/users`. |
| **Allowed hosts** | Optional. A list of hosts that the data source is allowed to connect to. If configured, requests to other hosts will be blocked. |

For more information about URL configuration, refer to [URL reference](/docs/plugins/yesoreyeram-infinity-datasource/latest/references/url/).

### Authentication

The Infinity data source supports the following authentication methods:

- [No authentication](#no-authentication)
- [Basic authentication](#basic-authentication)
- [Bearer token](#bearer-token)
- [API key](#api-key)
- [Digest authentication](#digest-authentication)
- [OAuth passthrough](#oauth-passthrough)
- [OAuth 2.0 client credentials](#oauth-20-client-credentials)
- [OAuth 2.0 JWT](#oauth-20-jwt)
- [Azure authentication](#azure-authentication)
- [Azure Blob storage](#azure-blob-storage)
- [AWS authentication](#aws-authentication)

#### No authentication

If your APIs don't require any authentication, select the **No Authentication** method.

#### Basic authentication

Basic authentication sends a username and password with your request. In the request headers, the `Authorization` header uses the `Basic <BASE64_ENCODED_USERNAME_AND_PASSWORD>` format.

| Setting | Description |
|---------|-------------|
| **User** | The username for authentication. |
| **Password** | The password for authentication. |

#### Bearer token

Bearer token authentication enables requests to authenticate using an access key, such as a JSON Web Token (JWT) or personal access token. In the request headers, the `Authorization` header uses the `Bearer <API_KEY>` format.

| Setting | Description |
|---------|-------------|
| **Token** | The bearer token value. |

{{< admonition type="tip" >}}
If you need a custom prefix instead of `Bearer`, use API key authentication with the key set to `Authorization`.
{{< /admonition >}}

#### API key

With API key authentication, you can send a key-value pair to the API via request headers or query parameters.

| Setting | Description |
|---------|-------------|
| **Key** | The key of the API token. This becomes the key of the header or query parameter. |
| **Value** | The value of the API token. |
| **In** | Where to send the API key: `header` or `query`. Most APIs accept API keys via headers. |

{{< admonition type="tip" >}}
It's easy to confuse API key authentication with Bearer token authentication. Ensure you are using the correct authentication mechanism for your API.
{{< /admonition >}}

#### Digest authentication

Digest authentication enables requests to authenticate using the [RFC7616 HTTP Digest Access Authentication protocol](https://www.rfc-editor.org/rfc/rfc7616.txt).

| Setting | Description |
|---------|-------------|
| **User** | The username for digest authentication. |
| **Password** | The password for digest authentication. |

#### OAuth passthrough

If your Grafana user is already authenticated via OAuth, this authentication method forwards the OAuth tokens to the API.

#### OAuth 2.0 client credentials

OAuth 2.0 client credentials authentication requires the following settings:

| Setting | Description |
|---------|-------------|
| **Client ID** | The application's ID. |
| **Client Secret** | The application's secret. |
| **Token URL** | The resource server's token endpoint URL. This is a constant specific to each server. |
| **Scopes** | Optional. Specifies requested permissions. |
| **Endpoint params** | Optional. Additional parameters for requests to the token endpoint. |

For advanced token customization, refer to [OAuth2 Custom Tokens](/docs/plugins/yesoreyeram-infinity-datasource/latest/oauth2-custom-tokens/). Key customization options include:

- Custom header names (for example, `X-API-Key` instead of `Authorization`)
- Custom token value formats (for example, `Token ${__oauth2.access_token}` instead of `Bearer ${__oauth2.access_token}`)
- Access to multiple token properties (access token, refresh token, token type)

#### OAuth 2.0 JWT

OAuth 2.0 JWT authentication requires the following settings:

| Setting | Description |
|---------|-------------|
| **Email** | The OAuth client identifier used when communicating with the configured OAuth provider. |
| **Private Key** | The contents of an RSA private key or a PEM file that contains a private key. |
| **Private Key Identifier** | Optional. A hint indicating which key to use. |
| **Token URL** | The endpoint required to complete the 2-legged JWT flow. |
| **Subject** | Optional. The user to impersonate. |
| **Scopes** | Optional. A comma-separated list of requested permission scopes. |

OAuth 2.0 JWT authentication also supports token customization. Refer to [OAuth2 Custom Tokens](/docs/plugins/yesoreyeram-infinity-datasource/latest/oauth2-custom-tokens/) for details.

#### Azure authentication

To authenticate your API endpoints via Microsoft Azure authentication, refer to [Azure authentication](/docs/plugins/yesoreyeram-infinity-datasource/latest/examples/azure/).

#### Azure Blob storage

To retrieve content from Azure Blob storage, configure the following settings:

| Setting | Description |
|---------|-------------|
| **Azure Cloud** | Optional. The Azure cloud environment. Options include Azure Cloud, Azure US Government, or Azure China. |
| **Storage account name** | Required. The name of your Azure storage account. |
| **Storage account key** | Required. The primary or secondary key for your storage account. |

#### AWS authentication

To authenticate your API endpoints via Amazon AWS authentication, refer to [AWS authentication](/docs/plugins/yesoreyeram-infinity-datasource/latest/examples/aws/).

### TLS settings

Configure TLS settings if your API requires client certificates or custom CA certificates.

| Setting | Description |
|---------|-------------|
| **Skip TLS verification** | Skip TLS certificate verification. Not recommended for production. |
| **TLS client authentication** | Enable TLS client authentication. |
| **With CA cert** | Use a custom CA certificate. |
| **Server name** | The server name that matches the certificate (required for TLS with CA cert). |
| **CA cert** | The CA certificate content. |
| **Client cert** | The client certificate content. |
| **Client key** | The client key content. |

### HTTP headers

You can add custom HTTP headers to all requests made by the data source.

| Setting | Description |
|---------|-------------|
| **Header name** | The name of the custom header. |
| **Header value** | The value of the custom header. |

### Additional settings

Configure additional options for request handling and HTTP methods.

#### Timeout

| Setting | Description |
|---------|-------------|
| **Timeout** | The timeout in seconds for API requests. Default is 60 seconds. |

#### Dangerous HTTP methods

By default, the Infinity data source only allows GET and POST HTTP methods to reduce the risk of destructive payloads. You can enable other methods such as `PATCH`, `PUT`, and `DELETE` for unconventional use cases.

| Setting | Description |
|---------|-------------|
| **Allow dangerous HTTP methods** | Enable PATCH, PUT, and DELETE methods. |

{{< admonition type="warning" >}}
Infinity doesn't validate any permissions against the underlying API. Enable this setting with caution as this can potentially perform destructive actions in the underlying API.
{{< /admonition >}}

### Network settings

Configure how the Infinity data source connects to external APIs.

{{< admonition type="note" >}}
The Infinity data source sends all API requests from the Grafana server, not from the user's browser. This means network configuration (proxies, firewalls, etc.) must allow outbound connections from your Grafana server to the target APIs.
{{< /admonition >}}

#### Proxy settings

You can configure proxy settings for routing requests through a proxy server.

| Setting | Description |
|---------|-------------|
| **Proxy from environment variable** | Default. Uses the `HTTP_PROXY`, `HTTPS_PROXY`, and `NO_PROXY` environment variables. |
| **No proxy** | Requests skip the proxy and go directly to the underlying API. |
| **Proxy URL** | Configure a specific proxy URL for this data source. |
| **Proxy user name** | Optional. Username for proxy authentication. |
| **Proxy password** | Optional. Password for proxy authentication. |

{{< admonition type="warning" >}}
Setting up username and password for proxy authentication should only be used with legacy sites. RFC 2396 warns that passing authentication information in clear text is **not recommended** due to security risks.
{{< /admonition >}}

### Private data source connect (PDC)

Use private data source connect (PDC) to connect to and query data within a secure network without opening that network to inbound traffic from Grafana Cloud. Refer to [Private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/) for more information on how PDC works and [Configure Grafana private data source connect (PDC)](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/configure-pdc/) for steps on setting up a PDC connection.

If you use PDC with AWS Authentication, the PDC agent must allow internet egress to `sts.<region>.amazonaws.com:443`.

| Setting | Description |
|---------|-------------|
| **Private data source connect** | Select a PDC connection from the drop-down or create a new connection. |

### Health check

{{< shared id="health-check" >}}
The settings for the Infinity data source on the configuration page don't automatically validate the URL. To ensure that your settings, including authentication and API keys, are valid, you need to enable the custom health check in the **Health check** section of the configuration page.

{{< admonition type="note" >}}
The custom health check supports only HTTP GET methods. It verifies the response status code, specifically looking for an HTTP 200 status, but doesn't check the content of the response.
{{< /admonition >}}
{{< /shared >}}

If you receive a `Health check failed` message after you click **Save & Test**, check the URL to ensure it's valid and you entered it correctly.

## Provision the data source

You can define and configure the data source in YAML files as part of Grafana's provisioning system. For more information about provisioning, and for available configuration options, refer to [Provisioning Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/).

### Basic provisioning

```yaml
apiVersion: 1

datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
```

### Provisioning with authentication

The following example shows provisioning with basic authentication:

```yaml
apiVersion: 1

datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    basicAuth: true
    basicAuthUser: your_username
    jsonData:
      auth_method: basicAuth
      allowedHosts:
        - https://api.example.com
    secureJsonData:
      basicAuthPassword: your_password
```

### Provisioning with custom headers

```yaml
apiVersion: 1

datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      httpHeaderName1: X-Custom-Header
      httpHeaderName2: X-API-Token
    secureJsonData:
      httpHeaderValue1: custom-value
      httpHeaderValue2: your-api-token
```

### Advanced provisioning

The following example shows advanced provisioning with TLS and additional options:

```yaml
apiVersion: 1

datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    basicAuth: true
    basicAuthUser: your_username
    jsonData:
      auth_method: basicAuth
      allowedHosts:
        - https://api.example.com
      oauthPassThru: false
      tlsSkipVerify: false
      tlsAuth: true
      tlsAuthWithCACert: true
      serverName: api.example.com
      timeoutInSeconds: 60
      allowDangerousHTTPMethods: false
    secureJsonData:
      basicAuthPassword: your_password
      tlsCACert: |
        -----BEGIN CERTIFICATE-----
        ...
        -----END CERTIFICATE-----
      tlsClientCert: |
        -----BEGIN CERTIFICATE-----
        ...
        -----END CERTIFICATE-----
      tlsClientKey: |
        -----BEGIN RSA PRIVATE KEY-----
        ...
        -----END RSA PRIVATE KEY-----
```

{{< admonition type="tip" >}}
Once you have manually configured the data source and verified it is working, you can generate a provisioning YAML file from the data source configuration page. Look for the **Provisioning Script** button at the bottom of the config page in the **More** section.
{{< /admonition >}}

## Administrator configuration

Grafana administrators can configure plugin-wide settings using environment variables.

### Pagination limits

By default, pagination queries are limited to 5 pages maximum. To increase this limit, set the `GF_PLUGIN_PAGINATION_MAX_PAGES` environment variable:

```shell
GF_PLUGIN_PAGINATION_MAX_PAGES=10
```

For Docker deployments:

```shell
docker run -p 3000:3000 \
  -e "GF_INSTALL_PLUGINS=yesoreyeram-infinity-datasource" \
  -e "GF_PLUGIN_PAGINATION_MAX_PAGES=10" \
  grafana/grafana:latest
```

{{< admonition type="note" >}}
Higher pagination limits increase the number of API requests made per query, which can affect performance and API rate limits.
{{< /admonition >}}
