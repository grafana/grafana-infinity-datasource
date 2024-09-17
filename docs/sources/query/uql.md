---
slug: '/uql'
title: 'UQL Parser'
menuTitle: UQL Parser
description: UQL Parser
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
weight: 310
---

# UQL Parser

**UQL** (Unstructured query language) is an advance query format in Infinity data source which will consolidate JSON, CSV, XML, GraphQL formats. UQL also provides ability to customize the results.

**UQL** is an opinionated query language designed for in-memory operations. UQL query can be formed with list of commands joined by `|`, in a line each.
Most of the times, fields are referred within double quotes and string values are referred with single quotes. UQL was inspired by kusto query language and follows similar syntax.

{{< admonition type="note" >}}
UQL is still in beta but used widely. If you encounter any issues with UQL, create a bug [in GitHub](https://github.com/yesoreyeram/uql/issues/new).
{{< /admonition >}}

If your data looks like this:

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

then the following UQL query

```sql
parse-json
| extend "full name"=strcat("name.firstName",' ',"name.lastName"), "dob"=todatetime("dob")
| project-away "name"
| order by "full name" asc
```

will produce four column table (id, dob, city, full name).

## Basic UQL commands

All these commands are available in all versions unless specified otherwise.

### project

`project` command is used to select the columns to include in the results. If you want to select a property inside a nested object, you can use dot notation. Optionally, you can also alias the fields.

```sql
parse-json
| project "id", "name.firstName", "date of birth"="dob"
```

### project-away

`project-away` command is exactly opposite as `project`. It just drops specific columns from the data. It doesn't support alias or dot notation selector.

```sql
parse-json
| project-away "id", "city"
```

### order by

`order by` command sorts the input based on any column. sort direction should be either `asc` or `desc`

```sql
parse-json
| order by "full name" asc
```

### extend

`extend` command is similar to `project`. but instead of selecting the columns, it just adds/replace columns in existing data. `extends` expects an alias and a function.

```sql
parse-json
| extend "dob"=todatetime("dob"), "city"=toupper("city")
```

following are some of the available functions

| function keyword                 | syntax                                  | description                                                                                                                                                  | available from |
| -------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| trim                             | trim("name")                            | trims the string                                                                                                                                             | 0.8.0          |
| trim_start                       | trim_start("name")                      | removes the space before                                                                                                                                     | 0.8.0          |
| trim_end                         | trim_end("name")                        | removes the space after                                                                                                                                      | 0.8.0          |
| tonumber                         | tonumber("age")                         | converts a string into number                                                                                                                                | 0.8.0          |
| tostring                         | tostring("age")                         | converts a number into string                                                                                                                                | 0.8.0          |
| todatetime                       | todatetime("age")                       | converts a datetime string into datetime                                                                                                                     | 0.8.0          |
| unixtime_seconds_todatetime      | unixtime_seconds_todatetime("dob")      | converts unix epoch s timestamp to datetime                                                                                                                  | 0.8.0          |
| unixtime_nanoseconds_todatetime  | unixtime_nanoseconds_todatetime("dob")  | converts unix epoch ns timestamp to datetime                                                                                                                 | 0.8.0          |
| unixtime_milliseconds_todatetime | unixtime_milliseconds_todatetime("dob") | converts unix epoch ms timestamp to datetime                                                                                                                 | 0.8.0          |
| unixtime_microseconds_todatetime | unixtime_microseconds_todatetime("dob") | converts unix epoch microsecond timestamp to datetime                                                                                                        | 0.8.0          |
| format_datetime                  | format_datetime("dob",'DD/MM/YYYY')     | converts datetime to a specific format                                                                                                                       | 0.8.0          |
| add_datetime                     | add_datetime("dob",'-1d')               | adds duration to a datetime field                                                                                                                            | 0.8.0          |
| startofminute                    | startofminute("dob")                    | rounds the datetime field to the starting minute                                                                                                             | 0.8.0          |
| startofhour                      | startofhour("dob")                      | rounds the datetime field to the starting hour                                                                                                               | 0.8.0          |
| startofday                       | startofday("dob")                       | rounds the datetime field to the starting day                                                                                                                | 0.8.0          |
| startofmonth                     | startofmonth("dob")                     | rounds the datetime field to the starting month                                                                                                              | 0.8.0          |
| startofweek                      | startofweek("dob")                      | rounds the datetime field to the starting week                                                                                                               | 0.8.0          |
| startofyear                      | startofyear("dob")                      | rounds the datetime field to the starting year                                                                                                               | 0.8.0          |
| extract                          | extract('regex',index,"col1")           | extracts part of the string field using regex and match index (0/1/..)                                                                                       | 1.0.0          |
| sum                              | sum("col1","col2")                      | sum of two or more columns                                                                                                                                   | 0.8.0          |
| diff                             | diff("col1","col2")                     | difference between two columns                                                                                                                               | 0.8.0          |
| mul                              | mul("col1","col2")                      | multiplication of two columns                                                                                                                                | 0.8.0          |
| div                              | div("col1","col2")                      | division of two columns (col1/col2)                                                                                                                          | 0.8.0          |
| percentage                       | percentage("col1","col2")               | percentage of two columns ((col1/col2)\*100)                                                                                                                 | 1.0.0          |
| strcat                           | strcat("col1","col2")                   | concatenates two or more columns                                                                                                                             | 0.8.0          |
| split                            | split("col1",'delimiter')               | splits a string using delimiter                                                                                                                              | 1.0.0          |
| replace_string                   | replace_string("col1",'src','replacer') | replace a portion of string with another                                                                                                                     | 1.0.0          |
| reverse                          | revers("col1")                          | reverse a string                                                                                                                                             | 1.0.0          |
| floor                            | floor("col1")                           | calculates the floor value of given numeric field                                                                                                            | 0.8.7          |
| ceil                             | ceil("col1")                            | calculates the ceil value of given numeric field                                                                                                             | 0.8.7          |
| round                            | round("col1")                           | calculates the round value of given numeric field                                                                                                            | 0.8.7          |
| sign                             | sign("col1")                            | calculates the sign value of given numeric field                                                                                                             | 0.8.7          |
| pow                              | pow("col1",3)                           | calculates the pow value of given numeric field                                                                                                              | 0.8.7          |
| sin                              | sin("col1")                             | calculates the sin value of given numeric field                                                                                                              | 0.8.7          |
| cos                              | cos("col1")                             | calculates the cos value of given numeric field                                                                                                              | 0.8.7          |
| tan                              | tan("col1")                             | calculates the tan value of given numeric field                                                                                                              | 0.8.7          |
| log                              | log("col1")                             | calculates the log value of given numeric field                                                                                                              | 0.8.7          |
| log2                             | log2("col1")                            | calculates the log2 value of given numeric field                                                                                                             | 0.8.7          |
| log10                            | log10("col1")                           | calculates the log10 value of given numeric field                                                                                                            | 0.8.7          |
| parse_url                        | parse_url("col1")                       | parses the col1 as URL                                                                                                                                       | 0.8.6          |
|                                  | parse_url("col1",'pathname')            | returns the `pathname` of the URL. Options are `host`,`hash`,`origin`,`href`,`protocol` and `search`                                                         | 0.8.6          |
|                                  | parse_url("col1",'search','key1')       | returns the query string value for `key1`. 2nd arg is always `search`                                                                                        | 0.8.6          |
| atob                             | atob("col1")                            | returns `atob` value of a string column. [reference](https://developer.mozilla.org/en-US/docs/Web/API/atob)                                                  | 1.3.0          |
| btoa                             | btoa("col1")                            | returns `btoa` value of a string column. [reference](https://developer.mozilla.org/en-US/docs/Web/API/btoa)                                                  | 1.3.0          |
| substring                        | substring("col1",1,5)                   | returns `substring` value of a string column. [reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substring) | 1.3.0          |

For example, the data `[ { "a": 12, "b" : 20 }, { "a" : 6, "b": 32} ]` and the following uql query

```sql
parse-json
| project "a", "triple"=sum("a","a","a"),"thrice"=mul("a",3), sum("a","b"),  diff("a","b"), mul("a","b")
```

wil produce the following output

| a   | triple | thrice | sum | diff | mul |
| --- | ------ | ------ | --- | ---- | --- |
| 12  | 36     | 36     | 32  | -8   | 240 |
| 6   | 18     | 18     | 38  | -26  | 192 |

To apply multiple transformations over a field, repeat them with the same field name. For example, the uql query `extend "name"=tolower("name"), "name"=trim("name")` will apply tolower function and then trim function over the name field.

There are few other extend/project methods also available to deal with array

### pack

pack method converts array of key value pairs into a map. Example `extend "foo"=pack('key1',"value1",'key1',"value2")` will yield a object `{key1:value1,key2:value2}`

### array_from_entries

array_from_entries method builds an array of objects from entries. Example `extend "foo"=array_from_entries('timestamp',[2010,2020,2030])` will yield an array `[{timestamp:2010},{timestamp:2020},{timestamp:2030}]`

### array_to_map

array_to_map converts an array of entries to a map. Optionally, one can provide alias for keys instead of index. Example `extend "foo"=array_to_map(['chennai','india'],'city','country')` will yield `{ 'city': 'chennai', 'country':'india'}`

### summarize

`summarize` command aggregates the data by a string column. summarize command expects alias, summarize by fields and summarize function. Following are the valid summarize functions.

| function keyword | syntax            | description       | available from |
| ---------------- | ----------------- | ----------------- | -------------- |
| count            | count()           | count of values   | 0.8.0          |
| sum              | sum("age")        | sum of age        | 0.8.0          |
| min              | min("population") | min of population | 0.8.0          |
| max              | max("foo")        | max of foo        | 0.8.0          |
| mean             | mean("foo")       | mean of foo       | 0.8.0          |

For example, the following data

```json
[
  { "city": "tokyo", "country": "japan", "population": 200 },
  { "city": "newyork", "country": "usa", "population": 60 },
  { "city": "oslo", "country": "usa", "population": 40 },
  { "city": "new delhi", "country": "india", "population": 180 },
  { "city": "mumbai", "country": "india", "population": 150 }
]
```

and the following uql query

```sql
parse-json
| summarize "number of cities"=count(), "total population"=sum("population") by "country"
| extend "country"=toupper("country")
| order by "total population" desc
```

will produce the output table like this

| country | number of cities | total population |
| ------- | ---------------- | ---------------- |
| INDIA   | 2                | 330              |
| JAPAN   | 1                | 200              |
| USA     | 2                | 100              |

### pivot

`pivot` is the command used to perform pivot operations over the data. `pivot` command accepts 3 arguments.

- 1st argument is the summarization. Example: `count("id)` or `sum("salary")`
- 2nd argument is the row field name. Example: `"country"`
- 3rd argument is the column field name. Example: `"occupation"`

#### Pivot example 1

```csv
name,age,country,occupation,salary
Leanne Graham,38,USA,Devops Engineer,3000
Ervin Howell,27,USA,Software Engineer,2300
Clementine Bauch,17,Canada,Student,
Patricia Lebsack,42,UK,Software Engineer,2800
Leanne Bell,38,USA,Senior Software Engineer,4000
Chelsey Dietrich,32,USA,Software Engineer,3500
```

and the following query

```sql
parse-csv
| extend "salary"=tonumber("salary")
| pivot sum("salary"), "country", "occupation"
```

will produce

| country | Devops Engineer | Software Engineer | Student | Senior Software Engineer |
| ------- | --------------- | ----------------- | ------- | ------------------------ |
| USA     | 3000            | 5800              | 0       | 4000                     |
| CANADA  | 0               | 0                 | 0       | 0                        |
| UK      | 0               | 2800              | 0       | 0                        |

where as the following summarize query

```sql
parse-csv
| extend "salary"=tonumber("salary")
| summarize "salary"=sum("salary") by "country", "occupation"
```

will produce

| country | occupation               | salary |
| ------- | ------------------------ | ------ |
| USA     | Devops Engineer          | 3000   |
| USA     | Software Engineer        | 5800   |
| Canada  | Student                  | 0      |
| UK      | Software Engineer        | 2800   |
| UK      | Senior Software Engineer | 4000   |

so choose either `summarize` or `pivot` according to you needs

### parse-json

`parse-json` is the command to instruct the UQL to parse the response as JSON

### parse-csv

`parse-csv` is the command to instruct the UQL to parse the response as CSV

### parse-xml

`parse-xml` is the command to instruct the UQL to parse the response as XML

### parse-yaml

`parse-yaml` is used to specify that the results are in XML format

### count

count gives the number of results.

```sql
parse-json
| count
```

### limit

`limit` command restricts the number of results returned.
For example, the following query returns only 10 results

```sql
parse-json
| limit 10
```

### scope

`scope` commands sets the context of the output data. It is useful when the results are insides nested json object.

example

```json
{
  "meta": { "last-updated": "2021-08-09" },
  "count": 2,
  "users": [{ "name": "foo" }, { "name": "bar" }]
}
```

and the following uql query just results the "users" and ignores the other root level properties.

```sql
parse-json
| scope "users"
```

### mv-expand

`mv-expand` expands multi-value properties into their own records. For example, the command `mv-expand "user"="users"` over following data

```json
[
  { "group": "A", "users": ["user a1", "user a2"] },
  { "group": "B", "users": ["user b1"] }
]
```

will produce results like

```json
[
  { "group": "A", "user": "user a1" },
  { "group": "A", "user": "user a2" },
  { "group": "B", "user": "user b1" }
]
```

`mv-expand` should also work for non string arrays.

### project kv()

`project kv()` command is used to convert the given object into key-value pairs.

Example: For the data `{ "a": {"name":"a1"}, "b": {"name":"b1"}, "c": {"name":"c1"} }` and the query `parse-json | project kv()` will yield the following table

| key | value           |
| --- | --------------- |
| a   | `{"name":"a1"}` |
| b   | `{"name":"b1"}` |
| c   | `{"name":"c1"}` |

This command can be also used with arguments

Example: For the data `{ "data": { "a": {"name":"a1"}, "b": {"name":"b1"}, "c": {"name":"c1"} } }` and the query `parse-json | project kv("data")` will yield the same results

> project kv() command is available only from 0.8.7 of the plugin

### JSONata

`jsonata` command accepts a JSONata query and apply over the previous input

```sql
parse-json
| scope "library"
| jsonata "library.loans@$L.books@$B[$L.isbn=$B.isbn].customers[$L.customer=id].{ 'customer': name, 'book': $B.title, 'due': $L.return}"
| count
```

Like any other command, `jsonata` command can be combined/piped with multiple commands. You can use JSONata for filtering the data as well.

> JSONata support is available from 0.8.8 version

### comments

Any new line that starts with `#` will be treated as a comment.
