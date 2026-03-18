---
slug: '/xml'
title: XML
menuTitle: XML
description: Query XML APIs and files with the Infinity data source
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/xml/
keywords:
  - infinity
  - XML
  - SOAP
  - RSS
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 40
---

# XML

Select **XML** as the query type to retrieve data from XML APIs or files. You can query data from a URL or provide inline XML data.

{{< docs/play title="Infinity plugin XML demo" url="https://play.grafana.org/d/infinity-xml" >}}

## Selector syntax

XML selectors use dot notation to navigate the document structure. Special syntax is available for attributes and text content.

| Selector | Description |
|----------|-------------|
| `element.child` | Select child elements |
| `$.attribute` | Select an attribute (prefix with `$`) |
| `_` | Select the text content of an element |

## Example: Elements with child nodes and attributes

**XML data**:

```xml
<users>
    <user age="20">
        <name>User A</name>
    </user>
    <user age="21">
        <name>User B</name>
    </user>
</users>
```

**Configuration**:

| Setting | JSONata parser | JQ parser |
|---------|----------------|-----------|
| **Root selector** | `$.users.user` | `.users.user` |

| Column selector | Title | Description |
|-----------------|-------|-------------|
| `name` | Name | Selects the `<name>` child element |
| `-age` | Age | Selects the `age` attribute |


