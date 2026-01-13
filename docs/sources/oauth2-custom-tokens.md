---
slug: '/oauth2-custom-tokens'
title: OAuth2 token customization
menuTitle: OAuth2 token customization
description: Customize OAuth2 token headers and formats for the Infinity data source
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/setup/oauth2-custom-tokens/
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/setup/oauth2-token-customization/
keywords:
  - infinity
  - oauth2
  - authentication
  - token customization
labels:
  products:
    - oss
weight: 25
---

# OAuth2 Custom Token and Header Configuration

## Overview

The Grafana Infinity Datasource supports OAuth2 authentication with advanced customization options for token headers and token templates. This feature allows you to customize how OAuth2 access tokens are sent in HTTP requests, accommodating various API requirements that may not follow standard OAuth2 patterns.

## Standard OAuth2 vs Custom Token Configuration

### Standard OAuth2 Behavior

By default, OAuth2 authentication sends the access token in the standard format:

```http
Authorization: Bearer <access_token>
```

### Custom Token Configuration

With custom token configuration, you can:

- Use a different header name (e.g., `X-API-Key`, `X-Access-Token`)
- Use a custom token value format with different prefixes or formats
- Access various token properties (access token, refresh token, token type)

## Configuration Options

### AuthHeader

The `authHeader` field allows you to specify a custom header name for the OAuth2 token.

**Default**: `Authorization`

**Examples**:

- `X-API-Key`
- `X-Access-Token`
- `Authorization`
- `Bearer-Token`

### TokenTemplate

The `tokenTemplate` field allows you to specify a custom format for the token value.

**Default**: `Bearer ${__oauth2.access_token}`

**Available Placeholders**:

- `${__oauth2.access_token}` - The OAuth2 access token
- `${__oauth2.refresh_token}` - The OAuth2 refresh token (when available)
- `${__oauth2.token_type}` - The OAuth2 token type

**Examples**:

- `Bearer ${__oauth2.access_token}` (default)
- `Token ${__oauth2.access_token}`
- `${__oauth2.access_token}` (token only, no prefix)
- `${__oauth2.token_type} ${__oauth2.access_token}` (dynamic prefix)
- `ApiKey ${__oauth2.access_token}`
