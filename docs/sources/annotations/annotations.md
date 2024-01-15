---
slug: '/annotations'
title: 'Annotations'
menuTitle: Annotations
description: Annotations
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
    - enterprise
    - grafana cloud
weight: 501
---

# Annotations

![image](https://user-images.githubusercontent.com/153843/122909970-9de67200-d34d-11eb-96d3-2c236d8a7a5d.png#center)

You can annotation data from API using Grafana's annotations feature. To add annotation, select the infinity data source as your annotation source. You can create annotation from JSON, CSV, XML, GraphQL endpoints. Source of annotation can be inline or remote URL as well.

> Make sure to select "Data Frame" as format.

To create annotations, you need to specify a time field and a string field. Make sure your query return at least these two fields.

![image](https://user-images.githubusercontent.com/153843/122910054-b191d880-d34d-11eb-9077-14a3b260c333.png#center)

> Annotations is supported from plugin version 0.7.4
