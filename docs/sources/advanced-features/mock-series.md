---
slug: '/series'
title: 'Mock series'
menuTitle: Mock series
description: Generate simulated time series data for testing and development.
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/references/series/
keywords:
  - infinity
  - mock data
  - time series
  - testing
  - simulation
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 70
---

# Mock series

The Mock series feature generates simulated time series data without making external API calls. Use this feature for testing dashboards, demonstrating visualizations, or developing queries before connecting to real data sources.

## Before you begin

- Ensure you have the Infinity data source installed and configured

## Create a mock series query

1. In the query editor, select **Series** as the **Type**.
2. Select **Random Walk** or **Expression** as the **Source**.
3. Configure the series options.

## Series options

| Field | Description |
|-------|-------------|
| **Alias** | Name for the series. Supports the `${__series.index}` variable. |
| **Series Count** | Number of series to generate. Default is 1. |
| **Expression** | Mathematical expression to generate values (only for Expression source). |

## Random walk

When you select **Random Walk** as the source, the plugin generates a time series that simulates random fluctuations. Each data point randomly increases, decreases, or stays the same compared to the previous point.

The step interval adjusts automatically based on your dashboard's time range:

| Time range | Step interval |
|------------|---------------|
| Less than 2 days | 1 minute |
| 2–40 days | 1 hour |
| 40 days–13 months | 1 day |
| More than 13 months | 1 week |

## Expression

When you select **Expression** as the source, you can use mathematical expressions to generate precise data patterns. The plugin uses the [mathjs](https://mathjs.org/) library for expression evaluation.

### Available variables

| Variable | Description |
|----------|-------------|
| `$i` | Index of the current data point (0-based). Same as `${__value.index}`. |
| `${__value.index}` | Index of the current data point (0-based). |
| `${__series.index}` | Index of the current series (0-based in expressions, 1-based in alias). |

### Expression examples

| Expression | Description |
|------------|-------------|
| `$i` | Linear growth (0, 1, 2, 3, ...) |
| `$i * 2` | Double the index |
| `sin($i / 10) * 100` | Sine wave |
| `$i ^ 2` | Quadratic growth |
| `100 + sin($i) * 20` | Sine wave centered at 100 |
| `${__series.index} * 10 + $i` | Different baseline per series |

## Series alias

The alias field sets the display name for each series. When generating multiple series, you can use the `${__series.index}` variable to create unique names.

| Alias | Series Count | Result |
|-------|--------------|--------|
| *(empty)* | 1 | Random Walk |
| *(empty)* | 2 | lorem, ipsum (random words) |
| Server | 1 | Server |
| Server | 2 | Server 1, Server 2 |
| `Server ${__series.index} - CPU` | 2 | Server 1 - CPU, Server 2 - CPU |

## Data overrides

Use data overrides to conditionally modify values in the generated series. Access this feature through the **Advanced Options** button.

### Override configuration

Each override consists of:

| Field | Description |
|-------|-------------|
| **Value 1** | Left side of the comparison expression |
| **Operator** | Comparison operator (`=`, `<`, `<=`, `>`, `>=`, `!=`) |
| **Value 2** | Right side of the comparison expression |
| **Override** | Value to use when the condition is true |

### Override variables

| Variable | Description |
|----------|-------------|
| `${__value.index}` | Index of the current data point |
| `${__value.value}` | Current value of the data point |

### Override examples

| Value 1 | Operator | Value 2 | Override | Effect |
|---------|----------|---------|----------|--------|
| `${__value.index}` | `>=` | `10` | `null` | Set values to null after index 10 |
| `${__value.value}` | `>` | `100` | `100` | Cap values at 100 |
| `${__value.index}` | `=` | `5` | `0` | Set the 6th point to 0 |

## Use cases

- **Dashboard development:** Test panel layouts and visualizations before connecting real data
- **Demonstrations:** Show dashboard capabilities without exposing production data
- **Learning:** Experiment with Grafana features using predictable data patterns
- **Alerting tests:** Generate specific patterns to test alert conditions
