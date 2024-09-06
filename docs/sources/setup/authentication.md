---
slug: '/authentication'
title: 'Authentication'
menuTitle: Authentication
description: Authentication options of Infinity datasource plugin
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
weight: 231
---

# Authentication

Infinity data source supports the following authentication methods:

- No authentication
- Basic authentication
- Bearer token authentication
- API key authentication
- Digest authentication
- OAuth passthrough
- OAuth 2.0 client credentials
- OAuth 2.0 JWT authentication
- Azure authentication
- Azure blob storage key
- AWS authentication

## No authentication

If your APIs don't require any authentication, select the **No Authentication** method.

## Basic

Basic authentication sends a username and password with your request.
In the request headers, the `Authorization` header uses the `Basic <BASE64_ENCODED_USERNAME_AND_PASSWORD>` format.

## Bearer token

Bearer token enable requests to authenticate using an access key, such as a JSON Web Token (JWT) or personal access token.
In the request headers, the `Authorization` header uses the `Bearer <API_KEY>` format.

{{< admonition type="tip" >}}
If you need a custom prefix instead of `Bearer` prefix, use API key authentication instead with the key of `Authorization`.
{{< /admonition >}}

## API key

With API key authentication, you can send a key-value pair to the API via request headers or query parameters.
API key authentication requires following parameters:

| Key       | Description                                                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Key**   | Key of the API token. This becomes the key of the header or query parameter.                                                                         |
| **Value** | Value of the API token                                                                                                                               |
| **In**    | Accepts `header`/`query`. Most APIs accept API keys via headers as a preferred way of sending API keys. Sending API keys via the query parameter is. |

{{< admonition type="tip" >}}
It's easy to confuse API key authentication with Bearer token authentication.
Ensure sure you are using the correct authentication mechanism.
{{< /admonition >}}

## Digest

Digest authentication enable requests to authenticate using [RFC7616 HTTP Digest Access Authentication protocol](https://www.rfc-editor.org/rfc/rfc7616.txt).

## OAuth passthrough

If your Grafana user is already authenticated via OAuth, this authentication method forwards the OAuth tokens to the API.

## OAuth 2.0 client credentials

OAuth 2.0 client credentials require the following parameters:

| Key                 | Description                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| **Client ID**       | ClientID is the application's ID.                                                                  |
| **Client Secret**   | ClientSecret is the application's secret.                                                         |
| **Token URL**       | TokenURL is the resource server's token endpoint URL. This is a constant specific to each server. |
| **Scopes**          | Scope specifies optional requested permissions.                                                   |
| **Endpoint params** | EndpointParams specifies additional parameters for requests to the token endpoint.                |

## OAuth 2.0 JWT

OAuth 2.0 JWT require the following parameters

| Key                        | Description                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Email**                  | Email is the OAuth client identifier used when communicating with the configured OAuth provider.                  |
| **Private Key**            | PrivateKey contains the contents of an RSA private key or the contents of a PEM file that contains a private key. |
| **Private Key Identifier** | Optional. PrivateKeyID contains an optional hint indicating which key to use.                                     |
| **Token URL**              | TokenURL is the endpoint required to complete the 2-legged JWT flow.                                              |
| **Subject**                | Optional. Subject is the optional user to impersonate.                                                            |
| **Scopes**                 | Scopes optionally specifies a list of requested permission scopes. Provide scopes as a comma separated values.    |

## Azure

If you want to authenticate your API endpoints via Microsoft Azure authentication, refer to [Azure authentication](/docs/plugins/yesoreyeram-infinity-datasource/latest/examples/azure/).

## Azure Blob Storage key

To retrieve content from azure blob storage, you need to provide the following information:

- Azure storage account name.
- Azure storage account key (either primary key or secondary key).

## AWS

If you want to authenticate your API endpoints via Amazon AWS authentication, refer to [AWS authentication](/docs/plugins/yesoreyeram-infinity-datasource/latest/examples/aws/).
