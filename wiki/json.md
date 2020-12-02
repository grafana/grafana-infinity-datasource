## JSON URL

In the below example, we are going to convert the JSON URL `https://jsonplaceholder.typicode.com/todos` into a grafana datasource.

![image](https://user-images.githubusercontent.com/153843/92381992-bf020d00-f103-11ea-936d-94f903faa5e6.png)

The URL returns an array of objects. Each item in the array goes as a table row. Property of each object goes into column of the table. By default, the datasource will not consider any columns for display. You have to manually specify the column names and corresponding properties in the JSON object.

**Note:** As the URL returns an array of objects, root selector / row have to be blank. If the root of the document is an object and you want to select specific property of the object, you can specify the selector of the object as a root selector / row. Example given [here](https://github.com/yesoreyeram/grafana-infinity-datasource/issues/1#issue-694996991).

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

![image](https://user-images.githubusercontent.com/153843/100856870-ddb63c80-3483-11eb-8e3c-791c161d3cc7.png)

Example:

```json
{
  "customers": [
        { "name": "mary",    "age": 22,  "gender": "female" },
        { "name": "joseph",  "age": 41,  "gender": "male" }
  ],
  "premium_customers": [
       {  "name": "john doe", "age": 21, "gender": "male" }
  ]
}

```

In the above json, if `$.premium_customers` is the root selector then only "john doe" will return. If `$.*` is the root selector all the three rows will be returned.
