---
slug: '/macros'
title: 'Macros'
menuTitle: Macros
description: Use macros to dynamically transform values in your Infinity queries based on dashboard time range and template variables.
aliases:
  - infinity/macros
keywords:
  - infinity
  - macros
  - dynamic queries
  - time range
  - template variables
weight: 220
---

# Macros

Macros are utility functions that dynamically transform values in your queries. Use them to build dynamic URLs, filter data based on dashboard time ranges, or combine template variable values.

## Where to use macros

You can use macros in the following query fields:

- URL
- Request body
- GraphQL query
- URL parameters
- Inline data
- UQL expressions
- GROQ expressions
- Computed column selectors
- Filter expressions

## Available macros

| Macro | Description |
|-------|-------------|
| `$__customInterval()` | Return different values based on dashboard time range |
| `$__combineValues()` | Combine multiple values with prefix, suffix, and separator |
| `${__timeFrom}` | Dashboard start time (backend-interpolated) |
| `${__timeTo}` | Dashboard end time (backend-interpolated) |
| `${__user.*}` | User context (login, email, name) |
| `${__ds.*}` | Data source context (uid, name) |
| `${__org.id}` | Grafana organization ID |
| `${__plugin.*}` | Plugin context (id, version) |

## Custom interval macro

The `$__customInterval()` macro returns different values based on the dashboard time range. Use it to adjust query granularity or parameters based on how much time the user is viewing.

**Syntax:**

```
$__customInterval(duration1,value1,duration2,value2,...,defaultValue)
```

The macro evaluates conditions in order:

1. If dashboard time range ≤ `duration1`, return `value1`
2. Else if dashboard time range ≤ `duration2`, return `value2`
3. Continue for additional duration/value pairs
4. If no condition matches, return `defaultValue`

Duration values must use valid syntax: `1m`, `1h`, `1d`, `7d`, etc.

The number of arguments must be odd (3, 5, 7, 9, ...).

**Example:**

```
$__customInterval(5m,foo,1d,bar,10d,baz,fuzz)
```

If the dashboard time range is 3 hours, the result is `bar` (because 3h > 5m but ≤ 1d).

**More examples:**

| Dashboard range | Query | Output |
|-----------------|-------|--------|
| 24 hours | `$__customInterval(1m,1 MIN,1d)` | `1d` |
| 24 hours | `$__customInterval(2d,2 DAYS,1d)` | `2 DAYS` |
| 24 hours | `$__customInterval(5m,5 MINUTES,1d,1 DAY,10d,10 days,1d)` | `1 DAY` |
| 7 days | `$__customInterval(5m,5 MINUTES,1d,1 DAY,10d,10 days,1d)` | `10 days` |
| 30 days | `$__customInterval(5m,5 MINUTES,1d,1 DAY,10d,10 days,1d)` | `1d` |
| 30 days | `http://api.example.com?d=$__customInterval(5m,5m,1d,1d,10d,10d,30d)` | `http://api.example.com?d=30d` |

## Combine values macro

The `$__combineValues()` macro combines multiple values with a prefix, suffix, and separator. This is especially useful with multi-value template variables.

**Syntax:**

```
$__combineValues(prefix,suffix,separator,value1,value2,value3,...)
```

Each value gets wrapped with the prefix and suffix, then all results are joined with the separator.

**Example:**

```
$__combineValues(key=,, OR ,value1,value2,value3)
```

Result: `key=value1 OR key=value2 OR key=value3`

### Escape sequences

Use escape sequences for special characters in prefix, suffix, or separator:

| Escape | Character |
|--------|-----------|
| `__comma` | `,` |
| `__space` | ` ` (space) |
| `__open` | `(` |
| `__close` | `)` |

### Basic examples

| Query | Output |
|-------|--------|
| `$__combineValues(p,s,i,v)` | `pvs` |
| `$__combineValues(p,s,__space,v1,v2)` | `pv1s pv2s` |
| `$__combineValues(__open,__close, OR ,foo,bar)` | `(foo) OR (bar)` |
| `$__combineValues(,, OR ,foo,bar)` | `foo OR bar` |
| `$__combineValues(p,s,i,*)` | (empty string) |

{{< admonition type="note" >}}
When the macro receives exactly 4 arguments and the fourth argument is `*`, it returns an empty string. This behavior supports the "All" option in multi-value variables.
{{< /admonition >}}

### Use with multi-value variables

This macro works well with multi-value template variables. Configure your variable with:

- **Multi-value**: Enabled
- **Custom all value**: `*`

| Selected values | Query | Output |
|-----------------|-------|--------|
| server2, server3, server5 | `${server:csv}` | `server2,server3,server5` |
| server2, server3, server5 | `$__combineValues(foo:,, OR ,${server:csv})` | `foo:server2 OR foo:server3 OR foo:server5` |
| server2 | `$__combineValues(foo:,, OR ,${server:csv})` | `foo:server2` |
| All | `$__combineValues(foo:,, OR ,${server:csv})` | (empty string) |
| server2, server3, server5 | `$__combineValues(foo:,,__comma,${server:csv})` | `foo:server2,foo:server3,foo:server5` |

## Time macros

The `${__timeFrom}` and `${__timeTo}` macros return the dashboard time range boundaries. These macros are interpolated in the backend, making them suitable for API calls that require time parameters.

{{< admonition type="note" >}}
Time macros are available from plugin version 2.7.1.
{{< /admonition >}}

### Format options

Given a dashboard start time of `2020-07-13T20:19:09.254Z`:

| Macro | Output |
|-------|--------|
| `${__timeFrom}` | `1594671549254` (milliseconds) |
| `${__timeFrom:date:seconds}` | `1594671549` |
| `${__timeFrom:date}` | `2020-07-13T20:19:09.254Z` |
| `${__timeFrom:date:iso}` | `2020-07-13T20:19:09.254Z` |
| `${__timeFrom:date:YYYY-MM-DD}` | `2020-07-13` |
| `${__timeFrom:date:YYYY:MM:DD:hh:mm}` | `2020:07:13:08:19` |

The same format options apply to `${__timeTo}`.

### Why use Infinity time macros

Use `${__timeFrom}` and `${__timeTo}` instead of Grafana's built-in `${__from}` and `${__to}` variables when making API calls. The Infinity macros are interpolated on the backend, ensuring the time values are correctly passed to external APIs. Grafana's built-in time variables are interpolated on the frontend, which can cause issues with backend data source requests.

For more information about Grafana's built-in time variables, refer to [Global variables](https://grafana.com/docs/grafana/latest/dashboards/variables/add-template-variables/#__from-and-__to).

## Grafana metadata macros

The Infinity data source also supports metadata macros that inject information about the current Grafana context. These are useful for passing user or data source information to APIs.

| Macro | Description |
|-------|-------------|
| `${__org.id}` | Grafana organization ID |
| `${__plugin.id}` | Plugin ID |
| `${__plugin.version}` | Plugin version |
| `${__ds.uid}` | Data source UID |
| `${__ds.name}` | Data source name |
| `${__user.login}` | Current user's login |
| `${__user.email}` | Current user's email |
| `${__user.name}` | Current user's display name |

{{< admonition type="note" >}}
User macros like `${__user.login}` are not available in contexts without a user session, such as alerts, recorded queries, and public dashboards.
{{< /admonition >}}

For more information about URL configuration and allowed hosts, refer to [URL configuration](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/advanced-features/url/).
