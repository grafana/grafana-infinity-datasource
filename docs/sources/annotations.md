---
slug: '/annotations'
title: Annotations
menuTitle: Annotations
description: Create annotations from API data using the Infinity data source
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/annotations/annotations/
keywords:
  - infinity
  - annotations
  - grafana
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 50
---

# Annotations

Annotations allow you to mark points on a graph with events from external data sources. With the Infinity data source, you can create annotations from any API endpoint that returns data in JSON, CSV, XML, GraphQL, or HTML format.

## Before you begin

- You must have a configured Infinity data source. Refer to [Configure the Infinity data source](/docs/plugins/yesoreyeram-infinity-datasource/latest/configure/) for instructions.
- You need Editor or Admin permissions in Grafana to create annotations.

## Create an annotation query

To create an annotation query:

1. Navigate to your dashboard and click the gear icon to open **Dashboard settings**.
1. Select **Annotations** from the settings menu.
1. Click **Add annotation query**.
1. Select your Infinity data source from the **Data source** drop-down.
1. Configure the query to return the required fields.
1. Click **Save dashboard**.

## Query requirements

Annotation queries use the same query editor as regular Infinity queries. Your query must return data with specific columns for annotations to display correctly.

| Column       | Required | Description                                                                                   |
|--------------|----------|-----------------------------------------------------------------------------------------------|
| `time`       | Yes      | A timestamp field that determines where the annotation appears on the time axis.              |
| `timeEnd`    | No       | An end timestamp for range annotations. If omitted, annotations appear as single points.      |
| `text`       | Yes      | The annotation text displayed when hovering over the annotation marker.                       |
| `title`      | No       | A title for the annotation.                                                                   |
| `tags`       | No       | Comma-separated tags for filtering annotations.                                               |

{{< admonition type="note" >}}
Select **Data Frame** as the format for your query. This ensures the data is returned in the correct structure for annotations.
{{< /admonition >}}

### Timestamp column types

When configuring time columns, select the appropriate type based on your data format:

| Type               | Description                                              | Example value                    |
|--------------------|----------------------------------------------------------|----------------------------------|
| **Time**           | Standard date/time strings (ISO 8601, etc.)              | `2024-01-15T10:00:00Z`           |
| **Time (UNIX ms)** | Unix timestamp in milliseconds                           | `1705312800000`                  |
| **Time (UNIX s)**  | Unix timestamp in seconds                                | `1705312800`                     |

### Filter annotations by time range

Use time macros to filter your API data to the dashboard's time range. This improves performance and ensures only relevant annotations are returned.

Include `${__timeFrom}` and `${__timeTo}` in your URL or query parameters:

```
https://api.example.com/events?start=${__timeFrom}&end=${__timeTo}
```

For more information about time macros and formatting options, refer to [Macros](/docs/plugins/yesoreyeram-infinity-datasource/latest/query/macros/).

## Annotation query examples

The following examples demonstrate common annotation use cases.

### JSON API with deployment events

Create annotations from a deployment tracking API:

**URL**: `https://api.example.com/deployments?from=${__timeFrom}&to=${__timeTo}`

**Columns configuration**:

| Selector         | Title       | Type           |
|------------------|-------------|----------------|
| `$.timestamp`    | time        | Timestamp      |
| `$.version`      | text        | String         |
| `$.environment`  | tags        | String         |

### CSV with maintenance windows

Create range annotations from a CSV file containing maintenance schedules:

**URL**: `https://example.com/maintenance.csv`

**Columns configuration**:

| Selector | Title    | Type           |
|----------|----------|----------------|
| 1        | time     | Timestamp      |
| 2        | timeEnd  | Timestamp      |
| 3        | text     | String         |

### Inline data for static annotations

Create static annotations using inline data:

**Source**: Inline

**Data**:

```json
[
  { "time": "2024-01-15T10:00:00Z", "text": "Release v2.0", "tags": "release,production" },
  { "time": "2024-01-20T14:30:00Z", "text": "Database migration", "tags": "maintenance" }
]
```

**Columns configuration**:

| Selector  | Title | Type           |
|-----------|-------|----------------|
| `time`    | time  | Timestamp      |
| `text`    | text  | String         |
| `tags`    | tags  | String         |

## Customize annotation appearance

After creating an annotation query, you can customize its appearance in the annotation settings:

| Setting       | Description                                                                                                |
|---------------|------------------------------------------------------------------------------------------------------------|
| **Name**      | A descriptive name for the annotation query.                                                               |
| **Color**     | Choose a color for the annotation markers. Use different colors to distinguish between annotation types.   |
| **Show in**   | Select which panels display the annotations.                                                               |
| **Hidden**    | Toggle to hide annotations without deleting the query.                                                     |

## Best practices

Follow these recommendations when creating annotations:

1. **Use time macros**: Include `${__timeFrom}` and `${__timeTo}` in your API URL to filter data to the dashboard's time range and improve performance.
1. **Use appropriate time formats**: Ensure your time field uses a format that Grafana can parse, such as ISO 8601, Unix timestamps, or other standard date formats.
1. **Limit results**: If your data source returns many events, consider filtering the data or limiting results to prevent dashboard performance issues.
1. **Create meaningful text**: Use descriptive annotation text that provides context at a glance.
1. **Use tags for filtering**: Include tags to enable filtering annotations in dashboards with multiple annotation sources.

## Troubleshoot annotations

If annotations aren't appearing as expected, try the following solutions.

### Annotations don't appear

- Verify the query returns data by testing it in the Explore view first.
- Check that your query includes a valid time field.
- Ensure **Data Frame** is selected as the format.
- Confirm the annotation query is enabled (not hidden).

### Annotations appear at wrong times

- Verify the time column contains valid timestamps.
- Check your dashboard's timezone settings match the data's timezone.
- Ensure the time column type is set to **Timestamp** in the columns configuration.

### Too many annotations

- Add filters to your query to reduce the number of results.
- Use the dashboard time range to limit the data returned.
- Consider using tags to selectively show annotations on specific panels.
