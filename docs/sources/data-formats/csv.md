---
slug: '/csv'
title: CSV
menuTitle: CSV
description: Query CSV files and endpoints with the Infinity data source
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/csv/
keywords:
  - infinity
  - CSV
  - TSV
  - delimited data
labels:
  products:
    - oss
weight: 20
---

# CSV

Select **CSV** as the query type to retrieve data from CSV files or endpoints. You can query data from a URL or provide inline CSV data.

{{< admonition type="tip" >}}
For a quick start, refer to [How to Visualize CSV Data with Grafana](https://grafana.com/blog/2025/02/05/how-to-visualize-csv-data-with-grafana/) or the [Visualize CSV data using the Infinity data source](https://grafana.com/docs/learning-journeys/infinity-csv/) learning journey.
{{< /admonition >}}

{{< docs/play title="Infinity plugin CSV demo" url="https://play.grafana.org/d/infinity-csv" >}}

## Query a CSV URL

Enter the CSV URL in the query editor. By default, CSV data should have column headers in the first row and use comma delimiters.

**Example URL**: `https://thingspeak.com/channels/38629/feed.csv`

**Sample data**:

```csv
created_at,entry_id,field1,field2
2021-02-18 21:46:23 UTC,10458189,6.000000,12.000000
2021-02-18 21:46:39 UTC,10458190,0.000000,36.000000
2021-02-18 21:46:55 UTC,10458191,0.000000,49.000000
```

## Define columns

By default, all columns are returned as strings. To properly format your data, define columns with their types:

| Property   | Description                                      |
|------------|--------------------------------------------------|
| **Title**  | Display name for the column.                     |
| **Selector** | Column name in the CSV file (case-sensitive).  |
| **Format** | Data type: String, Number, Timestamp, or Boolean.|

For time series visualizations, you need at least one time column and one or more numeric columns.

## Query data without a time field

For data without timestamps, set the **Format** to **Timeseries** to add a simulated time field. This allows visualization in panels like Bar Gauge, Stats, and Gauge.

**Example data**:

```csv
Country,Population
India,3000
China,3500
UK,1200
USA,2000
Germany,700
```

## Use inline CSV data

Instead of querying a URL, you can provide CSV data directly:

1. Set **Source** to **Inline**.
1. Enter your CSV data in the data field.
1. Define columns to specify types.

**Example inline data**:

```csv
country,population,capital
india,200,mumbai
china,500,beijing
usa,200,washington
canada,100,ottawa
```

## CSV options

Configure parsing behavior for non-standard CSV files:

| Option                  | Description                                                                                     |
|-------------------------|-------------------------------------------------------------------------------------------------|
| **Delimiter**           | Character that separates values. Use `\t` for tab-delimited files.                             |
| **Headers**             | Comma-separated list of column names if the file has no header row.                            |
| **Skip empty lines**    | Ignore blank lines in the data.                                                                |
| **Skip lines with error** | Ignore lines that cannot be parsed.                                                          |
| **Relax column count**  | Allow rows with varying numbers of columns.                                                    |
| **Comment**             | Character that marks the start of a comment (for example, `#`).                                |

## CSV without headers

If your CSV file doesn't include a header row, specify column names in the **Headers** option as a comma-separated list.

## TSV and custom delimiters

For tab-separated files, either:

- Set the **Delimiter** to `\t` in CSV options, or
- Select **TSV** as the query type

## Time series field combinations

The Infinity data source automatically handles various field combinations for time series visualization:

| Fields present | Result |
|----------------|--------|
| Time + one metric | Single time series |
| Time + string + metric | Multiple series grouped by string field |
| Time + multiple metrics | Multiple time series |
| String + number (no time) | Categorical data with simulated time |

## Advanced transformations

For advanced operations like grouping, ordering, and field manipulation, use the [UQL parser](/docs/plugins/yesoreyeram-infinity-datasource/latest/query/uql/):

```sql
parse-csv
| order by "field" asc
```
