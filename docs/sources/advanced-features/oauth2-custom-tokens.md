---
title: OAuth2 token customization
menuTitle: OAuth2 tokens
description: Customize OAuth2 token headers and formats for the Infinity data source.
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/setup/oauth2-custom-tokens/
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/setup/oauth2-token-customization/
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/oauth2-custom-tokens/
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/advanced-features/advanced-features/oauth2-custom-tokens/
keywords:
  - infinity
  - oauth2
  - authentication
  - token customization
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 80
---

# OAuth2 token customization

The Infinity data source supports OAuth2 authentication with advanced customization options for token headers and token templates. This feature allows you to customize how OAuth2 access tokens are sent in HTTP requests, accommodating APIs that don't follow standard OAuth2 patterns.

## When to use custom token configuration

By default, OAuth2 authentication sends the access token in the standard format:

```http
Authorization: Bearer <access_token>
```

Use custom token configuration when your API requires:

- A different header name (for example, `X-API-Key` or `X-Access-Token`)
- A custom token format with different prefixes
- Access to the refresh token or token type in the header

## AuthHeader option

The `authHeader` field specifies a custom header name for the OAuth2 token.

| Setting | Description |
|---------|-------------|
| Default | `Authorization` |
| Type | String |

**Example values:**

- `X-API-Key`
- `X-Access-Token`
- `Bearer-Token`

## TokenTemplate option

The `tokenTemplate` field specifies a custom format for the token value using placeholders.

| Setting | Description |
|---------|-------------|
| Default | `Bearer ${__oauth2.access_token}` |
| Type | String with placeholders |

**Available placeholders:**

| Placeholder | Description |
|-------------|-------------|
| `${__oauth2.access_token}` | The OAuth2 access token |
| `${__oauth2.refresh_token}` | The OAuth2 refresh token (when available) |
| `${__oauth2.token_type}` | The OAuth2 token type returned by the server |

**Example templates:**

| Template | Result |
|----------|--------|
| `Bearer ${__oauth2.access_token}` | `Bearer abc123` (default) |
| `Token ${__oauth2.access_token}` | `Token abc123` |
| `${__oauth2.access_token}` | `abc123` (no prefix) |
| `${__oauth2.token_type} ${__oauth2.access_token}` | Dynamic prefix from token response |
| `ApiKey ${__oauth2.access_token}` | `ApiKey abc123` |

## Configuration example

To configure custom OAuth2 token handling, add the following to your data source provisioning YAML:

```yaml
apiVersion: 1
datasources:
  - name: Custom API
    type: yesoreyeram-infinity-datasource
    jsonData:
      oauthPassThru: false
      oauth2:
        oauth2_type: client_credentials
        client_id: your-client-id
        token_url: https://auth.example.com/oauth/token
        authHeader: X-API-Key
        tokenTemplate: "ApiKey ${__oauth2.access_token}"
    secureJsonData:
      oauth2ClientSecret: your-client-secret
```

This configuration sends requests with:

```http
X-API-Key: ApiKey abc123
```

Instead of the default:

```http
Authorization: Bearer abc123
```

## TokenHeaders option

The `tokenHeaders` field allows you to specify custom HTTP headers to send with OAuth2 token endpoint requests. This is useful when working with OAuth2 servers that have strict header validation requirements.

| Setting | Description |
|---------|-------------|
| Default | None (no custom headers) |
| Type | Map of string key-value pairs |

**Use case**: Some OAuth2 servers validate the `Accept` header or other headers in token requests. By default, the OAuth2 library may not set certain headers, causing authentication failures with error messages like:

```
oauth2: "invalid_request" "The header 'Accept : ' is not supported."
```

**Common headers to configure:**

| Header | Example value | Purpose |
|--------|---------------|---------|
| `Accept` | `application/json` | Specify the desired response format |
| `Content-Type` | `application/x-www-form-urlencoded` | Override the default content type |
| `User-Agent` | `MyApp/1.0` | Custom user agent string |

**Important notes:**

- Token headers are only sent to the token endpoint URL, not to your API requests.
- Headers specified here will not override headers already set by the OAuth2 library.
- These headers are in addition to the standard OAuth2 authentication headers.

## Configure in the UI

1. In the data source configuration, expand **Authentication**.
1. Select **OAuth2** as the authentication method.
1. Select your OAuth2 type (for example, **Client Credentials**).
1. Fill in the required OAuth2 fields (Client ID, Client Secret, Token URL).
1. Expand **Customize OAuth2 token (Advanced)**.
1. In the **Custom Token Header** field, enter your custom header name.
1. In the **Custom Token Template** field, enter your custom token format using placeholders.
1. To add token request headers, use the **Token request headers** fields to enter key-value pairs.
1. Click **Save & test**.
