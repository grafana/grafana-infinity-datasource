---
slug: '/html'
title: HTML
menuTitle: HTML
description: Extract data from HTML pages with the Infinity data source
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/html/
keywords:
  - infinity
  - HTML
  - web scraping
  - CSS selectors
labels:
  products:
    - oss
weight: 50
---

# HTML

Select **HTML** as the query type to extract data from HTML pages using CSS selectors.

{{< admonition type="caution" >}}
Use HTML queries only for retrieving data from legacy systems where no alternative APIs exist. Where possible, use JSON, CSV, or XML query types instead.
{{< /admonition >}}

## Configure an HTML query

To extract data from an HTML page:

1. Select **HTML** as the query type.
1. Select **URL** as the source.
1. Enter the page URL.
1. Set the HTTP method (typically **GET**).
1. Configure the root selector and column selectors.

## Selector syntax

HTML queries use CSS selectors to identify elements.

### Root selector

The root selector identifies the repeating elements that represent your data rows. Common patterns:

| Selector | Use case |
|----------|----------|
| `table tbody tr` | Table rows |
| `table:nth-child(1) tbody tr` | Rows from the first table |
| `#myTable tr` | Rows from a table with a specific ID |
| `.data-row` | Elements with a specific class |

### Column selectors

Column selectors identify individual fields within each row:

| Selector | Description |
|----------|-------------|
| `td:nth-child(1)` | First column in a table row |
| `td:nth-child(2)` | Second column in a table row |
| `.field-name` | Element with a specific class |

## Example: Extract data from an HTML table

The following example extracts user data from a sample HTML page.

**URL**: `https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.html`

**Root selector**: `table:nth-child(1) tbody tr`

**Columns configuration**:

| Selector | Title | Type |
|----------|-------|------|
| `td:nth-child(1)` | Name | String |
| `td:nth-child(2)` | Age | Number |
| `td:nth-child(3)` | Country | String |
| `td:nth-child(4)` | Occupation | String |
| `td:nth-child(5)` | Salary | Number |

Try this example in [Grafana Play](https://play.grafana.org/explore?schemaVersion=1&panes=%7B%22s9j%22:%7B%22datasource%22:%22infinity-universal%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22datasource%22:%7B%22type%22:%22yesoreyeram-infinity-datasource%22,%22uid%22:%22infinity-universal%22%7D,%22type%22:%22html%22,%22source%22:%22url%22,%22format%22:%22table%22,%22url%22:%22https:%2F%2Fgithub.com%2Fgrafana%2Fgrafana-infinity-datasource%2Fblob%2Fmain%2Ftestdata%2Fusers.html%22,%22url_options%22:%7B%22method%22:%22GET%22,%22data%22:%22%22%7D,%22root_selector%22:%22table:nth-child%281%29%20tbody%20tr%22,%22columns%22:%5B%7B%22text%22:%22Name%22,%22selector%22:%22td:nth-child%281%29%22,%22type%22:%22string%22%7D,%7B%22text%22:%22Age%22,%22selector%22:%22td:nth-child%282%29%22,%22type%22:%22number%22%7D,%7B%22text%22:%22Country%22,%22selector%22:%22td:nth-child%283%29%22,%22type%22:%22string%22%7D,%7B%22text%22:%22Occupation%22,%22selector%22:%22td:nth-child%284%29%22,%22type%22:%22string%22%7D,%7B%22text%22:%22Salary%22,%22selector%22:%22td:nth-child%285%29%22,%22type%22:%22number%22%7D%5D,%22filters%22:%5B%5D,%22global_query_id%22:%22%22%7D%5D,%22range%22:%7B%22from%22:%22now-6h%22,%22to%22:%22now%22%7D%7D%7D&orgId=1).

## Limitations

Be aware of the following limitations when using HTML queries:

- **Symmetrical data only**: Tables with `colspan` or `rowspan` attributes are not supported.
- **Text content only**: Retrieving HTML attributes is not supported.
- **Backend parser limitations**: The backend HTML parser is experimental and only works with XHTML-compatible pages.
- **Rate limiting**: Websites may block frequent requests. Set appropriate refresh intervals.
- **No caching**: Each refresh fetches fresh data, so be mindful of rate limits.
