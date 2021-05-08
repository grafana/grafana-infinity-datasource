---
slug: "/wiki/csv"
title: "CSV"
---

## CSV Features

<p align="center">
    <img src="https://user-images.githubusercontent.com/153843/92571108-9e0ff800-f27a-11ea-9fe9-9f9dcbd7125a.png" width="700" height="500"></img>
</p>

Select **Type** of the query to `CSV`. You can either specify the URL of the CSV file or can provide inline CSV. 

## Columns

Though your csv file have columns, specify them as columns manually and only that fields will be considered for display. Columns will appear in the same order you specify. Each column will have following properties

| Column | Description |
|--------|-------------|
| Title  | Title of the column when using the table format |
| Selector | Column name in CSV file. Case sensitive |
| Format | Format of the column |

If you don't specify any columns, then the infinity plugin will try to auto generate the columns and all the fields will be returned as string. (This auto generate columns feature only works with table format)

## CSV URL

In the below example, we are going to convert the CSV URL `https://gist.githubusercontent.com/yesoreyeram/64a46b02f0bf87cb527d6270dd84ea47/raw/32ae9b1a4a0183dceb3596226b818c8f428193af/sample-with-quotes.csv` into a grafana datasource.

CSV data should have columns as its first line and comma delimited. You need to also specify the column names manually for display purposes. 

![image](https://user-images.githubusercontent.com/153843/92382040-d8a35480-f103-11ea-8ff8-48c7ca211062.png)

Ignore the root / rows as each line of CSV will be your rows. 

## CSV Inline

Instead of specifying URL, you can use hardcoded csv values. For example, you can specify the csv in the following format

```csv
country,population,capital
india,200,mumbai
india,100,chennai
china,500,beijing
usa,200,washington
canada,100,ottawa
```

Below screenshot shows the example of csv inline datasource

![image](https://user-images.githubusercontent.com/153843/92571108-9e0ff800-f27a-11ea-9fe9-9f9dcbd7125a.png)

## CSV to timeseries

### One time field and one metric field

![image](https://user-images.githubusercontent.com/153843/92711761-b81c0a00-f350-11ea-9e57-30982f9322fe.png)

### One time field, one string field and one metric field

![image](https://user-images.githubusercontent.com/153843/92711827-c66a2600-f350-11ea-9941-4d8d03a5dc6c.png)

### One time field, one string field and multiple metric fields

![image](https://user-images.githubusercontent.com/153843/92711908-d84bc900-f350-11ea-94b8-7a02f98ff3ab.png)

### One time field and multiple metric fields

![image](https://user-images.githubusercontent.com/153843/92711942-e568b800-f350-11ea-8191-4e8f493f1ec1.png)

### One string field and one number field

![image](https://user-images.githubusercontent.com/153843/92711986-f3b6d400-f350-11ea-97f8-fae28f44e8ec.png)

### One time field, multiple string and number fields

![image](https://user-images.githubusercontent.com/153843/92713171-8dcb4c00-f352-11ea-9050-6757fbbe3158.png)

### All Number fields (Timestamp, UserId and Metric)

![image](https://user-images.githubusercontent.com/153843/92991051-bda45c00-f4d8-11ea-84dd-4ee1606e8125.png)

## Time formats

Rows for the timestamp fields should be one of the standard javascript date format as specified [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date).

![image](https://user-images.githubusercontent.com/153843/92720934-3d0d2080-f35d-11ea-93e3-c1ff46d4ea59.png)

For example, below is the valid csv with valid timestamps

```
year,population
2017,8
2017-02,9
2017-03,9.3
2017/04,9.4
2017/05/23,9.4
2017-06-25T12:10:00Z,10.1
"July 12, 2017 03:24:00",12
2017/08/23 10:30,9.4
2017/09/23 10:30:20,9.4
2017-10-23 10:30:20,9.4
Thu Nov 23 2017 10:30:20 GMT+0000 (Greenwich Mean Time),10.1
"Sat, 23 Dec 2017 10:30:20 GMT",12
01/29/2018,12.4
```

### UNIX EPOCH Time formats

If your data is in unix epoch time formats (unix milliseconds format), You can select **Timestamp ( UNIX ms )** / **timestamp_epoch** as as type. Below snippet shows some examples

```
Year,Population
1262304000000,200
1293840000000,201
```

In the above example, first row represents year 2010 and second row represents 2011.

Unix epoch time also supported. You can select **Timestamp ( UNIX s )** / **timestamp_epoch_s** as type if your api data is in seconds.
