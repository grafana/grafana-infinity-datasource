---
slug: '/uql'
title: 'UQL parser'
menuTitle: UQL parser
description: Query and transform data using UQL (Unstructured Query Language) with the Infinity data source.
aliases:
  - /uql
keywords:
  - infinity
  - uql
  - parser
  - query language

labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 110
---

# UQL parser

UQL (Unstructured Query Language) is a query language for transforming and manipulating data from JSON, CSV, XML, and GraphQL sources. Inspired by the [Kusto Query Language (KQL)](https://learn.microsoft.com/en-us/kusto/query/), UQL uses a pipeline syntax where commands are joined by `|`.

**Syntax basics:**

- Commands are separated by `|` (pipe), typically one per line
- Field names are enclosed in double quotes: `"fieldName"`
- String literals use single quotes: `'value'`

{{< admonition type="note" >}}
UQL is in beta. If you encounter issues, [report them on GitHub](https://github.com/yesoreyeram/uql/issues/new).
{{< /admonition >}}

## Quick example

The following example demonstrates how UQL transforms nested JSON data into a flat table.

**Input data:**

```json
[
  {
    "id": 1,
    "name": { "firstName": "john", "lastName": "doe" },
    "dob": "1985-01-01",
    "city": "chennai"
  },
  {
    "id": 2,
    "name": { "firstName": "alice", "lastName": "bob" },
    "dob": "1990-12-31",
    "city": "london"
  }
]
```

**UQL query:**

```sql
parse-json
| extend "full name"=strcat("name.firstName",' ',"name.lastName"), "dob"=todatetime("dob")
| project-away "name"
| order by "full name" asc
```

**Output:**

| id | dob | city | full name |
|----|-----|------|-----------|
| 2 | 1990-12-31 | london | alice bob |
| 1 | 1985-01-01 | chennai | john doe |

## Basic UQL commands

### project

Select specific columns to include in the output. Use dot notation to access nested properties. To rename a column, use the syntax `"new_name"="source_field"`.

```sql
parse-json
| project "id", "name.firstName", "date of birth"="dob"
```

This selects `id`, the nested `name.firstName` field, and renames `dob` to `date of birth`.

### project-away

Remove specific columns from the output. This command only accepts top-level field names — dot notation and aliases are not supported.

```sql
parse-json
| project-away "id", "city"
```

### order by

Sort results by a column in ascending (`asc`) or descending (`desc`) order.

```sql
parse-json
| order by "full name" asc
```

### where

Filter rows based on a condition. Only rows where the condition evaluates to `true` are included.

```sql
parse-json
| where "age" > 18
```

Combine conditions with `and` or `or`:

```sql
parse-json
| where "country" == 'USA' and "age" >= 21
```

Use `in` to match against multiple values:

```sql
parse-json
| where "country" in ('USA', 'Canada', 'Mexico')
```

Use `!in` to exclude values:

```sql
parse-json
| where "country" !in ('USA', 'Canada')
```

**Supported operators:** `==`, `!=`, `>`, `>=`, `<`, `<=`, `in`, `!in`

### extend

Add new columns or transform existing columns using functions. Use the syntax `"column_name"=function("source_field")`.

```sql
parse-json
| extend "dob"=todatetime("dob"), "city"=toupper("city")
```

This converts `dob` to a datetime and transforms `city` to uppercase.

The following sections describe the functions available with `extend`, organized by category.

#### String functions

| Function | Syntax | Description |
|----------|--------|-------------|
| `toupper` | `toupper("name")` | Convert to uppercase |
| `tolower` | `tolower("name")` | Convert to lowercase |
| `trim` | `trim("name")` | Remove whitespace from start and end |
| `trim_start` | `trim_start("name")` | Remove whitespace from start |
| `trim_end` | `trim_end("name")` | Remove whitespace from end |
| `strlen` | `strlen("name")` | Return string length |
| `strcat` | `strcat("col1","col2")` | Concatenate two or more columns |
| `substring` | `substring("col1",1,5)` | Extract substring (start index, length) |
| `split` | `split("col1",'delimiter')` | Split string by delimiter |
| `replace_string` | `replace_string("col1",'find','replace')` | Replace text within a string |
| `reverse` | `reverse("col1")` | Reverse a string |
| `extract` | `extract('regex',index,"col1")` | Extract using regex (index: 0, 1, ...) |

#### Type conversion functions

| Function | Syntax | Description |
|----------|--------|-------------|
| `tonumber` | `tonumber("age")` | Convert to number |
| `tostring` | `tostring("age")` | Convert to string |
| `toint` | `toint("value")` | Convert to integer |
| `tolong` | `tolong("value")` | Convert to long integer |
| `todouble` | `todouble("value")` | Convert to double |
| `tofloat` | `tofloat("value")` | Convert to float |
| `tobool` | `tobool("value")` | Convert to boolean |

#### DateTime functions

| Function | Syntax | Description |
|----------|--------|-------------|
| `todatetime` | `todatetime("dob")` | Convert string to datetime |
| `tounixtime` | `tounixtime("dob")` | Convert datetime to unix epoch (ms) |
| `format_datetime` | `format_datetime("dob",'DD/MM/YYYY')` | Format datetime as string |
| `add_datetime` | `add_datetime("dob",'-1d')` | Add duration (e.g., `-1d`, `2h`) |
| `unixtime_seconds_todatetime` | `unixtime_seconds_todatetime("ts")` | Convert unix seconds to datetime |
| `unixtime_milliseconds_todatetime` | `unixtime_milliseconds_todatetime("ts")` | Convert unix milliseconds to datetime |
| `unixtime_microseconds_todatetime` | `unixtime_microseconds_todatetime("ts")` | Convert unix microseconds to datetime |
| `unixtime_nanoseconds_todatetime` | `unixtime_nanoseconds_todatetime("ts")` | Convert unix nanoseconds to datetime |
| `startofminute` | `startofminute("dob")` | Round to start of minute |
| `startofhour` | `startofhour("dob")` | Round to start of hour |
| `startofday` | `startofday("dob")` | Round to start of day |
| `startofweek` | `startofweek("dob")` | Round to start of week |
| `startofmonth` | `startofmonth("dob")` | Round to start of month |
| `startofyear` | `startofyear("dob")` | Round to start of year |

#### Math functions

| Function | Syntax | Description |
|----------|--------|-------------|
| `sum` | `sum("col1","col2")` | Add two or more columns |
| `diff` | `diff("col1","col2")` | Subtract columns (col1 - col2) |
| `mul` | `mul("col1","col2")` | Multiply columns |
| `div` | `div("col1","col2")` | Divide columns (col1 / col2) |
| `percentage` | `percentage("col1","col2")` | Calculate percentage ((col1/col2) × 100) |
| `floor` | `floor("col1")` | Round down to nearest integer |
| `ceil` | `ceil("col1")` | Round up to nearest integer |
| `round` | `round("col1")` | Round to nearest integer |
| `sign` | `sign("col1")` | Return sign (-1, 0, or 1) |
| `pow` | `pow("col1",3)` | Raise to power |
| `log` | `log("col1")` | Natural logarithm |
| `log2` | `log2("col1")` | Base-2 logarithm |
| `log10` | `log10("col1")` | Base-10 logarithm |
| `sin` | `sin("col1")` | Sine |
| `cos` | `cos("col1")` | Cosine |
| `tan` | `tan("col1")` | Tangent |

#### URL functions

| Function | Syntax | Description |
|----------|--------|-------------|
| `parse_url` | `parse_url("col1")` | Parse URL into components |
| `parse_url` | `parse_url("col1",'pathname')` | Get URL part: `host`, `hash`, `origin`, `href`, `protocol`, `pathname`, `search` |
| `parse_url` | `parse_url("col1",'search','key1')` | Get query parameter value |
| `parse_urlquery` | `parse_urlquery("col1",'key1')` | Parse query string and get value for key |

#### Encoding functions

| Function | Syntax | Description |
|----------|--------|-------------|
| `atob` | `atob("col1")` | Decode base64 string |
| `btoa` | `btoa("col1")` | Encode string to base64 |

#### Math functions example

**Input data:**

```json
[{ "a": 12, "b": 20 }, { "a": 6, "b": 32 }]
```

**UQL query:**

```sql
parse-json
| project "a", "triple"=sum("a","a","a"), "thrice"=mul("a",3), sum("a","b"), diff("a","b"), mul("a","b")
```

**Output:**

| a | triple | thrice | sum | diff | mul |
|---|--------|--------|-----|------|-----|
| 12 | 36 | 36 | 32 | -8 | 240 |
| 6 | 18 | 18 | 38 | -26 | 192 |

#### Chain multiple transformations

To apply multiple transformations to the same field, repeat the field name in the `extend` command:

```sql
parse-json
| extend "name"=tolower("name"), "name"=trim("name")
```

This applies `tolower` first, then `trim` to the `name` field.

#### Array functions

#### pack

Convert key-value pairs into an object.

```sql
extend "foo"=pack('key1',"value1",'key2',"value2")
```

**Output:** `{key1: value1, key2: value2}`

#### array_from_entries

Build an array of objects from a list of values.

```sql
extend "foo"=array_from_entries('timestamp',[2010,2020,2030])
```

**Output:** `[{timestamp: 2010}, {timestamp: 2020}, {timestamp: 2030}]`

#### array_to_map

Convert an array to an object with named keys.

```sql
extend "foo"=array_to_map(['chennai','india'],'city','country')
```

**Output:** `{city: 'chennai', country: 'india'}`

### summarize

Aggregate data by grouping on one or more columns. Use the syntax `"alias"=function("field") by "group_field"`.

#### Aggregation functions

| Function | Syntax | Description |
|----------|--------|-------------|
| `count` | `count()` | Count of rows |
| `sum` | `sum("age")` | Sum of values |
| `min` | `min("population")` | Minimum value |
| `max` | `max("foo")` | Maximum value |
| `mean` | `mean("foo")` | Average value |
| `first` | `first("foo")` | First value in group |
| `last` | `last("foo")` | Last value in group |
| `latest` | `latest("foo")` | Most recent non-null value |
| `random` | `random("foo")` | Random value from group |
| `dcount` | `dcount("country")` | Count of distinct values |
| `distinct` | `distinct("country")` | List of distinct values |
| `countif` | `countif("age", "> 18")` | Count where condition is true |
| `sumif` | `sumif("salary", "> 1000")` | Sum where condition is true |
| `minif` | `minif("age", "> 0")` | Minimum where condition is true |
| `maxif` | `maxif("score", "!= null")` | Maximum where condition is true |

#### Summarize example

**Input data:**

```json
[
  { "city": "tokyo", "country": "japan", "population": 200 },
  { "city": "newyork", "country": "usa", "population": 60 },
  { "city": "oslo", "country": "usa", "population": 40 },
  { "city": "new delhi", "country": "india", "population": 180 },
  { "city": "mumbai", "country": "india", "population": 150 }
]
```

**UQL query:**

```sql
parse-json
| summarize "number of cities"=count(), "total population"=sum("population") by "country"
| extend "country"=toupper("country")
| order by "total population" desc
```

**Output:**

| country | number of cities | total population |
|---------|------------------|------------------|
| INDIA | 2 | 330 |
| JAPAN | 1 | 200 |
| USA | 2 | 100 |

### pivot

Transform rows into columns. The `pivot` command accepts three arguments:

1. **Aggregation function** — for example, `count("id")` or `sum("salary")`
2. **Row field** — the field to use for row grouping, for example, `"country"`
3. **Column field** — the field whose values become column headers, for example, `"occupation"`

##### Pivot example

**Input data (CSV):**

```csv
name,age,country,occupation,salary
Leanne Graham,38,USA,Devops Engineer,3000
Ervin Howell,27,USA,Software Engineer,2300
Clementine Bauch,17,Canada,Student,
Patricia Lebsack,42,UK,Software Engineer,2800
Leanne Bell,38,USA,Senior Software Engineer,4000
Chelsey Dietrich,32,USA,Software Engineer,3500
```

**UQL query (pivot):**

```sql
parse-csv
| extend "salary"=tonumber("salary")
| pivot sum("salary"), "country", "occupation"
```

**Output:**

| country | Devops Engineer | Software Engineer | Student | Senior Software Engineer |
|---------|-----------------|-------------------|---------|--------------------------|
| USA | 3000 | 5800 | 0 | 4000 |
| CANADA | 0 | 0 | 0 | 0 |
| UK | 0 | 2800 | 0 | 0 |

**Compare with summarize:**

```sql
parse-csv
| extend "salary"=tonumber("salary")
| summarize "salary"=sum("salary") by "country", "occupation"
```

**Output:**

| country | occupation | salary |
|---------|--------------------------|--------|
| USA | Devops Engineer | 3000 |
| USA | Software Engineer | 5800 |
| Canada | Student | 0 |
| UK | Software Engineer | 2800 |
| UK | Senior Software Engineer | 4000 |

Use `pivot` when you want values to become column headers. Use `summarize` when you want grouped rows.

### Parser commands

These commands parse the raw response into a structured format:

| Command | Description |
|---------|-------------|
| `parse-json` | Parse response as JSON |
| `parse-csv` | Parse response as CSV |
| `parse-xml` | Parse response as XML |
| `parse-yaml` | Parse response as YAML |

### count

Return the total number of rows.

```sql
parse-json
| count
```

### limit

Restrict the number of rows returned.

```sql
parse-json
| limit 10
```

### scope

Set the document root to a nested property. Useful when your data is wrapped in a container object.

**Input data:**

```json
{
  "meta": { "last-updated": "2021-08-09" },
  "count": 2,
  "users": [{ "name": "foo" }, { "name": "bar" }]
}
```

**UQL query:**

```sql
parse-json
| scope "users"
```

This returns only the `users` array, ignoring `meta` and `count`.

### mv-expand

Expand multi-value arrays into separate rows. Use the syntax `mv-expand "new_column"="array_column"`.

**Input data:**

```json
[
  { "group": "A", "users": ["user a1", "user a2"] },
  { "group": "B", "users": ["user b1"] }
]
```

**UQL query:**

```sql
parse-json
| mv-expand "user"="users"
```

**Output:**

```json
[
  { "group": "A", "user": "user a1" },
  { "group": "A", "user": "user a2" },
  { "group": "B", "user": "user b1" }
]
```

### project kv()

Convert an object into key-value pair rows.

**Input data:**

```json
{ "a": {"name":"a1"}, "b": {"name":"b1"}, "c": {"name":"c1"} }
```

**UQL query:**

```sql
parse-json
| project kv()
```

**Output:**

| key | value |
|-----|-------|
| a | `{"name":"a1"}` |
| b | `{"name":"b1"}` |
| c | `{"name":"c1"}` |

To access a nested object, pass the property name as an argument:

```sql
parse-json
| project kv("data")
```

{{< admonition type="note" >}}
The `project kv()` command is available from plugin version 0.8.7.
{{< /admonition >}}

### jsonata

Run a [JSONata](https://jsonata.org/) expression on the data. The JSONata query language provides powerful querying and transformation capabilities.

**Basic example:**

```sql
parse-json
| jsonata "items[price > 100]"
```

**Complex example with chained commands:**

```sql
parse-json
| scope "library"
| jsonata "loans@$L.books@$B[$L.isbn=$B.isbn].customers[$L.customer=id].{'customer': name, 'book': $B.title, 'due': $L.return}"
| count
```

The `jsonata` command can be combined with other UQL commands in a pipeline. Use it for filtering, transforming, or restructuring data.

{{< admonition type="note" >}}
JSONata support in UQL is available from plugin version 0.8.8.
{{< /admonition >}}

### Comments

Lines starting with `#` are treated as comments and ignored during execution.

```sql
parse-json
# Filter to active users only
| where "status" == 'active'
# Sort by name
| order by "name" asc
```
