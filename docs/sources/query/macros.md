---
slug: '/macros'
title: 'Macros'
menuTitle: Macros
description: Macros
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
weight: 350
---

# Macros

Macro functions are utility functions that perform operations and yield results based on the arguments provided. You can use macro function in the query URL, Body, Inline data, UQL, GROQ fields.

Following macros are available in this plugin

## Custom Interval macro (`$__customInterval()`)

Custom interval macro yields a value based on the dashboard time range. You can pass multiple condition and values to this macro. This acts like a If else condition in the programming languages.

Number of arguments to `$__customInterval` macro have to be 3/5/7/9..

**Syntax** : `$__customInterval(duration1,value1,duration2,value2,duration3,value3,duration4,value4,defaultValue)`. Duration have to be valid duration syntax like `1m`, `2d` etc

**Description** : If dashboardTimeRange `<=` duration1 returns value1, Else if dashboardTimeRange `<=` duration2 returns value2, Else if dashboardTimeRange `<=` duration3 returns value3, Else if dashboardTimeRange `<=` duration4 returns value4, Else returns default value.

**Example** : `$__customInterval(5m,foo,1d,bar,10d,baz,fuzz)`. If the dashboard time range is last 3 hours, then the result will be **bar**

More examples are given below

| Dashboard range | Query                                                                                 | Output                         |
| --------------- | ------------------------------------------------------------------------------------- | ------------------------------ |
| 24 hours        | `$__customInterval(1m,1 MIN,1d)`                                                      | 1d                             |
| 24 hours        | `$__customInterval(2d,2 DAYS,1d)`                                                     | 2 DAYS                         |
| 24 hours        | `$__customInterval(5m,5 MINUTES,1d,1 DAY,10d,10 days,1d)`                             | 1 DAY                          |
| 7 days          | `$__customInterval(5m,5 MINUTES,1d,1 DAY,10d,10 days,1d)`                             | 10 days                        |
| 30 days         | `$__customInterval(5m,5 MINUTES,1d,1 DAY,10d,10 days,1d)`                             | 1d                             |
| 30 days         | `http.://foo.com?d=$__customInterval(5m,5 MINUTES,1d,1 DAY,10d,10 days,1d)&type=test` | http.://foo.com?d=1d&type=test |

## Combine Values macro (`$__combineValues()`)

Combine values macro allows you to combine multiple string with prefix, suffix and in-between value. First parameter to this macro is prefix, Second param is the suffix and the third parameter is in-between value.

Minimum number of arguments required for this macro is 4. Number of arguments to this macro have to be 4/5/6/7...

For the prefix,suffix and in-between values you can also use following special escape words. `__comma`-->`,`/`__space`--> `one blank space( )`/`__open`-->`(`/`__close`-->`)`.

**Syntax** : `$__combineValues(prefix,suffix,in-between-value,value1,value2,value3)`

**Description** : In the above example, all the value1, value2, value3 each will be attached with the prefix and suffix. Then everything will be concatenated by in-between-value.

**Example** : `$__combineValues(key=,__space, OR ,value1,value2,value3)` will yield **key=value1 OR key=value2 OR key=value3**. Note: in this example, we used a special escape suffix `__space`

> There is a special nature to this macro where it returns empty string when there are four arguments and fourth argument is `*`

More examples are given below

| Query                                                                           | Output                            |
| ------------------------------------------------------------------------------- | --------------------------------- |
| `$__combineValues(p,s,i,v)`                                                     | pvs                               |
| `$__combineValues(p,s,__space,v1,v2)`                                           | pv1s pv2s                         |
| `$__combineValues(__open,__close, OR ,foo,bar)`                                 | `(foo) OR (bar)`                  |
| `$__combineValues(,, OR ,foo,bar)`                                              | foo OR bar                        |
| `hello $__combineValues(,, OR ,foo,bar) $__combineValues(,, OR ,foo,bar) world` | hello foo OR bar foo OR bar world |
| `$__combineValues(p,s,i,*)`                                                     | empty string                      |

This macro will be more useful when combined with the multi value dashboard variables. Consider the below example.

**Variable Name**: server

**Multi value**: true

**Custom all value**: true and the value is `*`

| Selected values         | Query                                           | Output                                        |
| ----------------------- | ----------------------------------------------- | --------------------------------------------- |
| server2,server3,server5 | `${server:csv}`                                 | server2,server3,server5                       |
| server2,server3,server5 | `$__combineValues(foo:,, OR ,${server:csv})`    | foo:server2 OR foo:server3 OR foo:server5     |
| server2                 | `$__combineValues(foo:,, OR ,${server:csv})`    | foo:server2                                   |
| All                     | `$__combineValues(foo:,, OR ,${server:csv})`    | empty string                                  |
| server2,server3,server5 | `($__combineValues(foo:,, OR ,${server:csv}))`  | `(foo:server2 OR foo:server3 OR foo:server5)` |
| All                     | `($__combineValues(foo:,, OR ,${server:csv}))`  | `()`                                          |
| server2,server3,server5 | `$__combineValues(foo:,,__comma,${server:csv})` | foo:server2,foo:server3,foo:server5           |

## Time Macros (`${__timeFrom}` and `${__timeTo}`)

From v2.7.1, you can use time macros `${__timeFrom}` and `${__timeTo}` which will be interpolated in the backend. For example, if you have dashboard start time `2020-07-13T20:19:09.254Z`, then the macros will be interpolated as following.

| Macro                                 | Output                     |
| ------------------------------------- | -------------------------- |
| `${__timeFrom}`                       | `1594671549254`            |
| `${__timeFrom:date:seconds}`          | `1594671549`               |
| `${__timeFrom:date}`                  | `2020-07-13T20:19:09.254Z` |
| `${__timeFrom:date:iso}`              | `2020-07-13T20:19:09.254Z` |
| `${__timeFrom:date:YYYY:MM:DD:hh:mm}` | `2020:07:13:08:19`         |
| `${__timeFrom:date:YYYY-MM-DD}`       | `2020-07-13`               |

In infinity 2.7.1+, This is the preferred time macro over [grafana global variable](https://grafana.com/docs/grafana/latest/dashboards/variables/add-template-variables/#__from-and-__to) time macros (`${__from}` and `${__to}`) due to the limitations of grafana global macros being handled in the frontend.
