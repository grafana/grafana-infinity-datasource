---
slug: '/node-graph'
title: Node graph
menuTitle: Node graph
description: Configure data for Node Graph visualization with the Infinity data source.
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/references/display-options/node-graph/
keywords:
  - infinity
  - node graph
  - visualization
  - network
labels:
  products:
    - oss
weight: 40
---

# Node graph

The Node Graph visualization displays relationships between entities as an interactive graph. Use the Infinity data source to transform your API data into the format required by the Node Graph panel.

For general information about the Node Graph panel, refer to [Node graph](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/node-graph/).

## Before you begin

- Ensure you have the Infinity data source installed and configured
- Familiarize yourself with the Node Graph panel requirements

## Supported data formats

You can create Node Graph visualizations from the following data formats:

- JSON
- CSV
- XML
- GraphQL

## Query structure

A Node Graph visualization requires **two queries**:

| Query | Format | Purpose |
|-------|--------|---------|
| Query A | `Nodes - Node Graph` | Defines the nodes (entities) in the graph |
| Query B | `Edges - Node Graph` | Defines the edges (relationships) between nodes |

## Nodes query

The nodes query defines the entities displayed in the graph.

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier for the node |

### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Primary label displayed on the node |
| `subTitle` | String | Secondary label displayed below the title |
| `mainStat` | String/Number | Primary statistic shown on the node |
| `secondaryStat` | String/Number | Secondary statistic shown on the node |
| `arc__*` | Number | Arc segment value (must sum to 1 across all arc fields) |
| `arc__*_color` | String | Color for the corresponding arc segment |
| `detail__*` | String | Additional details shown in the node tooltip |

### Arc fields

Arc fields create colored segments around the node perimeter. The values must be between 0 and 1, and all arc values for a single node should sum to 1.

To specify colors for arc segments, add a corresponding `_color` field:

| Arc field | Color field |
|-----------|-------------|
| `arc__cpu` | `arc__cpu_color` |
| `arc__memory` | `arc__memory_color` |

## Edges query

The edges query defines the relationships between nodes.

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier for the edge |
| `source` | String | ID of the source node |
| `target` | String | ID of the target node |

### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| `mainStat` | String/Number | Primary statistic shown on the edge |
| `secondaryStat` | String/Number | Secondary statistic shown on the edge |
| `detail__*` | String | Additional details shown in the edge tooltip |

{{< admonition type="note" >}}
Edges do not support arc fields.
{{< /admonition >}}

## Example

The following example creates a simple network visualization with four servers.

### Nodes data (CSV)

```csv
id,title,subTitle,mainStat,secondaryStat,arc__cpu,arc__memory,arc__cpu_color,arc__memory_color,detail__role
A,Server A,Application Server,12,10,0.1,0.9,blue,red,Frontend
B,Server B,DB Server,90,87,0.1,0.9,blue,red,Database
C,Server C,Application Server,20,23,0.2,0.8,blue,red,Backend
D,Server D,Middleware Server,47,98,0.9,0.1,blue,red,Cache
```

### Edges data (CSV)

```csv
id,source,target,mainStat,secondaryStat,detail__protocol
1,A,B,30,mb/s,TCP
2,A,C,20,mb/s,HTTP
3,B,D,24.2,mb/s,TCP
```

### Query configuration

**Query A (Nodes):**
1. Set **Type** to **CSV**.
2. Set **Source** to **Inline** and paste the nodes CSV data.
3. Set **Format** to **Nodes - Node Graph**.
4. Configure columns to map CSV fields to node graph fields, ensuring numeric fields use the `number` type.

**Query B (Edges):**
1. Set **Type** to **CSV**.
2. Set **Source** to **Inline** and paste the edges CSV data.
3. Set **Format** to **Edges - Node Graph**.

## Column mapping

When your source data uses different field names than the Node Graph format requires, use column aliases to map them.

| Source field | Alias (Node Graph field) | Type |
|--------------|--------------------------|------|
| `cpu` | `mainStat` | number |
| `memory` | `secondaryStat` | number |
| `sub-title` | `subTitle` | string |
| `disk_usage` | `arc__disk` | number |

{{< admonition type="note" >}}
For CSV data, explicitly set numeric columns to the `number` type. Otherwise, they render as strings and may not display correctly.
{{< /admonition >}}

## JSON example

For JSON data, configure the root selector to extract the array of nodes or edges:

**Nodes query:**

```json
{
  "nodes": [
    { "id": "A", "title": "Server A", "arc__cpu": 0.3, "arc__memory": 0.7 },
    { "id": "B", "title": "Server B", "arc__cpu": 0.8, "arc__memory": 0.2 }
  ]
}
```

Set the root selector to `nodes` and the format to **Nodes - Node Graph**.

**Edges query:**

```json
{
  "edges": [
    { "id": "1", "source": "A", "target": "B", "mainStat": "100 req/s" }
  ]
}
```

Set the root selector to `edges` and the format to **Edges - Node Graph**.
