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
- OAuth passthrough (Forward OAuth Identity)
- OAuth 2.0 client credentials
- OAuth 2.0 JWT authentication
- OAuth 2.0 External Account (Workload Identity Federation — Google, AWS, GitHub, Azure, and any OIDC/SAML provider)
- OAuth 2.0 Forward Token → STS Exchange (use the Grafana-forwarded user token as the subject for an RFC 8693 cross-cloud token exchange)
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

## OAuth2 Forward Token → STS Exchange

The **Forward Token → STS Exchange** OAuth2 grant type enables per-user, cross-cloud authentication without long-lived secrets. It solves the problem: *"Grafana is already authenticated with Okta/Azure AD/GitHub — can we reuse that user identity to call Google Cloud APIs?"*

### How it works

1. Grafana is configured with an external OAuth provider (Okta, Azure AD, GitHub OAuth app, etc.).
2. The Grafana user logs in. Their OAuth bearer token lives in Grafana's session.
3. The Infinity datasource has **Forward OAuth Identity** enabled, so Grafana injects the user's token into every plugin request as `Authorization: Bearer <user_token>`.
4. On each outgoing HTTP request to the target API, the Infinity plugin intercepts the `Authorization` header and submits the user's token to the configured **STS token exchange endpoint** as the `subject_token` (per RFC 8693).
5. The STS validates the external identity token against its configured trust policy and issues a new, short-lived access token scoped to the requested `audience`.
6. The plugin replaces the `Authorization` header with the STS-issued token and forwards the request to the target API.

```
Grafana user (Okta/Azure AD/GitHub)
       │
       │  User logs in → Grafana session has IdP bearer token
       ▼
Grafana server
       │
       │  Forward OAuth Identity injects Bearer <idp_token> into requests
       ▼
Infinity plugin (stsTokenExchangeTransport.RoundTrip)
       │
       │  POST /token  grant_type=token-exchange
       │               subject_token=<idp_token>
       │               subject_token_type=urn:ietf:params:oauth:token-type:id_token
       │               audience=//iam.googleapis.com/...
       ▼
STS endpoint (e.g., Google STS, Azure STS)
       │
       │  Validates <idp_token> against trusted provider policy
       │  Issues: access_token=<sts_token>  expires_in=3600
       ▼
Infinity plugin
       │
       │  Authorization: Bearer <sts_token>
       ▼
Target API (Google BigQuery, Google Sheets, etc.)
```

### How this differs from "Forward OAuth Identity" (`oauthPassThru`)

These two auth mechanisms look similar — both use the Grafana user's OAuth session — but they are fundamentally different in what reaches the target API:

| Aspect | Forward OAuth Identity | Forward Token → STS Exchange |
|--------|------------------------|------------------------------|
| **What hits the target API** | The Grafana user's **original IdP token** | A **new, short-lived token** issued by the STS *for* the target service |
| **Target API requirement** | Must directly trust and accept the IdP's tokens | Only needs to accept its own STS-issued tokens |
| **Cross-cloud support** | ❌ — target must trust the same IdP as Grafana | ✅ — the STS bridges the trust between IdP and target |
| **Audience scoping** | None — original token sent as-is | ✅ — the STS enforces that the token is scoped to a specific `audience` |
| **Token lifetime control** | Grafana has no control; uses IdP token expiry | ✅ — STS typically issues short-lived tokens (1 hour) |
| **Secrets required** | None | None |
| **Per-user identity preserved** | ✅ — each user's own token is forwarded | ✅ — each user gets their own STS-issued token |
| **IdP token exposed to target** | ✅ — the IdP token is forwarded verbatim | ❌ — the target only ever sees the STS-issued token |
| **Complexity** | Low — no additional infrastructure | Medium — STS trust policy must be configured |

**Use Forward OAuth Identity when:**
- The target API directly accepts tokens from the same IdP Grafana uses (e.g., calling an Azure AD-protected API when Grafana itself uses Azure AD auth).
- You want the simplest possible setup with no external dependencies.

**Use Forward Token → STS Exchange when:**
- The target API is in a different cloud or trust domain (e.g., Google BigQuery when Grafana uses Okta or GitHub auth).
- You want the target API to only ever see tokens it issued, not raw IdP tokens.
- You need audience-scoped, short-lived tokens for the target service.

### Pros and cons

**Pros:**
- **Zero long-lived secrets**: no service account keys, no client secrets stored in the datasource.
- **Per-user identity**: each Grafana user's actions on the target API are attributable to their individual identity — audit logs on the target side show the user's email/subject, not a shared service account.
- **Works with any OAuth provider**: Okta, Azure AD, GitHub, Ping, Keycloak, or any IdP that issues OIDC JWTs.
- **Reuses existing trust infrastructure**: the STS trust policy is defined once; any Grafana user covered by that policy automatically gets access without additional provisioning.
- **Short-lived tokens**: the STS issues tokens with controlled expiry (typically 1 hour); the plugin caches them per user session.

**Cons:**
- **Additional infrastructure**: the STS trust policy must be configured in advance (e.g., a Google Workload Identity Pool provider that trusts your Okta OIDC endpoint). This is a one-time setup, but it requires cloud admin permissions.
- **Requires ForwardOauthIdentity**: the datasource must have "Forward OAuth Identity" enabled in Grafana's datasource settings page. This is a per-datasource setting, not a global one.
- **IdP token type matters**: the `subject_token_type` must match what the IdP actually issues. Okta and Azure AD typically issue OIDC ID tokens (`id_token`); GitHub issues access tokens. Mismatches cause STS to reject the exchange.
- **Not all IdPs are accepted by all STSes**: the STS must be explicitly configured to trust your specific IdP. Google STS requires registering the IdP's JWKS URI and audience in a Workload Identity Pool.
- **Token caching is per plugin instance**: the per-user token cache lives in memory inside the plugin process. If the plugin restarts, all cached STS tokens are discarded and re-exchanged on the next request.

### Feasibility with specific Grafana OAuth providers

| Grafana OAuth provider | Subject token type | Notes |
|------------------------|-------------------|-------|
| **Okta** | `urn:ietf:params:oauth:token-type:id_token` | Okta issues OIDC ID tokens. Configure a Google WIF pool provider with Okta's JWKS URI and your Okta issuer. |
| **Azure AD / Entra ID** | `urn:ietf:params:oauth:token-type:id_token` or `access_token` | Azure AD issues both ID tokens and access tokens. Use ID tokens for Google WIF integration (include `email` claim). |
| **GitHub OAuth** | `urn:ietf:params:oauth:token-type:access_token` | GitHub issues opaque OAuth access tokens. Note: GitHub's token can only be verified by GitHub itself — most STSes will reject it unless GitHub OIDC tokens are used instead. **GitHub Actions OIDC tokens** (not the regular GitHub OAuth tokens) are the recommended path for GitHub → Google WIF. |
| **Google** | `urn:ietf:params:oauth:token-type:id_token` | If Grafana itself uses Google Auth, Grafana users already have Google credentials. In this case, **Forward OAuth Identity** directly is often simpler. |
| **Generic OIDC** | `urn:ietf:params:oauth:token-type:id_token` | Any OIDC-compliant IdP works, as long as the STS is configured to trust it. |

### Scope and fields mapping

| UI field | JSON key | Backend field | Description |
|----------|----------|---------------|-------------|
| **STS Token URL** | `oauth2.token_url` | `OAuth2Settings.TokenURL` | The STS token exchange endpoint (e.g., `https://sts.googleapis.com/v1/token`). |
| **Audience** | `oauth2.audience` | `OAuth2Settings.Audience` | The target audience. For Google WIF: the full workload identity pool provider resource name. Optional for some STSes. |
| **Subject Token Type** | `oauth2.subject_token_type` | `OAuth2Settings.SubjectTokenType` | The RFC 8693 token type of the Grafana-forwarded token (see table above). |
| **Scopes** | `oauth2.scopes` | `OAuth2Settings.Scopes` | OAuth2 scopes to request in the exchanged token. For Google APIs: `https://www.googleapis.com/auth/cloud-platform`. |

### Required parameters

| Field | Description |
|-------|-------------|
| **STS Token URL** | The token exchange endpoint. Required. |
| **Subject Token Type** | What type the Grafana-forwarded token is. Required. |
| **Audience** | The WIF pool/provider resource name (or STS audience). Optional for some STSes, required for Google WIF. |
| **Scopes** | OAuth2 scopes. Optional. |

You must also enable **Forward OAuth Identity** in Grafana's datasource settings (the "oauthPassThru" option) so that Grafana injects the user's bearer token into outgoing plugin requests.

### How to set up (Okta + Grafana → Google WIF example)

1. In **Okta**, note your OIDC issuer URL (e.g., `https://your-org.okta.com`) and create an OAuth2 application for Grafana (if not already present). The `email` claim must be included in the Okta ID token.
2. In **Google Cloud Console**, navigate to **IAM & Admin → Workload Identity Federation**.
3. Create a **Workload Identity Pool** and a **Provider** of type **OIDC**. Set the Issuer URI to your Okta issuer URL.
4. Add an attribute mapping: `google.subject = assertion.sub` and optionally `attribute.email = assertion.email`.
5. Grant the pool (or a mapped service account) the required IAM roles for your target API (e.g., **BigQuery Data Viewer**).
6. In Grafana, configure the Infinity datasource:
   - **Authentication method**: OAuth2
   - **Grant type**: Forward Token → STS Exchange
   - **STS Token URL**: `https://sts.googleapis.com/v1/token`
   - **Audience**: the full workload identity pool provider resource name from step 3.
   - **Subject Token Type**: ID Token (OIDC JWT)
   - **Scopes**: `https://www.googleapis.com/auth/cloud-platform`
7. In the **same Infinity datasource settings page**, enable **Forward OAuth Identity** (the "oauthPassThru" setting at the top of the auth section) so Grafana injects the user's Okta token into plugin requests.
8. Save and test. Each Grafana user's Okta identity is now used to obtain a Google access token when querying BigQuery.

{{< admonition type="note" >}}
The "Forward OAuth Identity" option and the "OAuth2 / Forward Token → STS Exchange" option must both be set. "Forward OAuth Identity" tells Grafana to inject the user's token; "Forward Token → STS Exchange" tells the plugin to exchange that token with the STS rather than forwarding it verbatim to the target API.
{{< /admonition >}}

{{< admonition type="tip" >}}
Exchanged tokens are cached per user session in the plugin process (keyed by the subject token value). A fresh STS exchange is only performed when the cached token expires or the user's Grafana session changes.
{{< /admonition >}}

## Private data source connect (PDC)

Use private data source connect (PDC) to connect to and query data within a secure network without opening that network to inbound traffic from Grafana Cloud. See [Private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/) for more information on how PDC works and [Configure Grafana private data source connect (PDC)](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/configure-pdc/#configure-grafana-private-data-source-connect-pdc) for steps on setting up a PDC connection.

If you use PDC with AWS Authentication, the PDC agent must allow internet egress to`sts.<region>.amazonaws.com:443`.

- **Private data source connect** - Click in the box to set the default PDC connection from the dropdown menu or create a new connection.

Once you have configured your Infinity data source options, click **Save & test** at the bottom to test out your data source connection. You can also remove a connection by clicking **Delete**.