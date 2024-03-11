---
slug: '/legacy-variables'
title: 'Legacy variables'
menuTitle: Legacy variables
description: Legacy variables
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
weight: 411
---

# Legacy Variables

Legacy/Utility variables are type of variables that used to create variables using different utility methods such as joining two strings. More examples and different types of Utility variables are given below

## Collection

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

## CollectionLookup

Return values based on another value similar to VLOOKUP in excel. For example, `CollectionLookup(pd,prod-server,np,nonprod-server,dev,dev-server,$Nested)` will return `nonprod-server` if value of `$Nested` equals `np` . Last value should be the key to lookup.

This will be useful when multiple variables need update based on single variable.

```ts
CollectionLookup(pd, prod - server, np, nonprod - server, dev, dev - server, $Nested);
```

![image](https://user-images.githubusercontent.com/153843/95761926-ec168200-0ca4-11eb-8758-ff5885564180.png#center)

![image](https://user-images.githubusercontent.com/153843/95762001-081a2380-0ca5-11eb-957a-34bfca767769.png#center)

![image](https://user-images.githubusercontent.com/153843/95762082-241dc500-0ca5-11eb-9d9f-b3f6d1440b76.png#center)

## Join

Joins multiple strings / variables and return as a new variable

Example : `Join($Environment,-hello-,$ServerName)` will produce a new string variable from three separate strings.

## Random

Example : `Random(A,B,C)` will produce one of A/B/C. When creating a variable of this type, set it to refresh "on time range change", so it will produce random element when dashboard refreshes.

More details available in [this github issue](https://github.com/grafana/grafana-infinity-datasource/issues/4).

## UnixTimeStamp (alpha)

Return relative timestamp in unix timestamp.

| Variable           | Output                          |
| ------------------ | ------------------------------- |
| `UnixTimeStamp()`  | Current browser timestamp in ms |
| `UnixTimeStamp(s)` | Current browser timestamp in s  |
