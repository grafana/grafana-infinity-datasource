---
slug: '/filters'
title: 'Filtering data'
menuTitle: Filtering data
description: Filtering data
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
weight: 360
---

<!-- markdownlint-disable MD033 -->

# Filtering data / Using template variables in Query

In order to filter the data in Infinity datasource, you can use the following options based on the parser you are using.

{{< admonition type="note" >}}
All filtering happens after retrieving the content.
For better performance, use filtering provided by the API.
{{< /admonition >}}

## Filtering with Backend Parser

When using the backend parser, use the following examples for filtering your data. In most cases, you will be filtering data based on single value or multiple value variable.

### Variable setup - single

<img width="1522" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/56b1ccb3-e351-4f2e-9d1a-008a1005a551" />
<img width="988" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/a09256a8-2b68-4334-ad8d-efc4164947f6" />

### Variable setup - multi

<img width="1653" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/735d0d6a-82fc-412e-988c-109ec0cd20eb" />
<img width="947" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/df4f570b-e4c6-4075-a6e7-d5d814af390b" />

### Without filter

<img width="433" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/f000a467-40c2-4149-9a08-7a6a42fd39df" />
<img width="456" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/4f3e1e6e-b9fb-4aea-bc84-f48ea6d70ac0" />
<img width="1315" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/171080c0-de0e-4c69-8b25-b572877726e3" />

### With single filter

We are using the filter `region == "${region}"`

<img width="1332" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/08828e44-77f3-41fb-beca-6136805d8860" />

### With multi filter

We are using the filter `region IN (${region_multi:singlequote})` to show multiple regions

<img width="1327" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/4fdbbd6d-8514-4730-96f3-998ee20f2182" />

### With multi filter (NOT IN)

We are using the filter `!(region IN (${region_multi:singlequote})` to exclude multiple regions. As you see we use <kbd>!</kbd> symbol before our condition

<img width="1322" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/1438b99c-478a-459e-a6a2-513d5285326c"/>

## Filtering with UQL Parser

When using the backend parser, use the following examples for filtering your data. In most cases you will be filtering data based on single value or multiple value variable.

### UQL - Without filter

```uql
parse-json
| summarize count("name") by "region"
```

### UQL - With single filter

```uql
parse-json
| where "region" == '$region'
| summarize count("name") by "region"
```

### UQL - With single filter (JSONata)

```uql
parse-json
| jsonata "$[region='${region}']"
| summarize count("name") by "region"
```

### UQL - With multi filter

```uql
parse-json
| where "region" in (${region_multi:singlequote})
| summarize count("name") by "region"
```

### UQL - Multi filter (JSONata)

```uql
parse-json
| jsonata "$[region in [${region_multi:singlequote}]]"
| summarize count("name") by "region"
```

### UQL - Multi filter (NOT IN)

```uql
parse-json
| where "region" !in (${region_multi:singlequote})
| summarize count("name") by "region"
```

### UQL - Multi filter (NOT IN) (JSONata)

```uql
parse-json
| jsonata "$[$not(region in [${region_multi:singlequote}])]"
| summarize count("name") by "region"
```
