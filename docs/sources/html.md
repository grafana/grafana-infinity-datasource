---
slug: '/html'
title: 'HTML'
menuTitle: HTML
description: HTML
hero:
  title: Visualize HTML with Infinity
  level: 1
  width: 110
  image: https://www.svgrepo.com/show/373669/html.svg
  height: 110
  description: Visualize data from your HTML pages using infinity data source plugin
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
weight: 25
---

{{< docs/hero-simple key="hero" >}}

<hr style="margin-bottom:30px"/>

## 📊 Overview

<div style="margin-bottom:30px"></div>

{{< admonition type="caution" >}}
HTML query type should be used only for retrieving data from legacy systems where there are no alternative APIs exist. Instead of HTML query type, we strongly recommend to use other query types such as JSON, CSV, XML.
{{< /admonition >}}

In the following example, you are going to retrieve data from [a sample HTML page](https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.html).

In the Query editor, fill the following query details:

1. Select **HTML** as query type.
1. Select **Default** (frontend) as the parser.
1. Select **URL** as the source.
1. Select **GET** as the HTTP method.
1. Enter `https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.html` in the URL field of the query.

After the initial setup is done, you need to configure the selectors:

1. In the root selector, you need to provide the selector which will give you array of symmetrical elements. (This can potentially be rows in a table or repeating div elements with symmetrical structure). In our case, we are entering `table:nth-child(1) tbody tr` (CSS selector) as our root selector. Alternatively, you can give `tr` as selector if your HTML content has only one table. Also, if the table has any unique selectors such as ID, use that as the selector instead.
2. From our HTML structure, we know that each row contains several div elements with each div representing a property of the user, so we need to uniquely identify the div elements corresponding to the user property.
3. Add a column and enter `td:nth-child(1)` as selector field. Also mark this as `Name` in the **as/alias** field. We can leave this as a string
4. Add another column and enter `td:nth-child(2)` as selector field. Also mark this as `Age` in the **as/alias** field. We know that this is a number, so we can change the field type to number.
5. Add another column and enter `td:nth-child(3)` as selector field. Also mark this as `Country` in the **as/alias** field
6. Add any other columns you may need.

An example of the above query can be found in [play.grafana](https://play.grafana.org/explore?schemaVersion=1&panes=%7B%22s9j%22:%7B%22datasource%22:%22infinity-universal%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22datasource%22:%7B%22type%22:%22yesoreyeram-infinity-datasource%22,%22uid%22:%22infinity-universal%22%7D,%22type%22:%22html%22,%22source%22:%22url%22,%22format%22:%22table%22,%22url%22:%22https:%2F%2Fgithub.com%2Fgrafana%2Fgrafana-infinity-datasource%2Fblob%2Fmain%2Ftestdata%2Fusers.html%22,%22url_options%22:%7B%22method%22:%22GET%22,%22data%22:%22%22%7D,%22root_selector%22:%22table:nth-child%281%29%20tbody%20tr%22,%22columns%22:%5B%7B%22text%22:%22Name%22,%22selector%22:%22td:nth-child%281%29%22,%22type%22:%22string%22%7D,%7B%22text%22:%22Age%22,%22selector%22:%22td:nth-child%282%29%22,%22type%22:%22number%22%7D,%7B%22text%22:%22Country%22,%22selector%22:%22td:nth-child%283%29%22,%22type%22:%22string%22%7D,%7B%22text%22:%22Occupation%22,%22selector%22:%22td:nth-child%284%29%22,%22type%22:%22string%22%7D,%7B%22text%22:%22Salary%22,%22selector%22:%22td:nth-child%285%29%22,%22type%22:%22number%22%7D%5D,%22filters%22:%5B%5D,%22global_query_id%22:%22%22%7D%5D,%22range%22:%7B%22from%22:%22now-6h%22,%22to%22:%22now%22%7D%7D%7D&orgId=1) site for reference.

## Limitations

- Only symmetrical data can be queries. (Example: `table` with `colspan` or `rowspan` will break the scrapping)
- We only support text element querying. Retrieving other HTML attributes is not supported.
- If you prefer to use **backend** parser for HTML query type, be aware that the backend HTML query parser is experimental and subject to breaking changes. Also, only the HTML pages compatible to XML syntax can be used with HTML backend query type.
- If the scrapping is at high frequency/refresh rate, websites may block you or your IP address. Be sensible and responsible about setting your refresh limits.
- Caching is not implemented, so be aware of the rate limits. 
