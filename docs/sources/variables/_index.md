---
title: Variables
menuTitle: Variables
description: Create dashboard variables using the Infinity data source
aliases:
  - infinity
keywords:
  - infinity
  - variables
  - template variables
  - utility variables
  - dashboard variables
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 45
---

# Variables

The Infinity data source supports two methods for creating dashboard variables.

## Template variables

Use template variables to populate variable options from external data sources like JSON, CSV, or XML APIs. This is the standard and recommended approach for creating dynamic drop-downs.

Template variables work like any other Grafana data source query - you define a query that returns data, and Grafana uses the results to populate the variable options.

[Learn more about template variables](/docs/plugins/yesoreyeram-infinity-datasource/latest/variables/template-variables/)

## Utility variables (legacy)

Use utility variables for string manipulation, lookups, and other helper functions. These are unique to the Infinity data source and provide features like:

- **Collection()** - Create key-value pairs from inline data
- **CollectionLookup()** - VLOOKUP-style lookups based on another variable
- **Join()** - Concatenate strings and variables
- **Random()** - Select random values from a list
- **UnixTimeStamp()** - Generate Unix timestamps

[Learn more about utility variables](/docs/plugins/yesoreyeram-infinity-datasource/latest/variables/utility-variables/)
