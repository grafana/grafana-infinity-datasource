---
name: configuring-infinity-datasource
description: Configure the Infinity data source — base URL and allowed hosts, the authentication methods (basic, bearer token, API key, digest, OAuth passthrough, OAuth 2.0 client credentials/JWT, Azure, Azure Blob, AWS), TLS, custom HTTP headers, network and security settings, the custom health check, and provisioning with a config file. Use when a user asks how to set up, configure, or change settings for the Infinity data source; how to authenticate to an API; how to allow hosts; how to provision it as YAML; or how to troubleshoot connection, authentication, or health-check issues.
---

# Configuring the Infinity data source

The Infinity data source is a universal plugin for pulling data from REST APIs and
other systems (JSON, CSV, TSV, XML, GraphQL, HTML, Google Sheets, and more) into
Grafana. It works out of the box with no configuration for public endpoints; configure
it when you need authentication, custom headers, TLS, network restrictions, or a base
URL shared across queries.

This skill explains how to configure the Infinity data source from the Grafana UI and
how to provision it from a config file. The data source `type` is
`yesoreyeram-infinity-datasource`.

## Open the configuration page

1. In Grafana, go to **Connections → Data sources**.
2. Select your **Infinity** data source, or click **Add new data source** and choose
   **Infinity**.
3. Change the settings you need, then click **Save & test**.

Configuration applies to **all** queries that use this data source instance. If you
need different settings (for example, different credentials) for different queries,
create a separate Infinity data source instance.

The configuration UI is organized into pages in the left navigation:

| Page                       | Contents                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------- |
| **Authentication**         | Auth type and its credential fields (see [Authentication](#authentication)).        |
| **URL, Headers & Params**  | Base URL, custom HTTP headers, custom query params, and kept cookies.               |
| **Network**                | Request timeout, TLS settings, and proxy.                                           |
| **Security**               | Allowed hosts and unsecured-query handling (see [Security](#security-settings)).    |
| **Health check**           | Optional custom health-check URL (see [Custom health check](#custom-health-check)). |
| **Reference data**         | Named inline datasets reusable in queries.                                          |
| **Global queries**         | Named queries reusable across panels.                                               |

## URL, Headers & Params

| Setting          | What it does                                                                                                                                                 | Stored as           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| **Base URL**     | Optional. Prefixed to every query URL. For example, base URL `https://example.com/api` plus query URL `/users` resolves to `https://example.com/api/users`.  | `url` (jsonData)    |
| **Custom HTTP headers** | Header name/value pairs sent with every request. Values are secret.                                                                                   | `httpHeaderName{N}` / `httpHeaderValue{N}` (secure) |
| **URL query params** | Query-string key/value pairs sent with every request. Values are secret.                                                                                 | `secureQueryName{N}` / `secureQueryValue{N}` (secure) |
| **Keep cookies** | Names of cookies to forward from the incoming request to the upstream API.                                                                                   | `keepCookies` (jsonData array) |

Setting a **Base URL** also satisfies the [Allowed hosts](#allowed-hosts) requirement
for that host. Custom headers (other than `Accept` / `Content-Type`), custom query
params, and kept cookies each independently require **Allowed hosts** to be set.

Provisioning example:

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      url: https://example.com/api
      keepCookies:
        - session_id
      # Header/param names are stored in jsonData; their values are secret.
      httpHeaderName1: X-Custom-Header
      secureQueryName1: api_version
      allowedHosts:
        - https://example.com
    secureJsonData:
      httpHeaderValue1: my-header-value
      secureQueryValue1: '2024-01-01'
```

## Authentication

On the **Authentication** page, pick an **Auth type** card that matches your API. The
fields that appear below the cards change with the selected method. The available auth
types are:

| Auth type                | `auth_method` value | Use it when…                                                                  |
| ------------------------ | ------------------- | ----------------------------------------------------------------------------- |
| **No Auth**              | `none`              | The API is public and needs no credentials.                                   |
| **Basic Authentication** | `basicAuth`         | The API expects a username and password (`Authorization: Basic …`).           |
| **Bearer Token**         | `bearerToken`       | The API expects `Authorization: Bearer <token>` (JWT, PAT, etc.).             |
| **API Key Value pair**   | `apiKey`            | The API expects a key/value pair in a **header** or **query** parameter.      |
| **Digest Auth**          | `digestAuth`        | The API uses RFC 7616 HTTP Digest auth (username + password).                 |
| **Forward OAuth**        | `oauthPassThru`     | Forward the Grafana user's existing OAuth identity token to the API.          |
| **OAuth2**               | `oauth2`            | Machine-to-machine OAuth — Client Credentials, JWT, or another grant.         |
| **AWS**                  | `aws`               | The API is an AWS signed endpoint (for example CloudWatch / `monitoring`).    |
| **Azure Blob**           | `azureBlob`         | You are reading data from Azure Blob Storage.                                 |

> **Allowed hosts requirement.** Every method except **No Auth** and **Azure Blob**
> requires you to list the target host under **Allowed hosts** (on the **Security**
> page) unless you set a **Base URL**. If neither is set, queries are blocked. See
> [Security](#security-settings) and [Allowed hosts](#allowed-hosts).

### No Auth (`none`)

No credentials are sent. Use for public APIs. **Allowed hosts** is not required for the
auth method itself, but may still be required if you enable TLS, custom headers, custom
query params, or kept cookies.

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: none
```

### Basic Authentication (`basicAuth`)

Sends `Authorization: Basic <base64(user:password)>`.

| Field         | Stored as                       |
| ------------- | ------------------------------- |
| **User Name** | `basicAuthUser` (jsonData)      |
| **Password**  | `basicAuthPassword` (secure)    |

A missing or empty password produces `invalid or empty password detected` on
**Save & test**.

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    basicAuth: true
    basicAuthUser: my-user
    jsonData:
      auth_method: basicAuth
      allowedHosts:
        - https://api.example.com
    secureJsonData:
      basicAuthPassword: ${BASIC_AUTH_PASSWORD}
```

### Bearer Token (`bearerToken`)

Sends `Authorization: Bearer <token>` exactly. Use this only when the API expects the
literal `Bearer ` prefix.

| Field      | Stored as                |
| ---------- | ------------------------ |
| **Token**  | `bearerToken` (secure)   |

A missing or empty token produces `invalid or empty bearer token detected`.

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: bearerToken
      allowedHosts:
        - https://api.example.com
    secureJsonData:
      bearerToken: ${BEARER_TOKEN}
```

### API Key Value pair (`apiKey`)

Sends an arbitrary key/value either as a header or as a query string parameter. Use this
when the API needs a custom header name (for example `X-API-Key`), a non-`Bearer`
prefix, or the key passed in the URL.

| Field     | Stored as                                  | Notes                                           |
| --------- | ------------------------------------------ | ----------------------------------------------- |
| **Key**   | `apiKeyKey` (jsonData)                      | Header name or query-parameter name.           |
| **Value** | `apiKeyValue` (secure)                      | The secret key value.                          |
| **In**    | `apiKeyType` (jsonData): `header` \| `query`| Whether the pair is added as a header or query.|

A missing key or value produces `invalid API key specified`.

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: apiKey
      apiKeyKey: X-API-Key
      apiKeyType: header # or: query
      allowedHosts:
        - https://api.example.com
    secureJsonData:
      apiKeyValue: ${API_KEY}
```

### Digest Auth (`digestAuth`)

HTTP Digest authentication (RFC 7616). Same fields as Basic Authentication
(**User Name** + **Password**, stored in `basicAuthUser` / `basicAuthPassword`), but the
Digest challenge/response handshake is used instead of `Basic`.

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    basicAuth: true
    basicAuthUser: my-user
    jsonData:
      auth_method: digestAuth
      allowedHosts:
        - https://api.example.com
    secureJsonData:
      basicAuthPassword: ${DIGEST_PASSWORD}
```

### Forward OAuth (`oauthPassThru`)

Forwards the OAuth identity token of the currently signed-in Grafana user to the API. No
credential fields are shown; Grafana must be configured with an OAuth provider and the
user must have a valid token. Sets `oauthPassThru: true` in jsonData.

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: oauthPassThru
      oauthPassThru: true
      allowedHosts:
        - https://api.example.com
```

### OAuth2 (`oauth2`)

Selecting **OAuth2** reveals a **Grant type** selector with three options:

#### Client credentials (`oauth2_type: client_credentials`)

Machine-to-machine flow. Infinity fetches a token from the token URL and attaches it to
each request.

| Field                | Stored as                        | Notes                                                                 |
| -------------------- | -------------------------------- | --------------------------------------------------------------------- |
| **Client ID**        | `oauth2.client_id` (jsonData)    |                                                                       |
| **Client Secret**    | `oauth2ClientSecret` (secure)    |                                                                       |
| **Token URL**        | `oauth2.token_url` (jsonData)    | The OAuth token endpoint.                                             |
| **Scopes**           | `oauth2.scopes` (jsonData array) | One or more scopes.                                                   |
| **Auth Style**       | `oauth2.authStyle` (jsonData)    | `0` Auto, `1` In Params (body), `2` In Header (basic auth on token).  |
| **Endpoint params**  | `oauth2EndPointParamsName{N}` / `oauth2EndPointParamsValue{N}` (secure) | Extra parameters sent to the token endpoint. |

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: oauth2
      oauth2:
        oauth2_type: client_credentials
        client_id: my-client-id
        token_url: https://api.example.com/oauth2/token
        scopes:
          - read
        authStyle: 0 # 0 Auto, 1 In Params, 2 In Header
      allowedHosts:
        - https://api.example.com
    secureJsonData:
      oauth2ClientSecret: ${OAUTH2_CLIENT_SECRET}
```

#### JWT (`oauth2_type: jwt`)

Two-legged JWT bearer flow (for example Google service accounts).

| Field                       | Stored as                        |
| --------------------------- | -------------------------------- |
| **Email**                   | `oauth2.email` (jsonData)        |
| **Private Key Identifier**  | `oauth2.private_key_id` (jsonData)|
| **Private Key**             | `oauth2JWTPrivateKey` (secure)   |
| **Token URL**               | `oauth2.token_url` (jsonData)    |
| **Subject**                 | `oauth2.subject` (jsonData)      |
| **Scopes**                  | `oauth2.scopes` (jsonData array) |

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: oauth2
      oauth2:
        oauth2_type: jwt
        email: my-service-account@project.iam.gserviceaccount.com
        private_key_id: my-private-key-id
        token_url: https://oauth2.googleapis.com/token
        subject: my-subject
        scopes:
          - https://www.googleapis.com/auth/spreadsheets.readonly
      allowedHosts:
        - https://sheets.googleapis.com
    secureJsonData:
      oauth2JWTPrivateKey: ${OAUTH2_JWT_PRIVATE_KEY}
```

> **Advanced token customization.** For all OAuth2 grants you can override how the token
> is attached — a custom token header name, a custom token value template, and extra
> token-request headers (`oauth2TokenHeadersName{N}` / `oauth2TokenHeadersValue{N}`).
> See [OAuth2 Custom Tokens](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/advanced-features/oauth2-custom-tokens/).

### AWS (`aws`)

Signs requests with AWS Signature V4 using static access keys.

| Field          | Stored as                          | Notes                                            |
| -------------- | ---------------------------------- | ------------------------------------------------ |
| **Region**     | `aws.region` (jsonData)            | For example `us-east-1`.                         |
| **Service**    | `aws.service` (jsonData)           | The AWS service name, for example `monitoring`.  |
| **Access Key** | `awsAccessKey` (secure)            | A missing value yields `invalid/empty AWS access key`. |
| **Secret Key** | `awsSecretKey` (secure)            | A missing value yields `invalid/empty AWS secret key`. |

The auth type is fixed to access keys (`aws.authType: keys`).

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: aws
      aws:
        authType: keys
        region: us-east-1
        service: monitoring
      allowedHosts:
        - https://monitoring.us-east-1.amazonaws.com
    secureJsonData:
      awsAccessKey: ${AWS_ACCESS_KEY}
      awsSecretKey: ${AWS_SECRET_KEY}
```

### Azure Blob (`azureBlob`)

Reads from Azure Blob Storage. **Allowed hosts** is _not_ required for this method.

| Field                      | Stored as                              | Notes                                                            |
| -------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| **Azure cloud**            | `azureBlobCloudType` (jsonData)        | `AzureCloud`, `AzureUSGovernment`, or `AzureChinaCloud`.         |
| **Storage account name**   | `azureBlobAccountName` (jsonData)      | A missing value yields `invalid/empty azure blob account name`.  |
| **Storage account key**    | `azureBlobAccountKey` (secure)         | A missing value yields `invalid/empty azure blob key`.           |

An HTTP 403 from Azure surfaces as `http 403. check azure blob storage key`.

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: azureBlob
      azureBlobCloudType: AzureCloud # or: AzureUSGovernment, AzureChinaCloud
      azureBlobAccountName: mystorageaccount
    secureJsonData:
      azureBlobAccountKey: ${AZURE_BLOB_ACCOUNT_KEY}
```

### Other Auth Providers

The **Other Auth Providers** card opens a guided dialog for common providers:

- **GitHub** — guided Basic Authentication setup that also pre-fills the GitHub host
  under **Allowed hosts**.
- **Google JWT** — guided OAuth2 JWT setup for Google service accounts.

These guides simply pre-configure the underlying auth methods described above. To
provision them, use the **Basic Authentication** example (GitHub) or the OAuth2 **JWT**
example (Google JWT) shown above.

### Choosing between methods

- **Bearer vs API key**: If the API expects the literal `Authorization: Bearer <token>`,
  use **Bearer Token**. If it needs a different header name, a non-`Bearer` prefix, or
  the credential in the query string, use **API Key Value pair**.
- After choosing any method other than **No Auth** or **Azure Blob**, add the target
  host under **Allowed hosts** (or set a **Base URL**) or queries will be blocked.

## Network

The **Network** page controls how requests reach the upstream API.

### Timeout

**Timeout (in seconds)** sets the per-request timeout. The default is 60 seconds; `0`
means no timeout. Stored as `timeoutInSeconds` (jsonData). Requests that exceed it fail
with a `context deadline exceeded` / `connection timed out` error.

### TLS / SSL settings

Configure these when your API requires client certificates or a custom CA:

| Setting                       | What it does                                                                 | Stored as              |
| ----------------------------- | --------------------------------------------------------------------------- | ---------------------- |
| **Skip TLS Verify**           | Skips certificate verification (not recommended for production).            | `tlsSkipVerify`        |
| **TLS Client Auth**           | Enables client-certificate authentication.                                  | `tlsAuth`              |
| **With CA Cert**              | Uses a custom CA certificate.                                               | `tlsAuthWithCACert`    |
| **ServerName**                | Server name matching the certificate (required with a custom CA cert).      | `serverName`           |
| **CA Cert**                   | The CA certificate contents.                                               | `tlsCACert` (secure)   |
| **Client Cert**               | The client certificate contents.                                          | `tlsClientCert` (secure)|
| **Client Key**                | The client private-key contents.                                          | `tlsClientKey` (secure)|

> Enabling any TLS option requires the target host to be added under
> [Allowed hosts](#allowed-hosts) (or a **Base URL** to be set).

### Proxy

| Setting           | What it does                                                                                  | Stored as            |
| ----------------- | -------------------------------------------------------------------------------------------- | -------------------- |
| **Proxy type**    | `None`, `Environment` (use `HTTP_PROXY`/`HTTPS_PROXY` env vars), or `URL` (explicit proxy).  | `proxy_type`         |
| **Proxy URL**     | Explicit proxy address when **Proxy type** is `URL`.                                          | `proxy_url`          |
| **Proxy user/password** | Optional credentials for the proxy.                                                     | `proxyUserName` / `proxyUserPassword` (secure) |
| **Secure SOCKS proxy** | Optionally route traffic through Grafana's secure SOCKS proxy.                          | `enableSecureSocksProxy` |

## Security settings

The **Security** page controls which hosts are reachable and how unsecured queries are
handled.

### Allowed hosts

**Allowed hosts** is an allow-list of URL prefixes the data source may connect to. When a
query URL does not start with one of the listed prefixes, the request is rejected.

- Enter the **full base URL**, including scheme, for each host — for example
  `https://api.example.com`.
- Setting a **Base URL** (on the **URL, Headers & Params** page) also satisfies this
  requirement for that host.
- **Allowed hosts is required** when any of the following is true:
  - An auth method other than **No Auth** or **Azure Blob** is selected.
  - TLS / SSL options are enabled.
  - Custom HTTP headers (other than `Accept` / `Content-Type`) are configured.
  - Custom URL query params are configured.
  - **Keep cookies** are configured.
- If none of those apply and no **Base URL** is set, all hosts are allowed.

### Unsecured query handling

Controls how inline/unsecured queries (where the URL or data is supplied in the query
itself) are treated: **Warn**, **Allow**, or **Deny**. Stored as
`unsecuredQueryHandling` (jsonData).

### Other security options

- **Allowed dangerous HTTP methods** — Enables `PUT`, `PATCH`, and `DELETE` in queries
  (`allowDangerousHTTPMethods`, off by default). When disabled, only `GET` and `POST`
  are permitted; other methods fail with `only GET and POST HTTP methods are allowed`.

## Custom health check

By default, **Save & test** verifies the data source without calling a specific URL.
Enable **custom health check** to point the test at a real endpoint so **Save & test**
confirms reachability and authentication against a URL you choose. Set the health check
URL, then click **Save & test**.

## Reference data and global queries

Two configuration features support reusable queries:

- **Reference data** — Define named inline datasets you can query later with the
  **Reference** source. See [Reference data](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/advanced-features/reference-data/).
- **Global queries** — Define named queries you can reuse across panels. See
  [Global queries](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/advanced-features/global-queries/).

## Provisioning with a config file

Instead of using the UI, provision the Infinity data source from a YAML file in
Grafana's `provisioning/datasources/` directory. The data source `type` is
`yesoreyeram-infinity-datasource`.

Minimal example (public endpoints, no auth):

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
```

Example with API key authentication and an allowed host:

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: apiKey
      apiKeyKey: X-API-Key
      apiKeyType: header
      allowedHosts:
        - https://api.example.com
    secureJsonData:
      apiKeyValue: ${API_KEY}
```

Non-secret options go under `jsonData` (for example `auth_method`, `allowedHosts`,
`timeoutInSeconds`, `proxy_type`, `customHealthCheckEnabled`, `customHealthCheckUrl`,
`tlsSkipVerify`, `global_queries`, `refData`). Secrets go under `secureJsonData` (for
example `apiKeyValue`, `bearerToken`, `basicAuthPassword`, `oauth2ClientSecret`,
`awsSecretKey`, `tlsClientKey`).

Provisioning changes are applied when Grafana starts or when you reload provisioning, so
restart Grafana (or trigger a provisioning reload) after editing the file.

## After saving

- Changes take effect when you click **Save & test**; no Grafana restart is needed for
  UI-based changes.
- Use the data source in panels and dashboards as you would any other.

## Troubleshooting

Match the error message you see (on **Save & test** or in a panel) to the cause and fix
below.

### Allowed hosts / blocked URLs

- **`requested URL not allowed. To allow this URL, update the data source config in the
  Security tab, Allowed hosts section`** — The query URL does not start with any
  configured prefix. Add the full base URL (for example `https://api.example.com`) under
  **Security → Allowed hosts**, or set a **Base URL**. Remember that any auth method
  (except No Auth / Azure Blob), TLS, custom headers, custom query params, or kept
  cookies makes **Allowed hosts** mandatory.

### Authentication errors

- **`invalid or empty password detected`** — Basic / Digest auth: enter the **Password**.
- **`invalid or empty bearer token detected`** — Bearer Token auth: enter the **Token**.
- **`invalid API key specified`** — API Key auth: set both **Key** and **Value** and
  pick the correct **In** (Header or Query Param).
- **`invalid/empty AWS access key`** / **`invalid/empty AWS secret key`** — AWS auth:
  enter both the **Access Key** and **Secret Key** (and the correct **Region** /
  **Service**).
- **`invalid/empty azure blob account name`** / **`invalid/empty azure blob key`** —
  Azure Blob auth: enter the **Storage account name** and **Storage account key**.
- **`http 403. check azure blob storage key`** — Azure returned 403; the storage account
  key is wrong or lacks permission.
- **Wrong header sent** — If the API rejects the token, confirm you chose the right
  method: use **Bearer Token** for a literal `Bearer <token>`, or **API Key Value pair**
  for a custom header name / non-`Bearer` prefix / query-string credential.

### HTTP method errors

- **`only GET and POST HTTP methods are allowed for this data source. To make use other
  methods, enable the "Allow dangerous HTTP methods" in the data source configuration`**
  — Enable **Security → Allowed dangerous HTTP methods** to use `PUT` / `PATCH` /
  `DELETE`.

### Network and TLS errors

- **`no such host`** — DNS could not resolve the host. Check the URL / Base URL.
- **`network is unreachable`** / **`connection refused`** — The host is not reachable
  from Grafana; check firewalls and that the service is up.
- **`context deadline exceeded`** / **`connection timed out`** — The request exceeded the
  configured timeout. Increase **Network → Timeout (in seconds)** or check upstream
  latency.
- **`socks connect` errors** — Check the proxy configuration on the **Network** page.
- **TLS / certificate errors** — Verify the CA cert, client cert/key, and **ServerName**.
  As a last resort (non-production), enable **Skip TLS Verify**.

### Other

- **`unsuccessful HTTP response code`** — The API returned a non-2xx status. Inspect the
  endpoint; optionally enable status-code handling for endpoints that return non-2xx on
  success.
- **`unable to parse response body as JSON`** — The response is not the format the query
  expects. Confirm the query **Type**/**Parser** matches the actual payload.
- **Provisioned changes don't appear** — Provisioning is applied only when Grafana starts
  or when you reload provisioning. Restart Grafana (or trigger a provisioning reload)
  after editing the YAML file.

## References

- [Configure the Infinity data source](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/configure/)
- [Grafana data source management](https://grafana.com/docs/grafana/latest/administration/data-source-management/)
- [Provisioning data sources](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)

## See also

- `querying-infinity-datasource` — build queries, choose types/parsers/sources, and
  shape results into data frames.
