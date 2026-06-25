---
slug: '/troubleshooting'
title: Troubleshoot Infinity data source issues
menuTitle: Troubleshooting
description: Troubleshoot common issues with the Grafana Infinity data source.
keywords:
  - infinity
  - troubleshooting
  - errors
  - debugging
labels:
  products:
    - oss
    - enterprise
    - cloud
review_date: 2026-06-25
weight: 700
---

# Troubleshoot Infinity data source issues

This guide helps you diagnose and resolve common issues with the Grafana Infinity data source. Issues are organized by category: connection errors, authentication errors, query and parsing errors, and performance issues.

## Connection errors

These errors occur when the data source cannot connect to the target URL.

### URL not allowed

**Error message:** "requested URL not allowed. To allow this URL, update the data source config in the Security tab, Allowed hosts section"

**Symptoms:** Queries fail with this error even when you believe the host is already in the **Allowed hosts** list. The error can also appear suddenly for a data source that previously worked.

**Cause:** Infinity validates the final request URL against the **Allowed hosts** list before sending it. The data source assembles and checks the URL in this order:

1. If a **Base URL** is set in the data source configuration, it's prefixed to the query URL.
1. The combined URL is checked against the **Allowed hosts** list.
1. The query runs only when the URL matches an allowed entry.

An entry matches only when it's a prefix of the final URL, including the scheme, and the host names match. Because the match includes the scheme and the full path prefix, small differences cause the URL to be rejected.

**Possible causes and solutions:**

| Cause | Solution |
|---|---|
| The allowed hosts entry is missing the `https://` or `http://` scheme | Add the scheme to each entry, for example `https://api.example.com` rather than `api.example.com`. An entry without a scheme doesn't match a request to `https://api.example.com` and can break a previously working data source. |
| A **Base URL** changes the final request URL | When a base URL is set, the allowed hosts entry must be a prefix of the combined base URL and query URL, not just the query URL. Verify the entry matches the full URL that Infinity sends, or remove the base URL if you don't need it. |
| A trailing slash or path narrows the match | An entry acts as a path prefix, so `https://api.example.com/v1` blocks a request to `https://api.example.com/v2`. Use the host root, for example `https://api.example.com`, unless you intend to restrict specific paths. |
| The health check passes but queries still fail | The custom health check URL and query URLs are validated independently. A passing health check doesn't confirm that a specific query URL is allowed. Confirm that the exact host of your query URL is in the **Allowed hosts** list. |

To add or correct an allowed host:

1. Open the data source configuration in Grafana.
1. Navigate to the **Network** section.
1. Add the full host, including the scheme, to the **Allowed hosts** field, for example `https://api.example.com`.
1. Click **Save & test**.

{{< admonition type="note" >}}
Allowed hosts are required when authentication, custom headers, TLS certificates, custom query parameters, or cookie forwarding are configured. If none of these features are in use and the allowed hosts field is empty, all hosts are allowed by default. Configuring a base URL also satisfies this requirement.
{{< /admonition >}}

### Connection timeout

**Error message:** "context deadline exceeded" or "timeout awaiting response headers"

**Cause:** The target server is taking too long to respond.

**Solution:**

1. Verify the target URL is accessible from the Grafana server (not just your browser).
1. Check if the API has rate limiting that might be blocking requests.
1. Reduce the amount of data requested by adding filters or limiting time ranges.
1. Contact your API provider to check for service issues.

### SSL/TLS certificate errors

**Error message:** "x509: certificate signed by unknown authority" or "certificate verify failed"

**Cause:** The target server's SSL certificate isn't trusted.

**Solution:**

1. If using a self-signed certificate, enable **Skip TLS Verify** in the data source configuration under **TLS / SSL Auth Details**.
1. For enterprise environments, add the CA certificate to **TLS/SSL Root Certificate** field.
1. Verify the certificate chain is complete on the target server.

{{< admonition type="caution" >}}
Disabling TLS verification reduces security. Only use this option for development or trusted internal services.
{{< /admonition >}}

### Empty response received

**Error message:** "empty response body received for the URL"

**Cause:** The server returned a successful status but with no content.

**Solution:**

1. Verify the URL returns data when accessed directly (using curl or a browser).
1. Check if authentication is required but not configured.
1. Ensure the API endpoint is correct and accepts the HTTP method you're using.
1. Check if the API requires specific headers that aren't being sent.

### HTTP method not allowed

**Error message:** "only GET and POST HTTP methods are allowed for this data source. To make use other methods, enable the 'Allow dangerous HTTP methods' in the data source configuration"

**Cause:** You're trying to use PUT, PATCH, or DELETE methods which are disabled by default.

**Solution:**

1. Open the data source configuration.
1. In the **Security** section, enable **Allow dangerous HTTP methods**.
1. Click **Save & test**.

{{< admonition type="caution" >}}
Only enable dangerous HTTP methods if your API requires them for data retrieval. These methods can modify data on the target server.
{{< /admonition >}}

## Grafana Cloud and network connectivity

These issues are specific to running the Infinity data source on Grafana Cloud or through a restricted network.

### API blocks requests from Grafana Cloud

**Symptoms:** Queries work from a local Grafana instance but fail from Grafana Cloud, often with timeouts or connection errors. Your API firewall shows blocked requests from unknown IP addresses.

**Cause:** On Grafana Cloud, the Infinity data source sends requests from Grafana Cloud source IP addresses, not from your browser or your own network. If your API restricts inbound traffic, those addresses must be on your allowed list.

**Solution:**

1. Add the Hosted Grafana source IP addresses to the allowed list on your API. The current addresses are published in several formats:
   - JSON: `https://grafana.com/api/hosted-grafana/source-ips`
   - Text: `https://grafana.com/api/hosted-grafana/source-ips.txt`
   - DNS: `src-ips.hosted-grafana.grafana.net`
1. For the full reference, refer to [List of source IP addresses to add to your allowlist](https://grafana.com/docs/grafana-cloud/reference/allow-list).
1. If your API is on a private network that you can't expose to the public internet, use private data source connect instead. Refer to the next entry.

### Private data source connect works locally but fails from Grafana Cloud

**Symptoms:** A data source that uses private data source connect (PDC) works from a local agent but fails from Grafana Cloud. Firewall logs show no traffic, or the PDC agent reports DNS resolution failures.

**Cause:** The PDC agent can't reach Grafana Cloud, or it can't resolve the target host's DNS name from within your private network.

**Solution:**

1. Confirm the PDC agent has outbound egress to the cluster-specific PDC endpoints. Refer to [Configure private data source connect (PDC)](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/configure-pdc/).
1. Verify the agent can resolve and reach the target host from its own network, for example with `nslookup` and `curl` run from the agent host.
1. In the data source, enter the internal hostname and port exactly as you would from inside your private network.
1. Confirm the data source is assigned to the correct PDC connection.
1. For how PDC works, refer to [Private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/).

### Private S3 bucket returns a 403 error

**Symptoms:** Requests to a private Amazon S3 bucket return a 403 error, even though the bucket name and credentials are correct.

**Cause:** Requests to S3 must be signed with AWS Signature Version 4 (SigV4). Without AWS authentication, Infinity doesn't sign the request, so S3 rejects it. The default AWS service is `monitoring` (Amazon CloudWatch), not `s3`.

**Solution:**

1. Expand the **Authentication** section and select **AWS**.
1. Set **Service** to `s3` and **Region** to the bucket's region.
1. Enter your **Access Key** and **Secret Key**, and confirm the IAM identity has read access to the bucket.
1. Add the S3 endpoint to **Allowed hosts**, for example `https://s3.<region>.amazonaws.com`.
1. For a complete AWS example, refer to [AWS API](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/examples/aws/).

## Authentication errors

These errors relate to authentication configuration issues.

### Invalid or empty credentials

**Error messages:**

- "invalid or empty password detected"
- "invalid API key specified"
- "invalid or empty bearer token detected"

**Cause:** Required authentication credentials are missing or incorrectly configured.

**Solution:**

1. Open the data source configuration.
1. Verify all required credential fields are filled in.
1. For API keys, ensure the key is entered in the correct field (header value or query parameter).
1. Click **Save & test** to verify the credentials work.

### Bearer token works in another client but fails in Infinity

**Symptoms:** A bearer token that succeeds in another client, such as Postman or curl, returns a 400 or 401 error in Infinity.

**Cause:** The token isn't sent in the format the API expects, or the request is missing headers that the other client adds automatically. Infinity sends the token as `Authorization: Bearer <token>` and doesn't replicate the default headers that other tools set.

**Solutions:**

1. If the API expects a prefix other than `Bearer`, such as `Token` or `ApiKey`, use **API key** authentication with the **Key** set to `Authorization` and the **Value** set to the full header value, for example `Token <token>`.
1. Compare the headers your other client sends with the headers Infinity sends, then add any missing headers in the query or data source configuration. Refer to [API returns a 406 error](#api-returns-a-406-error) for the default `Accept` header behavior.
1. Confirm the host is in the **Allowed hosts** list. Refer to [URL not allowed](#url-not-allowed).
1. Verify the token hasn't expired.

### API returns a 406 error

**Symptoms:** The API returns a 406 status, often only from Infinity and not from other clients. This is common with XML and SOAP endpoints.

**Cause:** Infinity sets a default `Accept` request header based on the query type:

| Query type | Default `Accept` header |
|---|---|
| JSON, GraphQL | `application/json;q=0.9,text/plain` |
| CSV | `text/csv; charset=utf-8` |
| XML | `text/xml;q=0.9,text/plain` |

Some servers reject these values and expect a specific media type, such as `application/xml`.

**Solution:**

1. In the query editor, expand the URL options and add a custom request header.
1. Set the **Accept** header to the media type your API expects, for example `application/xml`.
1. Run the query again. A custom `Accept` header overrides the default.

### OAuth2 token errors

**Error message:** "error getting OAuth2 token" or authentication failures after initial success

**Cause:** OAuth2 configuration is incorrect or tokens have expired.

**Solution:**

1. Verify the Token URL is correct and accessible.
1. Check that Client ID and Client Secret are correct.
1. Ensure the required scopes are specified.
1. For Azure, verify the `resource` endpoint parameter is set correctly.
1. Check if the OAuth2 provider requires additional endpoint parameters.

For custom token configurations, refer to [OAuth2 token customization](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/advanced-features/oauth2-custom-tokens/).

### OAuth2 client credentials fail with Microsoft Entra ID

**Symptoms:** OAuth2 client credentials authentication fails against Microsoft Entra ID (formerly Azure AD), often with a token error or a "URL not allowed" error.

**Cause:** The token URL, scopes, or allowed hosts are incorrect. With client credentials, Infinity makes two separate calls: one to the token endpoint and one to the data endpoint. Both hosts must be in the **Allowed hosts** list.

**Solution:**

1. Set the **Token URL** to your tenant endpoint, for example `https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/token`.
1. Set **Scopes** to the resource scope. For client credentials, this is typically `https://<resource>/.default`.
1. Add both hosts to **Allowed hosts**: the token endpoint host, for example `https://login.microsoftonline.com`, and the data endpoint host, for example `https://management.azure.com`.
1. If your token endpoint requires custom headers, add them as token request headers. Multiple token request headers are supported in version 3.8.0 and later. Refer to [OAuth2 token customization](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/advanced-features/oauth2-custom-tokens/).

For a complete Azure example, refer to [Azure API](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/examples/azure/).

### Forward OAuth fails for template variable queries

**Symptoms:** Panels authenticate correctly with **Forward OAuth identity**, but template variable queries that use the same data source fail with authentication errors.

**Cause:** Some plugin versions don't apply the forwarded OAuth identity to variable queries.

**Solution:**

1. Upgrade to the latest version of the Infinity data source plugin, which addresses known issues with forwarded OAuth identity in variable queries.
1. If the problem persists, report it on the [GitHub issues](https://github.com/grafana/grafana-infinity-datasource/issues) page with your Grafana and plugin versions, because a Grafana feature toggle might be required for your version.

### AWS authentication failures

**Error messages:**

- "invalid/empty AWS access key"
- "invalid/empty AWS secret key"

**Cause:** AWS credentials are missing or incorrect.

**Solution:**

1. Verify the Access Key ID and Secret Access Key are correct.
1. Ensure the IAM user has the required permissions for the AWS service you're querying.
1. Check that the AWS region is correctly specified.
1. Verify the service name matches the AWS service (for example, `monitoring` for CloudWatch).

### 401 or 403 errors

**Error message:** "unsuccessful HTTP response code" with status 401 or 403

**Cause:** Authentication failed or you don't have permission to access the resource.

**Solution:**

1. Verify your credentials are correct.
1. Check if the API key or token has expired.
1. Ensure the authenticated user has permission to access the requested resource.
1. For OAuth2, verify the scopes include the required permissions.

## Data source provisioning and naming

These issues relate to how the data source is provisioned and named.

### Can't save changes to a provisioned data source

**Symptoms:** You can open and test a provisioned Infinity data source, but **Save & test** doesn't persist changes, and the configuration reverts when you reload the page.

**Cause:** Data sources created through Grafana provisioning are managed by configuration files, so they're read-only in the UI. This is expected Grafana behavior, not an Infinity bug.

**Solution:**

1. Edit the data source's provisioning file instead of the UI.
1. Reload provisioning or restart Grafana to apply the changes.
1. To manage the data source from the UI instead, remove it from provisioning and recreate it manually.
1. For details, refer to [Provisioning Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/).

### Data source disappears shortly after creation

**Symptoms:** A data source is deleted automatically within minutes of creation, often after you name it something like `grafanacloud-infinity`.

**Cause:** On Grafana Cloud, names that begin with the `grafanacloud-` prefix are reserved for Grafana-managed data sources. An internal service removes user-created data sources that use a reserved name.

**Solution:**

1. Rename the data source to a name that doesn't start with `grafanacloud-`, for example `infinity` or `my-infinity`.
1. Recreate the data source with the new name.

## Query and parsing errors

These errors occur when processing the query or parsing the response.

### Invalid root selector

**Error message:** "error converting json data to frame" or "invalid root selector"

**Cause:** The root selector path doesn't match the API response structure.

**Solution:**

1. Use **Format as** > **As Is** to see the raw response structure.
1. Verify the root selector path matches your data. For example, if your JSON is:

   ```json
   { "data": { "items": [...] } }
   ```

   The root selector should be `data.items`.
1. For arrays at the root level, leave the root selector empty or use `$` for JSONata.
1. Use JSONata expressions for complex data extraction.

### JSON parsing errors

**Error message:** "unable to parse response body as JSON"

**Cause:** The response isn't valid JSON or isn't in the expected format.

**Solution:**

1. Verify the API returns JSON (check the Content-Type header).
1. If the API returns XML, CSV, or another format, select the correct **Type** in the query editor.
1. Check for API errors that might return HTML error pages instead of JSON.
1. Use **Format as** > **As Is** to inspect the raw response.

### CSV query returns no data

**Symptoms:** A CSV query silently returns no data, sometimes after a plugin upgrade, even though the file looks correct.

**Cause:** Trailing newlines or extra whitespace at the end of the CSV content can prevent the parser from reading rows. Recent plugin versions parse CSV more strictly.

**Solution:**

1. Remove trailing blank lines and whitespace from the end of the CSV content or file.
1. If you can't change the source, switch the parser to **Backend** and use a JQ or JSONata expression to select the rows.
1. Use **Format as** > **As Is** to inspect the raw response and confirm where the extra content appears.

### Raw output contains null before the data

**Symptoms:** The raw output shows `null` immediately followed by the response body, such as `null{...}`, and parsing fails.

**Cause:** The parser configuration doesn't match the response, so an empty result is concatenated with the response body.

**Solution:**

1. Confirm the query **Type** matches the response format (JSON, CSV, XML, and so on).
1. Set the correct parser for your transformation and provide a root selector that points to the data.
1. Use **Format as** > **As Is** to inspect the raw response before applying a parser.

### Time column not recognized or panel shows no data

**Symptoms:** A time series panel shows "No data" even though the query returns rows, or the time column isn't plotted.

**Cause:** Time data isn't being parsed correctly for time series visualization. When you don't define columns in the **Parsing options & Result fields** section, Grafana can't always auto-detect which column is the time field, so a time series panel has no time axis to plot.

**Solution:**

1. In the **Parsing options & Result fields** section, define the columns explicitly instead of relying on auto-detection.
1. Set the time column to the correct type: **Time**, **Time (UNIX ms)**, or **Time (UNIX s)**.
1. For custom time formats with the backend parser, specify the format in the column configuration.
1. Verify the time values are in a supported format (ISO 8601, Unix timestamp, or a recognized date string).
1. Refer to [Time formats](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/time-formats/) for supported formats.

### UQL syntax errors

**Cause:** The UQL query has syntax errors or uses invalid commands.

**Solution:**

1. Check that pipe characters (`|`) separate each command.
1. Verify column names are quoted: `"column_name"`.
1. Ensure string values use single quotes: `'value'`.
1. Start with a parse command: `parse-json`, `parse-csv`, or `parse-xml`.
1. Refer to [UQL parser](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/uql/) for syntax reference.

### Summarize returns an error for an empty result set

**Symptoms:** A JSONata `count()` or other `summarize` expression returns an error instead of `0` when the query matches no rows.

**Cause:** An aggregation over an empty result set has no input to operate on, so the expression fails instead of returning a default value.

**Solution:**

1. Add a filter or root selector that always returns an array, even when it's empty.
1. Provide a fallback in the expression so that an empty input returns `0`.
1. Confirm the root selector matches the response so the result set isn't unexpectedly empty.

### Parser options are limited in the query editor

**Symptoms:** The query editor doesn't offer the parser you need. For example, a backend parser isn't selectable for a given query.

**Cause:** The available parsers depend on the query type and context. Backend transformations require a backend parser.

**Solution:**

1. Select a query **Type** that supports the parser you need.
1. For transformations that must run on the backend, such as those used in alerting, recorded queries, or shared dashboards, select **Backend** parsing with JSONata or JQ.
1. Refer to [Query editor](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/) for parser options.

### Macro expansion errors

**Error messages:**

- "insufficient arguments to combineValues macro"
- "invalid customInterval macro"

**Cause:** Macro syntax is incorrect or missing required arguments.

**Solution:**

1. For `$__combineValues()`, ensure you have at least 4 arguments: prefix, suffix, separator, and at least one value.
1. For `$__customInterval()`, use valid duration syntax (for example, `1m`, `1h`, `1d`) and ensure the argument count is odd.
1. Refer to [Macros](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/macros/) for correct syntax.

### Reference data not found

**Error message:** "error getting reference data. Either empty or not defined"

**Cause:** The query references data that doesn't exist in the data source configuration.

**Solution:**

1. Open the data source configuration.
1. Navigate to **Reference data** section.
1. Add or verify the reference data with the name your query expects.
1. Click **Save & test**.

## Azure Blob Storage errors

These errors are specific to Azure Blob Storage queries.

### Invalid Azure Blob configuration

**Error messages:**

- "invalid/empty azure blob account name"
- "invalid/empty azure blob key"
- "invalid azure blob service client. check storage account name and key"

**Cause:** Azure Blob Storage credentials are missing or incorrect.

**Solution:**

1. Verify the storage account name and key in the data source configuration.
1. Ensure the storage account exists and is accessible.
1. Check that the account key hasn't been rotated.

### Azure Blob 403 error

**Error message:** "http 403. check azure blob storage key"

**Cause:** Access denied to the Azure Blob Storage.

**Solution:**

1. Verify the storage account key is correct.
1. Check if the storage account has IP restrictions that block the Grafana server.
1. Ensure the container and blob permissions allow read access.

## Performance issues

These issues relate to slow queries or resource usage.

### Slow query execution

**Cause:** Queries return too much data or the API is slow.

**Solution:**

1. Reduce the dashboard time range to limit data volume.
1. Add filters in your query to reduce the data returned.
1. Use aggregations in UQL (`summarize`) instead of returning raw rows.
1. Enable caching if your API data doesn't change frequently.
1. Consider using the backend parser for better performance with large datasets.

### Large response handling

**Cause:** The API returns very large responses that are slow to process.

**Solution:**

1. Request only the fields you need by configuring specific columns.
1. Use pagination if the API supports it.
1. Apply server-side filters if the API supports query parameters.
1. Use `limit` in UQL to reduce rows: `| limit 1000`.

## Alerting issues

These issues relate to using Infinity queries with Grafana Alerting.

### Alert rule shows "no data" or doesn't fire

**Cause:** The query uses a frontend parser that doesn't support alerting.

**Solution:**

1. Alerting only works with **backend parsers**: JSONata or JQ.
1. Change your parser from Default, UQL, or GROQ to **JSONata** or **JQ**.
1. Verify the query returns numeric data that can be evaluated against alert thresholds.
1. Test the query in Explore to ensure it returns data.

{{< admonition type="note" >}}
Frontend parsers (Default, UQL, GROQ) run in the browser and cannot be used for alerting, recorded queries, or public dashboards. Use JSONata or JQ for these features.
{{< /admonition >}}

### Query works in panels but fails in alerts

**Symptoms:** A query returns data in Explore and dashboard panels, but the alert rule reports "no data" or doesn't evaluate.

**Cause:** Alert evaluation needs a backend-parsed result with a recognized number field and, for time series, a correctly typed time field. A query that renders in a panel can still fail alert evaluation if the parser is frontend-only or the time column isn't typed correctly. An existing alert rule can also retain an older query model after you change the query.

**Solution:**

1. Use a backend parser. Refer to [Alert rule shows "no data" or doesn't fire](#alert-rule-shows-no-data-or-doesnt-fire).
1. Set the time column to an explicit time type and confirm the value format. Refer to [Time column not recognized or panel shows no data](#time-column-not-recognized-or-panel-shows-no-data).
1. Make sure the query returns at least one numeric field for the alert condition to evaluate.
1. Reduce the result to the rows and columns the alert needs, so the condition has a clear series to evaluate.
1. If the rule still fails after the query works in Explore, recreate the alert rule so it picks up the current query configuration.

### User macros not available in alerts

**Cause:** Alert queries run in a system context without user session information.

**Solution:**

User-related macros (`${__user.login}`, `${__user.email}`, `${__user.name}`) are not available in:

- Alert rules
- Recorded queries
- Public dashboards

If your query depends on user context, you'll need to:

1. Remove user macros from alert queries.
1. Use static values or other macros that don't require user context.
1. Consider using data source-level filters instead of user-based filters.

## Template variable errors

These issues relate to using Infinity queries as template variable sources and to using variables inside queries.

### Template variables return no data

**Cause:** Variable queries aren't configured correctly.

**Solution:**

1. Test the query in the Explore view first to verify it returns data.
1. Ensure the query returns columns that can be used as variable options.
1. For custom text/value pairs, return columns named `__text` and `__value`.
1. Check that the data source connection is working.

### Variable name collides with a GraphQL variable

**Symptoms:** A GraphQL query fails or behaves unexpectedly when a GraphQL variable name matches a dashboard variable name.

**Cause:** Grafana interpolates any `$name` token that matches a dashboard variable before the query runs. If your GraphQL query declares a variable with the same name, such as `$user`, Grafana replaces it instead of passing it to the GraphQL server.

**Solution:**

1. Rename the GraphQL variable to a name that doesn't match any dashboard variable, for example `$gqlUser` instead of `$user`.
1. Alternatively, rename the dashboard variable to avoid the collision.

### Multi-value variable passes only partial values

**Symptoms:** A downstream query receives only some of the values from a multi-value variable.

**Cause:** When a variable has **Multi-value** enabled but **Include All** disabled, only the currently selected values are passed. Hidden variables compound this because users can't adjust the selection.

**Solution:**

1. Enable **Include All** on the variable to pass the complete set of values when needed.
1. Confirm the downstream query formats the values correctly. Refer to [Template variables](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/variables/) for multi-value formatting options such as `${var:csv}` and `${var:pipe}`.

### Request fails with "URL too large" when many values are selected

**Symptoms:** When **All** or many values are selected in a multi-value variable, the query fails because the URL exceeds the length limit the API accepts.

**Cause:** Each selected value expands into the URL, so a high-cardinality variable can produce a URL that's too long for the server to accept.

**Solution:**

1. Reduce the number of values by adding a more selective parent variable or grouping values into categories.
1. Send the values in the request body with a POST request instead of the URL, if the API supports it.
1. Apply server-side filtering so fewer values are needed in the request.

### Dashboard freezes when a variable query returns a large payload

**Symptoms:** The dashboard becomes unresponsive when an Infinity query used as a variable source returns a large response, for example 100 KB or more.

**Cause:** Variable queries are processed in the browser, so a large payload can freeze the UI.

**Solution:**

1. Return only the fields needed for the variable, such as the `__text` and `__value` columns.
1. Use a backend parser with a root selector or filter to reduce the response size before it reaches the browser.
1. Add server-side filters or pagination to limit the number of rows returned.

### Forward OAuth not applied to variable queries

Panel queries authenticate but variable queries fail with authentication errors. Refer to [Forward OAuth fails for template variable queries](#forward-oauth-fails-for-template-variable-queries) in the authentication section.

## Other common issues

The following issues don't produce specific error messages but are commonly encountered.

### Annotations not appearing

**Cause:** Annotation query configuration issues.

**Solution:**

1. Verify the query returns the required columns: `time` (or `timeEnd`), `title`, and `text`.
1. Ensure the time column contains valid timestamps within the dashboard time range.
1. Use time filter macros (`${__timeFrom}`, `${__timeTo}`) to filter annotations by time range.
1. Refer to [Annotations](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/annotations/) for configuration details.

### Data appears incorrect or misaligned

**Cause:** Data type or formatting issues.

**Solution:**

1. Verify column types match your data (string, number, timestamp).
1. Check for null values that might affect calculations.
1. Use explicit column aliases to ensure consistent naming.
1. For numeric data stored as strings, use UQL's `tonumber()` or `toint()` functions.

### Requests originate from server, not browser

**Cause:** Unlike some frontend data sources, Infinity makes requests from the Grafana server.

**Solution:**

This is expected behavior. The Grafana server makes API requests on behalf of the user. This means:

1. The target API must be accessible from the Grafana server's network.
1. Firewall rules should allow outbound connections from the Grafana server.
1. API rate limits apply to the Grafana server's IP address.

## Get additional help

If you continue to experience issues after following this troubleshooting guide:

1. Check the [Grafana community forums](https://community.grafana.com/) for similar issues.
1. Review the [GitHub issues](https://github.com/grafana/grafana-infinity-datasource/issues) for known bugs.
1. Enable debug logging in Grafana to capture detailed error information.
1. Check Grafana server logs for additional error details.

When reporting issues, include:

- Grafana version
- Infinity plugin version
- Error messages (redact sensitive information)
- Steps to reproduce
- Sample query configuration (redact sensitive data)
- Sample API response structure (redact sensitive data)
