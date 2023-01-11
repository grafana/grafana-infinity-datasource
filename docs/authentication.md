---
slug: '/wiki/authentication'
title: 'Authentication'
previous_page_title: 'Installation'
previous_page_slug: '/wiki/installation'
next_page_title: 'Provisioning'
next_page_slug: '/wiki/provisioning'
---

## Authentication

Infinity datasource supports following authentication methods

- No Authentication
- Basic authentication
- Bearer token authentication
- API Key authentication
- Digest authentication
- OAuth passthrough
- OAuth2 client credentials
- OAuth2 JWT authentication

## No Authentication

If your APIs doesn't require any authentication, select **No Authentication** method.

## Basic Authentication

Basic authentication sends a username and password with your request. In the request Headers, the Authorization header will be sent in the `Basic <Base64 encoded username and password>` format.

## API Key Authentication

With API key authentication, you can send a key-value pair to the API via request header or query parameter. API Key authentication requires following parameters

| Key   | Description                                                                                                                                                                |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Key   | Key of the API token                                                                                                                                                       |
| Value | Value of the API token                                                                                                                                                     |
| In    | Accepts `header`/`query`. Most APIs accept API keys via headers which is preferred way of sending api keys. Sending API keys via the query parameter is not suggested way. |

## Digest Authentication

Digest authentication enable requests to authenticate using [RFC7616 HTTP Digest Access Authentication protocol](https://www.rfc-editor.org/rfc/rfc7616.txt).

## Bearer Token Authentication

Bearer token enable requests to authenticate using an access key, such as a JSON Web Token (JWT), personal access token. In the request Headers, the Authorization header will be sent in the `Bearer <Your API key>` format.

> If you need a custom prefix instead of Bearer prefix, use API Key authentication instead with the key of **Authorization**.

## OAuth Passthrough

If grafana user is already authenticated via OAuth, this authentication method will forward the oauth tokens to the API.

## OAuth2 Client Credentials Authentication

OAuth2 Client credentials require the following parameters

| Key             | Description                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Client ID       | ClientID is the application's ID                                                                  |
| Client Secret   | ClientSecret is the application's secret.                                                         |
| Token URL       | TokenURL is the resource server's token endpoint URL. This is a constant specific to each server. |
| Scopes          | Scope specifies optional requested permissions.                                                   |
| Endpoint params | EndpointParams specifies additional parameters for requests to the token endpoint.                |

## OAuth2 JWT Authentication

OAuth2 JWT require the following parameters

| Key                    | Description                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| Email                  | Email is the OAuth client identifier used when communicating with the configured OAuth provider                 |
| Private Key            | PrivateKey contains the contents of an RSA private key or the contents of a PEM file that contains a privatekey |
| Private Key Identifier | Optional. PrivateKeyID contains an optional hint indicating which key is being used                             |
| Token URL              | TokenURL is the endpoint required to complete the 2-legged JWT flow                                             |
| Subject                | Optional. Subject is the optional user to impersonate                                                           |
| Scopes                 | Scopes optionally specifies a list of requested permission scopes. Provide scopes as a comma separated values   |

## Azure Authentication

If you want to authenticate your API endpoints via microsoft azure authentication, refer steps given [here](/wiki/azure-authentication).

## AWS Authentication

If you want to authenticate your API endpoints via amazon aws authentication, refer steps given [here](/wiki/aws-authentication).
