---
slug: '/utility-variables'
title: Utility variables
menuTitle: Utility variables
description: Use utility variable functions for string manipulation, lookups, and other helper operations in Grafana dashboards
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/variables/legacy-variables/
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/legacy-variables/
keywords:
  - infinity
  - variables
  - utility variables
  - collection
  - lookup
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 411
---

# Utility variables

Utility variables are built-in functions for string manipulation, lookups, and value generation. Unlike template variables that query external data sources, utility variables create values directly without making API calls.

To use utility variables, create a new variable in your dashboard and select **Infinity** as the data source. Then enter one of the following function syntaxes in the query field.

## Available functions

| Function | Purpose |
|----------|---------|
| [Collection](#collection) | Create a drop-down with static key-value pairs |
| [CollectionLookup](#collectionlookup) | Return a value based on another variable (like VLOOKUP) |
| [Join](#join) | Concatenate multiple strings or variables |
| [Random](#random) | Return a randomly selected value from a list |
| [UnixTimeStamp](#unixtimestamp) | Generate Unix timestamps with optional time shifts |

## Collection

Use `Collection()` to create a variable with predefined key-value pairs. This is useful when you need a drop-down with static options where the display text differs from the underlying value.

**Syntax:**

```
Collection(DisplayText1,value1,DisplayText2,value2,...)
```

**Example:**

The following query creates a drop-down with four environment options:

```
Collection(Prod,pd,Non Prod,np,Development,dev,SIT,sit)
```

This produces the following variable options:

| Display text | Value |
|--------------|-------|
| Prod | pd |
| Non Prod | np |
| Development | dev |
| SIT | sit |

When a user selects "Prod" from the drop-down, the variable value is `pd`.

{{< admonition type="note" >}}
If you omit a value, the display text is used as both the display text and value. For example, `Collection(Prod,pd,Development)` creates two options: "Prod" with value `pd`, and "Development" with value `Development`.
{{< /admonition >}}

## CollectionLookup

Use `CollectionLookup()` to return a value based on another variable, similar to VLOOKUP in spreadsheet applications. This is useful when you need one variable's value to be derived from another variable's selection.

**Syntax:**

```
CollectionLookup(key1,value1,key2,value2,...,keyN,valueN,$VariableToLookup)
```

The last parameter must be the variable to look up. The function returns the value that corresponds to the matching key.

**Example:**

The following query returns a server name based on the value of the `$Environment` variable:

```
CollectionLookup(pd,prod-server,np,nonprod-server,dev,dev-server,$Environment)
```

| If `$Environment` equals | The function returns |
|--------------------------|----------------------|
| pd | prod-server |
| np | nonprod-server |
| dev | dev-server |

{{< admonition type="note" >}}
If multiple keys in the collection match the lookup variable, the function returns all matching values.
{{< /admonition >}}

## Join

Use `Join()` to concatenate multiple strings or variables into a single value.

**Syntax:**

```
Join(string1,string2,...,stringN)
```

**Example:**

The following query combines an environment variable, a separator, and a server name variable:

```
Join($Environment,-hello-,$ServerName)
```

If `$Environment` is `prod` and `$ServerName` is `web01`, the result is `prod-hello-web01`.

## Random

Use `Random()` to return a randomly selected value from a list. This is useful for testing, demos, or any scenario where you want a different value on each dashboard refresh.

**Syntax:**

```
Random(value1,value2,...,valueN)
```

**Example:**

The following query randomly returns one of three values:

```
Random(A,B,C)
```

{{< admonition type="tip" >}}
Set the variable to refresh **On time range change** so that a new random value is selected each time the dashboard refreshes.
{{< /admonition >}}

## UnixTimeStamp

Use `UnixTimeStamp()` to return the current Unix timestamp, optionally with a relative time shift.

{{< admonition type="note" >}}
This function is in alpha and may change in future releases.
{{< /admonition >}}

**Basic syntax:**

| Function | Returns |
|----------|---------|
| `UnixTimeStamp()` | Current timestamp in milliseconds |
| `UnixTimeStamp(s)` | Current timestamp in seconds |
| `UnixTimeStamp(ms)` | Current timestamp in milliseconds |

**Relative time shift syntax:**

You can add or subtract time from the current timestamp using the following format:

```
UnixTimeStamp(offset,format)
```

Where `offset` is a number followed by a time unit, and `format` is `s` (seconds) or `ms` (milliseconds).

| Unit | Description |
|------|-------------|
| `d` | Days |
| `h` | Hours |
| `m` | Minutes |
| `s` | Seconds |
| `ms` | Milliseconds |

**Examples:**

| Function | Returns |
|----------|---------|
| `UnixTimeStamp(30d)` | Timestamp 30 days in the future (milliseconds) |
| `UnixTimeStamp(-30d)` | Timestamp 30 days in the past (milliseconds) |
| `UnixTimeStamp(30h,s)` | Timestamp 30 hours in the future (seconds) |
| `UnixTimeStamp(-7d,s)` | Timestamp 7 days in the past (seconds) |