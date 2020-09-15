---
id: json
title: JSON Datasource
sidebar_label: JSON Datasource
slug: /json
---

## JSON URL

In the below example, we are going to convert the JSON URL `https://jsonplaceholder.typicode.com/todos` into a grafana datasource.

![image](https://user-images.githubusercontent.com/153843/92381992-bf020d00-f103-11ea-936d-94f903faa5e6.png)

The URL returns an array of objects. Each item in the array goes as a table row. Property of each object goes into column of the table. By default, the datasource will not consider any columns for display. You have to manually specify the column names and corresponding properties in the JSON object.

**Note:** As the URL returns an array of objects, root selector / row have to be blank. If the root of the document is an object and you want to select specific property of the object, you can specify the selector of the object as a root selector / row. Example given [here](https://github.com/yesoreyeram/grafana-infinity-datasource/issues/1#issue-694996991).

## JSON Inline

Instead of specifying URL, you can hardcoded JSON object. For example, you can specify the json as shown in the below example

```
[
  { "country": "india", "population": 420 },
  { "country": "india", "population": 440 },
  { "country": "usa", "population": 200 },
  { "country": "uk", "population": 150 },
  { "country": "china", "population": 400 }
]
```

You need to also specify the column names manually for display purposes. 
