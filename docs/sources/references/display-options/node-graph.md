---
slug: '/node-graph'
title: 'Node Graph'
menuTitle: Node Graph
description: Node Graph
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
weight: 7101
---

# Visualizing data in Node Graph format

You can generate Node graph panel data with `CSV`, `JSON` or `XML` feature of Infinity data source.

![image](https://user-images.githubusercontent.com/153843/139112671-dee6a9aa-5165-4526-bc8a-7ce36c45181e.png#center)

From v0.8.0, we have out of the box support for node graph. Prior to v0.8.0, you can use "Table" format to create node graph with limited options.

Regardless of the version, you need two queries to form a Node graph visualization.

1. First query which lists the nodes. Should have mandatory `id` and `title` field. This also can have additional `arc__*` fields to specify the arcs value for the node.
2. Second query which list the edges (relations). Should have three mandatory fields namely `id`, `source` and `target`

Read more about the node graph data structure [here](https://grafana.com/docs/grafana/latest/visualizations/node-graph/)

## Node Graph format

From v0.8.0, infinity plugin have dedicated support for node graphs. You need to create two different queries with the format of `nodes` and `edges` for each query.

### Nodes

Nodes query should have following fields.

- id\*
- title
- subTitle
- arc\_\_\*
- detail\_\_\*

If you have any `arc__*` field, corresponding value (number) will be used as the nodes arc value. Note : Total value of row item should sum to 1. If you need to specify a color for the `arc__*` field, add a new field called `arc__*_color`.

### Edges

Edges query should have following fields.

- id\*
- source\*
- target\*
- detail\_\_\*

works same as **Nodes**. But doesn't support `arc__*` fields.

## Example

Below is an example of nodes query

![image](https://user-images.githubusercontent.com/153843/139114480-bd5c8571-4374-4ec0-8af0-224cc73ba3d8.png#center)

Below is an example of edges query

![image](https://user-images.githubusercontent.com/153843/139114526-5ffabaf1-7722-4205-9347-9496a9485306.png#center)

Corresponding Node Graph is given below

![image](https://user-images.githubusercontent.com/153843/139114591-2203f878-bb7d-4111-aaac-fe3bbc99bd6b.png#center)

Corresponding CSV data is given below

Nodes :

```csv
id,title,sub-title,cpu,memory,c_disk_size,d,c_disk_size color,d color,detail__hello
A,Server A,Application Server,12,10,0.1,0.9,blue,red,world
B,Server B,DB Server,90,87,0.1,0.9,blue,red,hello
C,Server C,Application Server,20,23,0.20,0.80,blue,red,hello
D,Server D,Middleware Server,47,98,0.90,0.10,blue,red,world
```

Edges :

```csv
id,source,target,mainStat,secondaryStat,detail__one
1,A,B,30,mb/s,abc
2,A,C,20,mb/s,def
3,B,D,24.2,mb/s,ghi
```

> Some of the fields of the CSV doesn't match the node graph format. So we used column alias to match the exact field. Also for CSV format, number formats needs to set explicitly. Otherwise, they will be rendered as string.

finally, the panel json looks like this

```json
{
  "id": 23763571993,
  "gridPos": {
    "h": 19,
    "w": 24,
    "x": 0,
    "y": 0
  },
  "type": "nodeGraph",
  "title": "Panel Title",
  "datasource": "Infinity",
  "pluginVersion": "8.2.0",
  "targets": [
    {
      "columns": [
        {
          "selector": "id",
          "text": "",
          "type": "string"
        },
        {
          "selector": "title",
          "text": "",
          "type": "string"
        },
        {
          "selector": "sub-title",
          "text": "subTitle",
          "type": "string"
        },
        {
          "selector": "cpu",
          "text": "mainStat",
          "type": "number"
        },
        {
          "selector": "memory",
          "text": "secondaryStat",
          "type": "number"
        },
        {
          "selector": "c_disk_size",
          "text": "arc__cpu",
          "type": "number"
        },
        {
          "selector": "d",
          "text": "arc__memory",
          "type": "number"
        },
        {
          "selector": "c_disk_size color",
          "text": "arc__cpu_color",
          "type": "string"
        },
        {
          "selector": "d color",
          "text": "arc__memory_color",
          "type": "string"
        },
        {
          "selector": "detail__hello",
          "text": "",
          "type": "string"
        }
      ],
      "data": "id,title,sub-title,cpu,memory,c_disk_size,d,c_disk_size color,d color,detail__hello\nA,Server A,Application Server,12,10,0.1,0.9,blue,red,world\nB,Server B,DB Server,90,87,0.1,0.9,blue,red,hello\nC,Server C,Application Server,20,23,0.20,0.80,blue,red,hello\nD,Server D,Middleware Server,47,98,0.90,0.10,blue,red,world",
      "filters": [],
      "format": "node-graph-nodes",
      "global_query_id": "",
      "refId": "A",
      "root_selector": "",
      "source": "inline",
      "type": "csv",
      "url": "",
      "url_options": {
        "data": "",
        "method": "GET"
      }
    },
    {
      "columns": [],
      "data": "id,source,target,mainStat,secondaryStat,detail__one\n1,A,B,30,mb/s,abc\n2,A,C,20,mb/s,def\n3,B,D,24.2,mb/s,ghi",
      "filters": [],
      "format": "node-graph-edges",
      "global_query_id": "",
      "hide": false,
      "refId": "B",
      "root_selector": "",
      "source": "inline",
      "type": "csv",
      "url": "",
      "url_options": {
        "data": "",
        "method": "GET"
      }
    }
  ]
}
```
