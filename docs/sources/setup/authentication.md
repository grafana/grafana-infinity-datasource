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
- OAuth 2.0 External Account (Workload Identity Federation — Google, AWS, GitHub, Azure, and any OIDC/SAML provider)
- Azure authentication
- Azure blob
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
| **Client ID**       | ClientID is the application's ID.                                                                 |
| **Client Secret**   | ClientSecret is the application's secret.                                                         |
| **Token URL**       | TokenURL is the resource server's token endpoint URL. This is a constant specific to each server. |
| **Scopes**          | Scope specifies optional requested permissions.                                                   |
| **Endpoint params** | EndpointParams specifies additional parameters for requests to the token endpoint.                |

### Customizing OAuth2 Tokens

In Infinity, OAuth2.0 client credentials authentication supports advanced customization for scenarios where APIs require non-standard token formats or headers. For detailed information on customizing OAuth2 token headers and templates, see [OAuth2 Custom Tokens](/docs/plugins/yesoreyeram-infinity-datasource/latest/setup/oauth2-token-customization/).

Key features:

- Custom header names (e.g., `X-API-Key` instead of `Authorization`)  
- Custom token value format (e.g., `Token ${__oauth2.access_token}` instead of `Bearer ${__oauth2.access_token}`)
- Support for multiple token properties (access token, refresh token, token type)

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

> Infinity OAuth 2.0 JWT authentication also supports token customization. See [OAuth2 Custom Tokens](/docs/plugins/yesoreyeram-infinity-datasource/latest/setup/oauth2-token-customization) for details.


## Azure

If you want to authenticate your API endpoints via Microsoft Azure authentication, refer to [Azure authentication](/docs/plugins/yesoreyeram-infinity-datasource/latest/examples/azure/).

## Azure Blob

To retrieve content from Azure blob storage, you need to provide the following information:

| Key                      | Description                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **Azure Cloud**          | Optional.                                                                                |
|                          | Azure Cloud / `https://<your-storage-account-name>.blob.core.windows.net/`               |
|                          | Azure US Government / `https://<your-storage-account-name>.blob.core.usgovcloudapi.net/` |
|                          | Azure China / `https://<your-storage-account-name>.blob.core.chinacloudapi.cn/`          |
| **Storage account name** | Required.                                                                                |
| **Storage account key**  | Required. Provide either primary key or secondary key                                    |

## AWS

If you want to authenticate your API endpoints via Amazon AWS authentication, refer to [AWS authentication](/docs/plugins/yesoreyeram-infinity-datasource/latest/examples/aws/).

## OAuth2 External Account (Workload Identity Federation)

The **External Account** OAuth2 grant type lets any workload running outside a Google Cloud project access Google Cloud APIs without using long-lived service account keys. It implements the [RFC 8693 OAuth 2.0 Token Exchange](https://datatracker.ietf.org/doc/html/rfc8693) specification: the workload presents a short-lived *external* identity token to the Google Security Token Service (STS), which returns a short-lived Google access token.

### Why "External Account" instead of "Google WIF"?

The credentials JSON format (`"type": "external_account"`) already describes *all* the information required for the token exchange — which external identity provider to use, where to retrieve the external token, and which STS endpoint to use. Infinity therefore does not need a separate configuration section per provider. You pick **OAuth2 → External Account**, paste the credentials JSON, and it works regardless of which external identity source is configured inside that JSON.

### Supported external identity providers

| External identity source | How the external token is obtained | Notes |
|--------------------------|-------------------------------------|-------|
| **Google Workload Identity Federation** (OIDC/SAML providers) | URL or file credential source containing a JWT from any OIDC/SAML provider (Okta, Ping, etc.) | Most common use case for on-prem or multi-cloud Grafana |
| **GitHub Actions** | URL credential source pointing at the GitHub OIDC endpoint (`ACTIONS_ID_TOKEN_REQUEST_URL`) | Allows GitHub CI pipelines to query Google APIs without storing keys |
| **AWS EC2 / ECS** | AWS SigV4-signed `GetCallerIdentity` request — `"environment_id": "aws1"` in the JSON | Cross-cloud: an AWS workload obtains Google access tokens |
| **Azure AD / Entra ID federated identity** | URL credential source pointing at the Azure AD OIDC token endpoint | Cross-cloud: an Azure workload obtains Google access tokens |
| **Kubernetes Service Accounts** | File credential source reading a projected volume token | Useful for Kubernetes-native Grafana deployments |
| **Any OIDC/SAML provider** | URL or file credential source | The provider must issue a JWT or SAML assertion |

### Scope and fields mapping

| UI field | Stored as | Backend field | Description |
|----------|-----------|---------------|-------------|
| **Credentials JSON** | `oauth2ExternalCredentials` (secure) | `OAuth2Settings.CredentialsJSON` | The full `external_account` JSON file downloaded from the identity provider |
| **Scopes** | `oauth2.scopes` (JSON) | `OAuth2Settings.Scopes` | OAuth2 scopes passed to `CredentialsFromJSONWithType` alongside the credentials JSON. For Google APIs, use `https://www.googleapis.com/auth/cloud-platform`. |

The `credential_source` section inside the credentials JSON tells the library *where* to read the external identity token from (URL, file path, or AWS metadata endpoint). Infinity does not control that part — it is embedded in the credentials JSON you provide.

### Required parameters

| Field                | Description |
| -------------------- | ----------- |
| **Credentials JSON** | (Secure) The `external_account` credentials JSON file downloaded from the identity provider. Only the `external_account` credential type is accepted; service account keys and other types are rejected for security. |
| **Scopes**           | Comma-separated OAuth2 scopes to request. For example: `https://www.googleapis.com/auth/cloud-platform`. |

### How to set up (Google WIF example)

1. In Google Cloud Console, navigate to **IAM & Admin → Workload Identity Federation**.
2. Create a **Workload Identity Pool** and a **Provider** that trusts your external identity source (OIDC endpoint, GitHub OIDC, AWS, etc.).
3. Grant the pool (or a mapped service account) the IAM roles needed to call your target Google API (for example, **BigQuery Data Viewer** for BigQuery).
4. On the **Provider** page, click **Download configuration** to obtain the `external_account` credentials JSON file.
5. In Grafana, open the Infinity datasource configuration, select **OAuth2** as the authentication method, then select **External Account (WIF)** as the grant type.
6. Paste the downloaded JSON into the **Credentials JSON** field, add the required scopes, and save.

{{< admonition type="note" >}}
The credentials JSON must be of type `external_account`. Service account keys (`service_account` type) and other credential types are rejected at configuration time for security reasons.
{{< /admonition >}}

{{< admonition type="tip" >}}
If your target Google API returns 403 errors after authentication succeeds, verify that the IAM bindings on the Workload Identity Pool (or the impersonated service account) include the necessary Google Cloud roles.
{{< /admonition >}}

## Private data source connect (PDC)

Use private data source connect (PDC) to connect to and query data within a secure network without opening that network to inbound traffic from Grafana Cloud. See [Private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/) for more information on how PDC works and [Configure Grafana private data source connect (PDC)](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/configure-pdc/#configure-grafana-private-data-source-connect-pdc) for steps on setting up a PDC connection.

If you use PDC with AWS Authentication, the PDC agent must allow internet egress to`sts.<region>.amazonaws.com:443`.

- **Private data source connect** - Click in the box to set the default PDC connection from the dropdown menu or create a new connection.

Once you have configured your Infinity data source options, click **Save & test** at the bottom to test out your data source connection. You can also remove a connection by clicking **Delete**.