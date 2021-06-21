---
slug: "/wiki/template-variables"
title: "Template variables"
previous_page_title: "HTML"
previous_page_slug: "/wiki/html"
next_page_title: "Time Formats"
next_page_slug: "/wiki/time-formats"
---

## Standard variable mode ( Infinity Query )

Like panels, you can have your own CSV/JSON in your variable. Variable queries are expected to return one or more columns. This will give you the ability to get your variables set from CSV/JSON/XML or any other external sources.

![image](https://user-images.githubusercontent.com/153843/119243000-d6323f00-bb5a-11eb-822e-99f39b32968d.png)

> If two columns configured, first column value will be used as display text and second column will be used as value.(This will be useful when you want to have aliases for any non-user friendly IDs). If more than 2 columns returned, all the results will be flattened and returned as variable list.

## Collection - (Legacy variable)

List of key value pair wrapped with `Collection()`. Text/key followed by values separated by commas.

For example, the query  `Collection(Prod,pd,Non Prod,np,Development,dev,SIT,sit)` produce 4 variables

```ts
Collection(Prod,pd,Non Prod,np,Development,dev,SIT,sit)
```

| Display Value | Value |
|---------------|-------|
| Prod | pd |
| Non Prod | np |
| Development | dev |
| SIT | sit |

Under the hood following 4 keys have corresponding values

## CollectionLookup - (Legacy variable)

Return values based on another value similar to VLOOKUP in excel. For example, `CollectionLookup(pd,prod-server,np,nonprod-server,dev,dev-server,$Nested)` will return `nonprod-server` if value of `$Nested` equals `np` . Last value should be the key to lookup.

This will be useful when multiple variables need update based on single variable.

```ts
CollectionLookup(pd,prod-server,np,nonprod-server,dev,dev-server,$Nested)
```

![image](https://user-images.githubusercontent.com/153843/95761926-ec168200-0ca4-11eb-8758-ff5885564180.png#center)

![image](https://user-images.githubusercontent.com/153843/95762001-081a2380-0ca5-11eb-957a-34bfca767769.png#center)

![image](https://user-images.githubusercontent.com/153843/95762082-241dc500-0ca5-11eb-9d9f-b3f6d1440b76.png#center)

## Join - (Legacy variable)

Joins multiple strings / variables and return as a new variable

Example : `Join($Environment,-hello-,$ServerName)` will produce a new string variable from three separate strings.

## Random - (Legacy variable)

Example : `Random(A,B,C)` will produce one of A/B/C. When creating a variable of this type, set it to refresh "on time range change", so it will produce random element when dashboard refreshes.

More details available in [this github issue](https://github.com/yesoreyeram/grafana-infinity-datasource/issues/4).
