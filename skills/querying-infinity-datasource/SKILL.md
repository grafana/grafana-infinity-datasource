---
name: querying-infinity-datasource
description: Build queries with the Infinity data source — the query types (JSON, CSV, TSV, XML, GraphQL, HTML, UQL, GROQ, Google Sheets, Series, Transformations), the parsers (Frontend/simple, Backend JSONata, JQ, UQL, GROQ) and which support alerting, the sources (URL, Inline, Reference, Azure Blob, Random walk), output formats (table, timeseries, logs, trace, node graph, dataframe), root selector and columns, computed columns/filters/summarize, pagination, and template variables. Use when a user asks how to query Infinity; how to fetch JSON/CSV/XML/GraphQL/HTML from a URL or inline; how to select rows and columns; how to transform data with UQL/GROQ/JSONata/JQ; how to make a query work with alerting; how to paginate; or how to use variables in a query.
---

# Querying the Infinity data source

The Infinity data source retrieves data from HTTP endpoints (and other sources) and
turns it into Grafana data frames. Every query is defined by four core choices in the
query editor: a **Type** (the data format), a **Parser** (how the data is processed), a
**Source** (where the data comes from), and a **Format** (the output shape).

## The four core choices

| Choice      | Options                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| **Type**    | JSON, CSV, TSV, XML, GraphQL, HTML, UQL, GROQ, Google Sheets, Series (mock), Transformations.        |
| **Parser**  | Frontend (simple), Backend (JSONata), Backend (JQ), UQL, GROQ — availability depends on the type.    |
| **Source**  | URL, Inline, Reference, Azure Blob, Random walk (for Series).                                        |
| **Format**  | Table, Time series, Logs, Trace, Node graph (nodes/edges), Data frame, As-is.                        |

## Query types

| Type               | Use it to…                                                                       |
| ------------------ | -------------------------------------------------------------------------------- |
| **JSON**           | Query JSON APIs (the most common type).                                          |
| **CSV / TSV**      | Query comma/tab-separated data, with options for delimiter, headers, comments.   |
| **XML**            | Query XML responses.                                                             |
| **GraphQL**        | Send a GraphQL query and parse the JSON response.                                |
| **HTML**           | Scrape data from HTML pages.                                                      |
| **UQL**            | Transform any response with Unstructured Query Language.                          |
| **GROQ**           | Transform any response with GROQ.                                                 |
| **Google Sheets**  | Read a spreadsheet by ID, sheet name, and range.                                 |
| **Series**         | Generate mock series (random walk or expression) without a backend API.          |
| **Transformations**| Apply limit, filter, computed column, and summarize steps to other query results.|

## Parsers (and alerting)

The **Parser** controls where and how the response is processed. This determines
**alerting** support, because alerting evaluates queries on the backend.

| Parser                 | Runs in  | Alerting | Best for                                      |
| ---------------------- | -------- | -------- | --------------------------------------------- |
| **Backend (JSONata)**  | Backend  | Yes      | Complex transformations; alerting (default).  |
| **Backend (JQ)**       | Backend  | Yes      | JQ-style expressions; alerting.               |
| **UQL**                | Frontend | No       | SQL-like queries, pivoting, reshaping.        |
| **GROQ**               | Frontend | No       | GROQ expressions.                             |
| **Frontend (simple)**  | Frontend | No       | Simple selector + column mapping.             |

**To use a query in alerts, recording rules, or expressions, choose a backend parser
(JSONata or JQ).** Frontend, UQL, and GROQ parsers run in the browser and aren't
available to alerting.

## Sources

Pick where the data comes from:

- **URL** — Fetch from an HTTP endpoint. Set the **Method** (`GET` or `POST`; `PUT`,
  `PATCH`, and `DELETE` require **Allow dangerous HTTP methods** in the data source
  config). Configure **Headers**, **Request params**, and (for POST) a request **Body**
  (none, form-data, x-www-form-urlencoded, raw, or GraphQL).
- **Inline** — Paste the data directly into the editor (useful for testing or static
  data).
- **Reference** — Use a named dataset defined in the data source's reference data.
- **Azure Blob** — Read a blob by container and blob name (requires Azure Blob auth in
  the data source config).
- **Random walk** — For the **Series** type only; generates mock data.

### Use variables and macros in URLs

URLs support Grafana template variables and time macros, for example:

```
https://api.example.com/data?from=${__timeFrom}&to=${__timeTo}
```

See [URL configuration](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/advanced-features/url/)
and [macros](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/macros/).

## Output format

Set **Format** to match your panel:

- **Table** — Tabular data (default for most queries).
- **Time series** — Data with a time field for time-series panels.
- **Logs** — Log lines for the Logs panel / Explore.
- **Trace** — Trace data.
- **Node graph (nodes / edges)** — Two queries that together build a node graph.
- **Data frame** — Pass-through data frame.
- **As-is** — Return the response with minimal processing.

## Selecting rows and columns

For JSON/CSV/XML/GraphQL/HTML, the **Parsing options & Result fields** section extracts
the data:

- **Rows / Root** (root selector) — A selector that returns the array of elements to
  turn into rows. For JSON this is a path into the response; leave it empty when the
  root is already an array.
- **Columns** — Click **Add Columns** to define each output field:
  - **Selector** — Path to the field within each row.
  - **Title** — Display name for the column.
  - **Type** — String, Number, Time, Time (UNIX ms), Time (UNIX s), or Boolean. Use a
    time type for the field your time-series panel should use as time.

CSV/TSV add options such as **delimiter**, skip empty lines, skip lines with errors,
relax column count, header columns, and comment character.

## Computed columns, filters, and summarize (backend parsers)

When using a **backend** parser (JSONata or JQ), the **Computed columns, Filter, Group
by** section adds transformations:

| Feature              | Description                                              | Example          |
| -------------------- | -------------------------------------------------------- | ---------------- |
| **Computed Columns** | Create a new field from an expression.                   | `price * qty`    |
| **Filter**           | Keep rows matching an expression.                        | `age >= 18`      |
| **Summarize**        | Aggregate with functions like `sum()`, `count()`, `mean()`. | `sum(amount)` |
| **Summarize By**     | Group the aggregation by a field.                        | `country`        |
| **Summarize Alias**  | Name for the summarized result column.                   | `total`          |

See [JSONata backend parser](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/backend/)
and [JQ backend parser](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/jq-backend/).

## Filters

Beyond backend expressions, you can add field-level **filters** that keep rows where a
field matches an operator and value. See
[Filters](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/filters/).

## Pagination

For paged APIs (backend parsers), configure **pagination** so Infinity fetches multiple
pages automatically. Supported modes:

- **None** — Single request (default).
- **Offset** — Increment an offset parameter.
- **Page** — Increment a page-number parameter.
- **Cursor** — Follow a cursor value extracted from each response.
- **List** — Iterate a fixed list of values.

Each mode lets you set the parameter names, where they're sent (query, header, body, or
URL replace), and a **max pages** limit.

## UQL and GROQ

For advanced reshaping, set the **Type** (or parser) to **UQL** or **GROQ** and write an
expression that transforms the response:

- **UQL** — SQL-like commands for parsing, projecting, pivoting, and summarizing. See
  [UQL](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/uql/).
- **GROQ** — GROQ query expressions. See
  [GROQ](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/groq/).

## Template variables

Infinity queries support Grafana template variables and time macros (for example
`${__timeFrom}`, `${__timeTo}`, and dashboard variables like `$region`) in URLs,
headers, params, bodies, and selectors. You can also create Infinity-based **variables**
that query an API for dropdown values. See
[Template variables](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/variables/template-variables/).

## Tips and troubleshooting

- **My alert can't use this query**: Switch the **Parser** to a backend parser (JSONata
  or JQ). UQL, GROQ, and Frontend parsers run in the browser and aren't available to
  alerting.
- **Query is blocked / "host not allowed"**: When the data source uses auth, custom
  headers, or TLS, add the target host to **Allowed hosts** in the data source config.
- **No rows returned**: Check the **Rows / Root** selector — it must point to the array
  of elements. Leave it empty if the root response is already an array.
- **Wrong time axis**: Set the time field's column **Type** to a time type (Time, Time
  (UNIX ms), or Time (UNIX s)) and set **Format** to **Time series**.
- **`PUT` / `PATCH` / `DELETE` missing**: Enable **Allow dangerous HTTP methods** in the
  data source configuration.
- **Only some pages of data appear**: Configure **pagination** (backend parsers) and
  raise the **max pages** limit if needed.

## References

- [Query editor](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/)
- [Data formats (JSON, CSV, XML, GraphQL, HTML, Azure Blob)](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/data-formats/)
- [Backend (JSONata) parser](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/backend/)
- [UQL](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/uql/) ·
  [GROQ](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/groq/)

## See also

- `configuring-infinity-datasource` — set up the data source, authentication, allowed
  hosts, TLS, network settings, the health check, and provisioning.
