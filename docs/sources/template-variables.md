---
slug: '/template-variables'
title: 'Template variables'
menuTitle: Template variables
description: Template variables
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
    - enterprise
    - grafana cloud
weight: 601
---

# Template variables

You can create template variables using Infinity data source query with one the following options

* Standard variable mode / Infinity Query
* Legacy variable mode

## Standard variable mode ( Infinity Query )

Like panels, you can have your own CSV/JSON in your variable. Variable queries are expected to return one or more columns. This will give you the ability to get your variables set from CSV/JSON/XML or any other external sources.

![image](https://user-images.githubusercontent.com/153843/119243000-d6323f00-bb5a-11eb-822e-99f39b32968d.png#center)

> **Note**: If you want to have variables with different text than its value, then rename the columns to `__text` and `__value` respectively.
<!-- markdownlint-disable MD028 -->

> **Note**: It is always recommended to rename your columns to `__text`/`__value` when having more than 1 column in your variable query. Any other columns except `__text`/`__value` will be ignored when there are more than 1 column. This is useful in scenarios where backend queries require more columns to perform operations such as filtering but want to select only one column for variable.

## Legacy Variables

You can also create legacy variable using following formats

### Collection

List of key value pair wrapped with `Collection()`. Text/key followed by values separated by commas.

For example, the query `Collection(Prod,pd,Non Prod,np,Development,dev,SIT,sit)` produce 4 variables

```ts
Collection(Prod,pd,Non Prod,np,Development,dev,SIT,sit)
```

| Display Value | Value |
| ------------- | ----- |
| Prod          | pd    |
| Non Prod      | np    |
| Development   | dev   |
| SIT           | sit   |

Under the hood following 4 keys have corresponding values

### CollectionLookup

Return values based on another value similar to VLOOKUP in excel. For example, `CollectionLookup(pd,prod-server,np,nonprod-server,dev,dev-server,$Nested)` will return `nonprod-server` if value of `$Nested` equals `np` . Last value should be the key to lookup.

This will be useful when multiple variables need update based on single variable.

```ts
CollectionLookup(pd, prod - server, np, nonprod - server, dev, dev - server, $Nested);
```

![image](https://user-images.githubusercontent.com/153843/95761926-ec168200-0ca4-11eb-8758-ff5885564180.png#center)

![image](https://user-images.githubusercontent.com/153843/95762001-081a2380-0ca5-11eb-957a-34bfca767769.png#center)

![image](https://user-images.githubusercontent.com/153843/95762082-241dc500-0ca5-11eb-9d9f-b3f6d1440b76.png#center)

### Join

Joins multiple strings / variables and return as a new variable

Example : `Join($Environment,-hello-,$ServerName)` will produce a new string variable from three separate strings.

### Random

Example : `Random(A,B,C)` will produce one of A/B/C. When creating a variable of this type, set it to refresh "on time range change", so it will produce random element when dashboard refreshes.

More details available in [this github issue](https://github.com/grafana/grafana-infinity-datasource/issues/4).

### UnixTimeStamp (alpha)

Return relative timestamp in unix timestamp.

| Variable           | Output                          |
| ------------------ | ------------------------------- |
| `UnixTimeStamp()`  | Current browser timestamp in ms |
| `UnixTimeStamp(s)` | Current browser timestamp in s  |
