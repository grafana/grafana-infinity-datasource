---
slug: '/wiki/json'
title: 'JSON'
previous_page_title: 'UQL'
previous_page_slug: '/uql'
next_page_title: 'CSV'
next_page_slug: '/wiki/csv'
---

![Sample JSON Query in Infinity datasource](https://user-images.githubusercontent.com/153843/108427049-7dd66300-7234-11eb-8d27-cec50945a66c.png#center)

Select **Type** of the query to `JSON`. You can either specify the URL of the JSON API, JSON file or can provide inline CSV.

## Using public JSON API endpoints

Below example shows about fetching data from a publicly accessible JSON URL/API endpoint.

URL : `https://jsonplaceholder.typicode.com/users`

![image](https://user-images.githubusercontent.com/153843/108413678-34314c80-7223-11eb-9cce-603134ec2d48.png#center)

In the above example, the data in the URL is array. So no need to configure any additional fields except url in the panel.

## Accessing nested properties of JSON data

URL : `https://thingspeak.com/channels/38629/feed.json`

![image](https://user-images.githubusercontent.com/153843/108415043-de5da400-7224-11eb-9295-d49fcc18464a.png#center)

In the above example, data is in the `feeds` property. So the same is specified as root / rows field. But still our plugin doesn't know anything about the fields or it's types. So we are going to add the columns to make it more meaningful.

We are adding columns and defining their types as shown below.

![image](https://user-images.githubusercontent.com/153843/108427049-7dd66300-7234-11eb-8d27-cec50945a66c.png#center)

## JSON Data without time field

URL : `https://gist.githubusercontent.com/yesoreyeram/2433ce69862f452b9d0460c947ee191f/raw/f8200a62b68a096792578efd5e3c72fdc5d99d98/population.json`

![image](https://user-images.githubusercontent.com/153843/108415716-cdf9f900-7225-11eb-8e0d-5d767104a080.png#center)

In the above example, we are visualizing a json data without time field. Our JSON has only two fields aka `country` and `population`. So we asked the plugin to add a dummy time field to the data so that we can visualize them in any of the grafana's stock panel. If you closely look at the image above, you can see we specified 'format' as **timeseries**.

For reference, JSON data from the URL is given below

```json
[
  { "country": "india", "population": 300 },
  { "country": "usa", "population": 200 },
  { "country": "uk", "population": 150 },
  { "country": "china", "population": 400 }
]
```

## JSON Inline

Instead of specifying URL, you can hardcoded JSON object. For example, you can specify the json as shown in the below example

```json
[
  { "country": "india", "population": 420 },
  { "country": "india", "population": 440 },
  { "country": "usa", "population": 200 },
  { "country": "uk", "population": 150 },
  { "country": "china", "population": 400 }
]
```

You need to also specify the column names manually for display purposes.

## JSONPath in root selector

In the root selector, you can use the selector in JSONPath format.

Note: Any root selector that starts with $ will be considered as JSONPath selector

![image](https://user-images.githubusercontent.com/153843/100856870-ddb63c80-3483-11eb-8e3c-791c161d3cc7.png#center)

Example:

```json
{
  "customers": [
    { "name": "mary", "age": 22, "gender": "female" },
    { "name": "joseph", "age": 41, "gender": "male" }
  ],
  "premium_customers": [{ "name": "john doe", "age": 21, "gender": "male" }]
}
```

In the above json, if `$.premium_customers` is the root selector then only "john doe" will return. If `$.*` is the root selector all the three rows will be returned.
