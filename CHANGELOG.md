# Change Log

## 3.7.4

🐛 Fixes the crash in query display text when the query type is empty. Fixes [#1525](https://github.com/grafana/grafana-infinity-datasource/issues/1525)

🐛 Updated go/backend version to 1.26.1

## 3.7.3

🐛 Updated backend/go version to 1.26.0 from 1.25.6 which resolves CVE-2025-68121

⚙️ Updated frontend & backend dependencies

## 3.7.2

⚙️ **Chore**: Migrated deprecated `Select` component to `Combobox` across the plugin

⚙️ **Chore**: Updated the required grafana version to 11.6 from 10.4

## 3.7.1

⚙️ **Chore**: Marked incorrect query errors as downstream errors

## 3.7.0

🚀 **Variable**: Added support for multi dimension / multi prop variable

🚀 **Variable**: Migrate variable queries to send standard `DataFrame` instead of `MetricFindValue[]`

🚀 **Variable**: Migrate from legacy variable query runner to CustomVariableSupport

🚀 **Variable**: Add support for custom text value field mapping in variables

⚙️ **Chore**: Update @grafana/assistant dependency to v0.1.0

⚙️ **Chore**: Bump brace-expansion v2.0.2

🐛 **Bug Fix**: Fixed a bug where variables not interpolated in jq parser

## 3.6.0

💥 **BREAKING CHANGE**: Renamed the Google Sheets range property to sheetRange to avoid conflicts with Grafana's built-in range field. See more information here [#1337](https://github.com/grafana/grafana-infinity-datasource/issues/1337)

🐛 **Bug fix**: Add Assistant helper for creating JQ and JSONata parser

🐛 **Bug fix**: Config editor crash when global query added

## 3.5.0

🚀 **New Feature**: Allow parsing HTTP response from non 200 status codes

🐛 **Bug fix**: Fixed a bug in oauth2 custom token template implementation

🐛 **Bug fix**: Fixed timeseries parsing in UQL

⚙️ **Chore**: Updated dependencies

## 3.4.1

⚙️ **Chore**: If the URL is specified without `http://` / `https://` scheme, infinity will now default to `https://` for non localhost URLs.

⚙️ **Chore**: Added more tests

## 3.4.0

🚀 **OAuth2 token customization**: Added support for OAuth2 token customization. To learn more, refer the [documentation](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/setup/oauth2-token-customization/)

🐛 **Cookie forwarding**: Forward cookies if jsonData.keepCookies is specified in datasource config

🐛 **Bug fix**: Fixes a bug where field type set to replace_url in field

🐛 **Bug fix**: Fixed a bug where pagination not working with jq backend parser

## 3.3.0

🚀 Added support for **jq** syntax in root selector via `jq-backend` parser. To learn more, refer the [documentation](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/jq-backend/).

🚀 Added support for custom proxy URL user name and password

🐛 Healthcheck error messages improvement

## 3.2.2

🐛 Upgrading from go 1.24.1 to 1.24.3 will address a number of known CVE's.

## 3.2.1

🎉 **New Feature**: Support for Azure US Government & Azure China cloud types with Azure blob storage account authentication

🚀 **Improvements**: Improve health check error handling

🐛 **Bug fix**: Fix error when setting up global query

🐛 **Bug fix**: Fixed an error while determining dataframe type (previously caused issues in alerting & recorded queries when there is a single row of results)

⚙️ **Chore**: Updated deprecated legacy components and utility classes in TlsConfigEditor

⚙️ **Chore**: Updated outdated dependencies

⚙️ **Chore**: Replaced absolute imports to use alias imports

## 3.2.0

🚀 **New Feature**: Add support for concurrent query execution behind the `infinityRunQueriesInParallel` feature flag

🐛 **Bug fix**: Remove props mutation in config editor

## 3.1.0

🚀 **New Feature**: Setting backend pagination max page size via grafana config (ini file)

🐛 **Bug fix**: Fix default parser for queries created before 3.0.0

🐛 **Bug fix**: Fix min value for input field in pagination

## 3.0.0

🚀 **New Feature**: Support for additional HTTP methods (`PATCH`, `PUT` and `DELETE`) via data source config `allowDangerousHTTPMethods`

🚀 **New Feature**: Support for passing grafana meta data such as user id, datasource uid to the underlying API as headers / query params via datasource settings

🚀 **Improvements**: Set the backend parser as the default parser for new queries. Existing queries with frontend parser should work as before. If broken, setting the parser to `Frontend` may help.

🚀 **Improvements**: Added support for gzip compression for outgoing requests by default. Fixes [#1003](https://github.com/grafana/grafana-infinity-datasource/issues/1003)

🚀 **Improvements**: Added frame type to dataplane compliant numeric data frames. This will help us to handle the results correctly in alerts, recorded queries, SSE etc.

🎉 **Chore**: BREAKING: Plugin now requires Grafana 10.4.8 or newer

## 3.0.0-beta.2

🚀 **New Feature**: Support for additional HTTP methods (`PATCH`, `PUT` and `DELETE`) via data source config `allowDangerousHTTPMethods`

🚀 **Improvements**: Set the backend parser as the default parser for new queries. Existing queries with frontend parser should work as before. If broken, setting the parser to `Frontend` may help.
⚙️ **Chore**: Update frontend and backend dependencies

## 3.0.0-beta.1

🚀 **New Feature**: Support for passing grafana meta data such as user id, datasource uid to the underlying API as headers / query params via datasource settings

🚀 **Improvements**: Added support for gzip compression for outgoing requests by default. Fixes [#1003](https://github.com/grafana/grafana-infinity-datasource/issues/1003)

🚀 **Improvements**: Added frame type to dataplane compliant numeric data frames. This will help us to handle the results correctly in alerts, recorded queries, SSE etc.

🎉 **Chore**: BREAKING: Plugin now requires Grafana 10.4.8 or newer

## 2.12.2

🐛 Build and publish pipelines uses latest go lang version `1.23.5` which includes security fixes to the `crypto/x509` and `net/http` packages ( CVE-2024-45341 and CVE-2024-45336 ). More details can be found [in the golang announcement post](https://groups.google.com/g/golang-announce/c/sSaUhLA-2SI)

🐛 **Bug fix**: Fixed error source for invalid queries

⚙️ **Chore**: Updated backend plugin SDK `github.com/grafana/grafana-plugin-sdk-go` from `0.261.0` to `0.263.0`

## 2.12.1

⚙️ **Chore**: Updated `cross-spawn` to `7.0.6`

## 2.12.0

🚀 **Improvement**: Injection trace into req.head (#1088)

⚙️ **Chore**: Updated `nanoid` from `3.3.7` to `3.3.8`

⚙️ **Chore**: Updated backend plugin SDK `github.com/grafana/grafana-plugin-sdk-go` from `0.259.0` to `0.261.0`

🐛 **Bug fix**: Fixed height of the text area

## 2.11.4

🐛 **Bug fix**: Fixed error source for invalid queries

🐛 **Bug fix**: Fixed a bug where base url not working as expected when there is no url in the query. Fixes [#908](https://github.com/grafana/grafana-infinity-datasource/issues/908)

⚙️ **Chore**: Migrate legacy forms component in global queries editor

## 2.11.3

🐛 **Bug fix**: Fixes the panic when preparing the request throws error

🐛 **Bug fix**: Fixed a bug where gitlab urls were normalized incorrectly

⚙️ **Chore**: Updated `jsonpath-plus` to `10.2.0`

## 2.11.2

⚙️ **Chore**: Updated backend plugin SDK `github.com/grafana/grafana-plugin-sdk-go` from `0.255.0` to `0.258.0`

⚙️ **Chore**: Updated frontend dependency `jsonpath-plus` from `10.0.1` to `10.1.0`

⚙️ **Chore**: Updated frontend indirect dependency `uplot` to `1.6.31`

## 2.11.1

🐛 **Bug fix**: Fix downstream errors for ErrExpressionNotFoundInFields and ErrInvalidFilterExpression

⚙️ **Chore**: Bump `github.com/grafana/grafana-plugin-sdk-go` from `0.248.0` to `0.255.0`

⚙️ **Chore**: Bump `jsonpath-plus` to `10.0.1`

## 2.11.0

🚀 **Improvement**: Remove base URL deprecation

🐛 **Bug fix**: Fix forward oauth for x-id-token header

## 2.10.0

🚀 **Improvement**: Remove deprecation for base URL and move it to URL, Headers & Params

🐛 **Bug fix**: Fix error source for identified downstream errors

⚙️ **Chore**: Bump `github.com/grafana/grafana-plugin-sdk-go` from `0.241.0` to `0.248.0`

⚙️ **Chore**: Bump `path-to-regexp` from `1.8.0` to `1.9.0`

## 2.9.6

🐛 **Bug fix**: Fix error source for invalid JSONata errors

⚙️ **Chore**: Bump `github.com/grafana/grafana-plugin-sdk-go` from `0.241.0` to `0.245.0`

⚙️ **Chore**: Update level of non-error log lines from error to debug

⚙️ **Chore**: Bump `webpack` from `5.86.0` to `5.94.0`

⚙️ **Chore**: Bump `webpack` from `5.86.0` to `5.94.0`

⚙️ **Chore**: Bump `micromatch` from `4.0.7` to `4.0.8`

## 2.9.5

⚙️ **Chore**: Rudderstack event firing updated

## 2.9.4

🐛 **Bug fix**: Fix query cancellation

⚙️ **Chore**: Add vscode debugger configuration

## 2.9.3

🐛 **Chore**: Updated error source capturing

## 2.9.2

🚀 **Chore**: Logging improvements

## 2.9.1

🚀 **Chore**: Upgrade grafana-plugin-sdk-go to `v0.240.0` from `v0.239.0`

## 2.9.0

🚀 **UQL**: Updated uql library to [0.0.23](https://github.com/yesoreyeram/uql/blob/main/CHANGELOG.md#0023)

🚀 **Chore** Replaced backend framer libraries from [yesoreyeram/grafana-plugins](https://github.com/yesoreyeram/grafana-plugins) to [grafana/infinity-libs](https://github.com/grafana/infinity-libs)

⚙️ **Chore**: Add error source to error responses

⚙️ **Chore**: Upgrade grafana-plugin-sdk-go to `v0.239.0` from `v0.231.0`

🐛 **Bug fix**: Fix showing of correct URL when using query history

## 2.8.0

⚙️ **Chore**: backend datasource.serve method migrated to datasource.manage method

🐛 **Bug fix**: Fixed a bug where filters not working in variables editor

## 2.7.1

🚀 **Time macros**: Added custom time macros `${__timeFrom}` and `${__timeTo}`. Read more about this [infinity plugin macros document](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/macros).

## 2.7.0

🚀 **URL parameters encoding**: Add support for encoding space characters in URLs with **%20** instead of **+**. (Experimental feature)

🚀 **Feature**: Alias support for the backend summarize option

🐛 **Variables Editor**: Fixed a bug where column selectors weren't working in variables editor

⚙️ **Chore**: Backend binaries are now compiled with golang 1.22.3

## 2.6.3

🐛 **Chore** update dependencies

## 2.6.2

🚀 **Security** New settings to block/allow/warn sensitive queries in the dashboard. Read more about this in [the docs](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/setup/configuration/).

## 2.6.1

🐛 **Chore** UQL dependency updated to `0.0.22` from `0.0.21`

📜 **Docs** [Docs website](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource) update with [play.grafana](https://play.grafana.org/d/infinity) links

## 2.6.0

⚙️ **Chore**: Upgrade grafana-plugin-sdk-go to v0.220.0

🚀 **Improvement**: Improved health check for azure blob storage connections

🚀 **Feature**: Support for variables in azure blob storage container and blob name

🐛 **Bug fixes**: Fixed a bug where AWS authentication doesn't work since 2.5.0-beta.1

## 2.5.0

🚀 **PDC**: Added support for [grafana private datasource connect (PDC)](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/)

🛡️ **Security** Backend binaries compiled with go 1.22.1 which includes [security patches](https://groups.google.com/g/golang-announce/c/5pwGVUPoMbg)

⚙️ **Dependencies update**: NodeJS dev dependency updated from Node 18 to Node 20

⚙️ **Dependencies update**: Updated backend dependencies and plugin SDK update

⚙️ **Chore**: Replaced gorilla mux library with http.ServeMux from standard library

⚙️ **Chore**: Removed unused graphql and open-api resource calls

## 2.5.0-beta.1

🚀 **Chore**: Updated health check messages to include details about custom health check settings

🚀 **Authentication**: Updated digest authentication backend SDK from [`github.com/xinsnake/go-http-digest-auth-client`](https://github.com/xinsnake/go-http-digest-auth-client) to [`github.com/icholy/digest`](https://github.com/icholy/digest)

🐛 **Analytics**: Updated rudderstack analytics events

🐛 **Bug fixes**: Fixed a bug where query columns editor is unusable when sandbox enabled

⚙️ **Chore**: Updated the grafana plugin SDK from v0.197.0 to v0.206.0

## 2.4.0

🚀 **Chore**: Minimum supported grafana version updated to 9.5.15

🚀 **Variables**:Added support for variables in the backend parser root selector

🐛 **Variables**: Better support for variable handling when variable queries have more than 1 column

🐛 **Bug fixes**: Fixed a bug where variable values were not passed with the nested variable queries

⚙️ **Chore**: Updated the grafana plugin SDK from v0.193.0 to v0.197.0

⚙️ **Chore**:Plugin build system migrated from `@grafana/toolkit` to `@grafana/create-plugin`

⚙️ **Chore**: NodeJS dev dependency updated from Node 16 to Node 18

## 2.3.1

⚙️ **Chore**: Updated the backend dependencies

⚙️ **Chore**: Signed the plugin with `Grafana Labs` signature instead `Community`

⚙️ **Chore**: Built and published via `drone ci` instead `github actions`

## 2.3.0

🎉 Infinity datasource plugin is now officially maintained by Grafana Labs. Read more about this in the [blog post](https://grafana.com/blog/2024/02/05/infinity-plugin-for-grafana-grafana-labs-will-now-maintain-the-versatile-data-source-plugin/)

## 2.2.1

⚙️ **Chore**: Added distributed tracing and contextual logging

🐛 **UI** Removed graphql variable editor styling

## 2.2.0

🚀 **Proxy**: Support for configuring per-datasource proxy url

🚀 **GraphQL**: Added Support for GraphQL Variables

🐛 **OAuth2**: Fixes OAuth2 configuration UI crash

## 2.1.0

🚀 **OAuth2**: Added ability to set auth style in client credentials

🚀 **Azure blob storage**: Support for reading content from Azure Blog Storage

🚀 **Logs**: Added support for visualizing data in `logs` format

🚀 **Trace**: Added support for visualizing data in `trace` format

🚀 **Macros**: Added support for macros in computed columns and filter expression when used with backend parser

🚀 **URL**: Support for gitlab blob to raw URL conversion added

🚀 **URL**: Support for bitbucket blob to raw URL conversion added

🚀 **Parser**: Added support for explicit boolean parsing in default and backend parsers

🚀 **Config Editor**: Preview / Sample request added to some authentication types

🛡️ **Security**: Backend binaries are compiled with golang 1.21.3 which also contains [security fixes](https://groups.google.com/g/golang-announce/c/2q13H6LEEx0) from previous versions

🐛 **UI**: Fixed a bug in query editor where buttons were rendered incorrectly

🐛 **OAuth2**: Applied a fix for the UI crash when editing OAuth2 section in the config editor

🐛 **URL normalization**: Fixed a bug where some github URLs were interpolated incorrectly. Fixes [#604](https://github.com/grafana/grafana-infinity-datasource/issues/604)

🐛 **Test**: Fixed a bug in tests

🐛 **Docs**: Removed `Cmd/Ctrl+F` key binding in the docs website in favour of native browser search

⚙️ **Chore**: Grafana plugin SDK `grafana/grafana-plugin-sdk-go` updated to `v0.174.0` from `v0.189.0`

⚙️ **Chore**: Updated backend packages

⚙️ **Test** More test data/examples added

## 2.0.0

🎉 **Pagination**: Added pagination support for json type queries ( backend parser ). Refer [this github discussion](https://github.com/grafana/grafana-infinity-datasource/discussions/601) for more details

🎉 **Transformation**: Added support for server side transformations via transformations query type. This version supports transformations such as `limit`, `filterExpression`, `computedColumn` and `summarize`. Refer [this github discussion](https://github.com/grafana/grafana-infinity-datasource/discussions/614) for more details

🚀 **Health Check**: Added support for custom health check

🚀 **Config editor**: Updated config editor UI

🐛 **Logging**: Updated backend logging for improved debugging experience

🐛 **docs**: updated docs about user agent header

🐛 **Logging**: Consuming `reportInteraction` from the `@grafana/runtime` library for reporting queries

⚙️ **Chore**: Added changeset to the build/publish pipeline

⚙️ **Chore**: update grafana backend plugin SDK from v0.159.0 to v0.162.0

⚙️ **Chore**: Backend binaries are now compiled with Go 1.20.4 which contains **security patches**

## [ 1.4.1 ]

- **UQL** Support for `pivot` function added in UQL
- **Chore** Backend binaries are now compiled with Go 1.20.3 which contains **security patches**
- **Chore** Updated frontend dependencies including security **security patches**

## [ 1.4.0 ]

- **Variables** Support for custom display values in variables ( using `__text` and `__value` as field names )
- **Backend parser** Added support for numeric datetime (ex: 20221227 can now be treated as valid datetime with YYYYMMDD format)
- **Global variables** Support for global time variables `${__from}` and `${__to}` in backend queries
- **Bug fix** Fixes [a bug](https://github.com/grafana/grafana-infinity-datasource/issues/509) where variables weren't interpolated with xml/html backend queries.
- **Bug fix** Fixed [a bug](https://github.com/grafana/grafana-infinity-datasource/issues/453) where BOM encoded response weren't parsed correctly
- **Auth** Health check validation updated
- **Docs** Docs site UI update

## [ 1.3.0 ]

- **Auth** Added support for **AWS authentication** using AWS Access and AWS Secret key
- **UQL** Support for new methods `atob`, `btoa` and `substring`
- **Chore** Backend binaries are now compiled with Go 1.19.5

## [ 1.2.0 ]

- **XML** Support for backend parser (alerts, recorded queries, public dashboards etc)
- **HTML** Support for backend parser (alerts, recorded queries, public dashboards etc)
- **Inline** Support for adding and querying reference data globally as alternative to inline data
- **Security** Backend binaries are now compiled with latest GoLang version 1.19.3 which fixes CVE-2022-41716
- **Backend Parser** Root data selector in the backend parser now supports JSONata
- **Chore** Grafana backend plugin SDK updated to latest
- **Chore** E2E tests updated

## [ 1.1.0 ]

- **Computed fields** Backend parser now supports computed fields (beta)
- **Filter** Backend parser now supports data filter (beta)
- **Summarize** Backend parser now supports summarize into numeric, string and binary fields (beta)
- **GraphQL** Support for backend parser (alerts, recorded queries, public dashboards etc)
- **GraphQL** Support for GROQ parser
- **CSV/TSV** Support for backend parser (alerts, recorded queries, public dashboards etc)
- **Auth** Support for Google JWT Token authentication (via guided auth providers)
- **Inline Data** Support for importing local files as inline data (experimental)
- **Google Sheets** Support for querying data from Google Sheets (beta)
- **UX** Reorganized quey fields. URL options such as headers, body, params moved to their own section
- **Help** Simplified inline help page
- **Demo** Removed demo instance due to pricing changes in heroku. (will figure out alternatives later)
- **Chore** Removed unused metrics resource handler

## [ 1.0.1 ]

- **Macros/Variables** Global variables in queries such as `${__user.name}`,`${__user.email}` and `${__user.login}` interpolated correctly in server side
- **Bug fix** Fixed a bug where editor crashes when using POST method in variable editor. Fixes [#413](https://github.com/grafana/grafana-infinity-datasource/issues/413)

## [ 1.0.0 ]

### **New Features & Bug Fixes**

- **New Query Type**: JSON Backend (with support for alerting)( **beta** )
- **New Auth Type**: Digest auth support
- **New Macro**: Support for macros (`$__combineValues()`,`$__customInterval()`) added in URL, Body, Inline data, UQL queries
- **New Variable Query Type**: Random String from given array of strings
- **URL**: More body types supported. (including `raw`, `form-data`, `x-www-form-urlencoded`)
- **UQL**: new root level command `where` added to support basic filters
- **UQL**: new method `extract` added to extract part of the string using regex
- **UQL**: new summarize methods `countif`, `sumif`, `minif` and `maxif`
- **UQL**: new methods `percentage`,`split`,`replace_string`,`reverse`,`pack`,`array_to_map` and `array_from_entries`
- **As-Is**: Support for URL when using As-Is format with JSON
- **UX**: Variables interpolated in queries when navigating from dashboard to explore page
- **Chore**: Updated cypress and improved E2E tests coverage
- **Chore**: prometheus `metrics` resource endpoint added ( _experimental_ )

### **BREAKING CHANGES**

#### **Authentication & Allowed host URLs**

If you are using any APIs/URLs that require authentication, You will now need to specify the list of allowed Host URLs in the config. This change is introduced to allow additional security to your endpoints.

To migrate your existing datasources, add allowed URLs/allowed Hosts in the datasource configuration section. Example: If you are using `https://foo.com/some/path?id=123` which require authentication, you will need to add `https://foo.com` in the allowed hosts list.

If your datasource is provisioned, then you have to add the following to your provisioning yaml file.

```yaml
jsonData:
  allowedHosts:
    - https://foo.com
```

If the allowed hosts are not configured correctly, you will get `Datasource is missing allowed hosts/URLs. Configure it in the datasource settings page.` error when performing the query.

Learn more about this breaking change in the [github discussion](https://github.com/grafana/grafana-infinity-datasource/discussions/322)

#### **Content-Type and Accept headers**

The default header values for `Content-Type` and `Accept` are changing. The default value for these headers are set as follows

- For `json` and `graphql` types, the `Accept` will be now set to `application/json;q=0.9,text/plain`
- For `csv` query type, the `Accept` header will now be set to `text/csv; charset=utf-8`
- For `xml` query type, the `Accept` header will now be set to `text/xml;q=0.9,text/plain`

- For http `post` methods, the `Content-Type` header value will be set to `Content-Type` for `json` and `graphql` query types

You can override these headers, in settings/query headers.

### **Minimum Grafana version update**

Minimum required grafana version for the infinity plugin is now Grafana v8.4.7. Though the older versions are expected to work, there may be some minor unexpected issues.

## [ 0.8.8 ]

- UQL: New command `jsonata` which helps to perform JSONata query over json, xml, csv APIs
- Chore: More logging added in backend for failure scenarios
- Chore: Provisioning helper added to the datasource config page which provides datasource yaml for provisioning

## [ 0.8.7 ]

- UQL: New command `distinct`
- UQL: New function `kv` which provide kv pair array from object. (useful when the results are key value format)
- UQL: New mathematical functions (`floor`/`ceil`/`round`/`sign`/`pow`/`sin`/`cos`/`tan`/`log`/`log2`/`log10`)
- Bug fix: Fixed a bug where error from the API causing segment violation error (#299)
- Bug fix: Fixed a bug where UQL editor throw error sometimes when using grafana versions higher than 8.3.4
- Bug fix: Fixed a bug where negative numbers in string were converted to positive numbers (#297)

## [ 0.8.6 ]

- UQL: Now support comments. Any new line starts with `#` will be treated as comment
- UQL: New command `mv-expand`
- UQL: New functions `parse_url`, `parse_urlquery`
- UQL: Fixed a bug where new line in UQL throws error when queries created from windows systems
- UQL: keyword suggestions for UQL Query editor

## [ 0.8.5 ]

- Auth: Fixed a bug where custom endpoint params were ignored when using OAuth2 client credentials
- Auth: Fixed a bug where TLS certs are not loaded correctly

## [ 0.8.4]

- Auth: Dedicated Auth types added for Api key authentication and bearer token authentication
- Security: Ability to configure allowed hosts for URL
- YAML: YAML query type support added via UQL. (experimental)

## [ 0.8.3 ]

- UQL: UQL update ( now support summarize by multiple fields, first, last summarizations )
- XML: Fixed a bug where numbers shown as null when using timeseries format. fix #254

## [ 0.8.2 ]

- XML: Fixed a bug where numbers shown as null when using timeseries format. fix #254

## [ 0.8.1 ]

- Auth: Forward OAuth identity support
- Auth: OAuth2 Client credentials authentication support - alpha
- Auth: OAuth2 JWT authentication support - alpha
- Chore: Query inspector now shows actual data in response meta data. (frame->schema->meta->custom)
- GROQ: GROQ Query support - alpha

## [ 0.8.0 ]

- TSV: custom query type for tsv files
- UQL: support for UQL queries
- Chore: secure query params passed to all requests by default
- NodeGraph: support for Node Graph panel
- Chore: basic E2E tests for config editor added
- Chore: typescript updates
- "as-is" data format added for debugging
- comma in the numbers are now ignored and considered as number
- variable editor, global query editor bug fixes. Previously, unable to add columns in variable editor
- fixes [#191](https://github.com/grafana/grafana-infinity-datasource/issues/191), [#146](https://github.com/grafana/grafana-infinity-datasource/issues/146), [#210](https://github.com/grafana/grafana-infinity-datasource/issues/210)

## [ 0.7.10 ]

- proxy support for outgoing requests

## [ 0.7.9 ]

- Ability to customize timeout

## [ 0.7.8 ]

- Bug fixes, docs update

## [ 0.7.7 ]

- Bug fixes and docs update
- DEPRECATED : URL field in the datasource config is now deprecated. Use URL in the Query Editor.
- DEPRECATED : Global queries are now deprecated in favour of Grafana's panel library

## [ 0.7.6 ]

- UnixTimeStamp variable added (alpha)
- Changed try url to [heroku](https://grafana-infinity-datasource.herokuapp.com/explore)

## [ 0.7.5 ]

- Fixed a bug where data not loading where no column names provided
- Support auto parse for more JSON types

## [ 0.7.4 ]

- Enabled support for annotations
- Results return correct frame name. Now returning RefId as frame name.
- Minimum required version of grafana is now 7.2.0
- Moved docs to gh-pages

## [ 0.7.3 ]

- Variable editor bug fixes
- Columnar format support

## [ 0.7.2 ]

- Github URLs normalized
- Auto find array data

## [ 0.7.1 ]

- Fix for [mixed datasource mode not working in 0.7](https://github.com/grafana/grafana-infinity-datasource/issues/78)

## [ 0.7.0 ]

- Data frame format added
- Custom secure query strings support added
- Support for custom headers and query strings in individual queries
- More CSV options - TSV, optional headers support, custom delimiters, etc
- Allow variables in root/rows selector
- Placeholder for migrating into backend plugin
- Migrated website from vuepress to gatsby
- Vercel deployment added for website

## [ 0.6.1 ]

- Plugin signed
- JSONPath support for JSON root selector
- Auto generate columns for CSV, JSON
- Support for Unix/epoch seconds format
- Support for filtering rows
- Variable Query support
- Logo updated
- Published to [grafana.com](https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/)

## [ 0.5.0 ]

- XML Support

## [ 0.4.0 ]

- Registered / Global Queries
- UNIX EPOCH / millisecond timestamp format
- Template variables support. Collection, CollectionLookup and Join variable
- Bug fixes

## [ 0.3.0 ]

- Authentication support
- Variables support in query url & data

## [ 0.2.0 ]

- GraphQL Support
- Mathematical expressions and Random Walk

## [ 0.1.0 ]

- Inline CSV / JSON support
- Stats / Timeseries format support

## [ 0.0.1 ]

- First working version
