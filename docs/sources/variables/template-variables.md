---
slug: '/template-variables'
title: Template variables
menuTitle: Template variables
description: Use template variables to create dynamic dashboards with the Infinity data source
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/variables/
keywords:
  - infinity
  - variables
  - template variables
  - query variables
labels:
  products:
    - oss
weight: 401
---

# Template variables

Instead of hard-coding values such as server names, API endpoints, or filter values in your queries, you can use variables. Grafana displays these variables in drop-down select boxes at the top of the dashboard to help you change the data displayed in your dashboard. Grafana refers to such variables as **template variables**.

For general information on using variables in Grafana, refer to [Add variables](https://grafana.com/docs/grafana/latest/dashboards/variables/add-template-variables/).

For an introduction to templating and template variables, refer to [Templating](https://grafana.com/docs/grafana/latest/dashboards/variables/) and [Variable syntax](https://grafana.com/docs/grafana/latest/dashboards/variables/variable-syntax/).

## Query variable

A query variable in Grafana dynamically retrieves values from your data source using a query. With the Infinity data source, you can create variables populated from JSON, CSV, XML, GraphQL, or any other supported data format.

To create a query variable with the Infinity data source:

1. Navigate to your dashboard settings.
1. Select **Variables** in the left menu.
1. Click **Add variable**.
1. Enter a **Name** for your variable.
1. Select **Query** as the variable type.
1. Select your **Infinity** data source.
1. Select a **Query Type**:
   - **Infinity** - Use a standard Infinity query (JSON, CSV, XML, etc.) to fetch variable options
   - **Legacy** - Use utility functions like `Collection()`, `Join()`, etc. (see [Utility variables](/docs/plugins/yesoreyeram-infinity-datasource/latest/variables/utility-variables/))
   - **Random String** - Enter a list of values and get a random selection on each refresh
1. Configure your query to return the values you want in the drop-down.
1. Click **Apply**.

### Single column results

If your query returns a single column, Grafana uses those values for both the display text and the value.

**Example: JSON API returning a list of servers**

Configure your Infinity query to fetch data from an API endpoint:

- **Type:** JSON
- **URL:** `https://api.example.com/servers`
- **Parser:** Backend

If the API returns:

```json
["server01", "server02", "server03"]
```

The variable drop-down displays all three server names.

### Multiple column results

If your query returns multiple columns, you can specify which field to use as the display text and which field to use as the value.

**Option 1: Return `__text` and `__value` columns**

If your query returns columns named `__text` and `__value`, Grafana automatically uses them for the display text and value respectively. This is a standard Grafana convention supported across data sources.

**Option 2: Use custom field mapping**

In the **Custom field mapping** section of the variable editor:
- **Text field:** The column to display in the drop-down
- **Value field:** The column to use as the variable's value

**Example: JSON API returning servers with IDs**

If your API returns:

```json
[
  {"id": "srv-001", "name": "Production Server"},
  {"id": "srv-002", "name": "Staging Server"},
  {"id": "srv-003", "name": "Development Server"}
]
```

Configure the field mapping:
- **Text field:** `name`
- **Value field:** `id`

The drop-down displays "Production Server", "Staging Server", etc., but the variable value is the corresponding ID.

## Random String query type

The **Random String** query type lets you define a list of values directly in the variable editor. Each time the dashboard loads or refreshes, a random value from the list is selected.

This is useful for testing or demo scenarios where you want different values on each refresh without making an API call.

To use the Random String query type:

1. Select **Random String** as the Query Type.
1. Enter your values in the **Values** field (press Enter after each value).

## Use variables in queries

You can use template variables in your Infinity queries to create dynamic dashboards. Variables can be used in:

- **URL:** Include variables in the API endpoint
- **Request body:** Use variables in POST/PUT request bodies
- **Headers:** Include variables in custom headers
- **UQL/JSONata/GROQ:** Use variables in transformation expressions

Grafana supports two syntaxes for using variables in queries:

### $varname syntax

Use the dollar sign followed by the variable name:

```
https://api.example.com/data?server=$server&env=$environment
```

### ${varname} syntax

Use curly braces for clarity or when the variable name is adjacent to other text:

```
https://api.example.com/servers/${server}/metrics
```

### [[varname]] syntax

Use double square brackets as an alternative syntax:

```
https://api.example.com/data?server=[[server]]
```

## Multi-value variables

When you enable **Multi-value** for a variable, users can select multiple values from the drop-down. The selected values are formatted as a comma-separated list by default.

To control how multi-value variables are formatted, use the [advanced variable format options](https://grafana.com/docs/grafana/latest/dashboards/variables/variable-syntax/#advanced-variable-format-options).

**Example:**

If `$servers` has values `server01` and `server02` selected:

| Format | Syntax | Result |
|--------|--------|--------|
| Default | `$servers` | `server01,server02` |
| CSV | `${servers:csv}` | `server01,server02` |
| JSON | `${servers:json}` | `["server01","server02"]` |
| Pipe | `${servers:pipe}` | `server01\|server02` |

## Chained variables

You can create chained (or dependent) variables where one variable's options depend on the value of another variable.

**Example:**

1. Create a variable `$region` that returns a list of regions.
2. Create a second variable `$server` with a query that includes `$region`:

```
https://api.example.com/servers?region=$region
```

When the user selects a different region, the server drop-down automatically updates to show only servers in that region.
