## CSV Features & Summary

<p align="center">
    <img src="https://user-images.githubusercontent.com/153843/92716030-316a2b80-f356-11ea-956f-71683cea3e33.png" width="700" height="500"></img>
</p>

Select **Type** of the query to `CSV`. You can either specify the URL of the CSV file or can provide inline CSV. Though your csv file have columns, specify them as columns manually and only that fields will be considered for display. Columns will appear in the same order you specify. Each column will have following properties

| Column | Description |
|--------|-------------|
| Title  | Title of the column when using the table format |
| Selector | Column name in CSV file. Case sensitive |
| Format | Format of the column |

## CSV URL

In the below example, we are going to convert the CSV URL `https://gist.githubusercontent.com/yesoreyeram/64a46b02f0bf87cb527d6270dd84ea47/raw/32ae9b1a4a0183dceb3596226b818c8f428193af/sample-with-quotes.csv` into a grafana datasource.

CSV data should have columns as its first line and comma delimited. You need to also specify the column names manually for display purposes. 

![image](https://user-images.githubusercontent.com/153843/92382040-d8a35480-f103-11ea-8ff8-48c7ca211062.png)

Ignore the root / rows as each line of CSV will be your rows. 

## CSV Inline

Instead of specifying URL, you can use hardcoded csv values. For example, you can specify the csv in the following format

```
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

### One string filed and one number field

![image](https://user-images.githubusercontent.com/153843/92711986-f3b6d400-f350-11ea-97f8-fae28f44e8ec.png)

### One time field, multiple string and number fields

![image](https://user-images.githubusercontent.com/153843/92713171-8dcb4c00-f352-11ea-9050-6757fbbe3158.png)
