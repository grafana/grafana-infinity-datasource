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

| Setting | Value |
|---------|-------|
| **Root selector** | `users.user` |

| Column selector | Title | Description |
|-----------------|-------|-------------|
| `name` | Name | Selects the `<name>` child element |
| `$.age` | Age | Selects the `age` attribute |

## Example: Text content with attributes

When the element's text content is the value you need, use `_` as the selector.

**XML data**:

```xml
<users>
    <user age="20">User A</user>
    <user age="21">User B</user>
    <user age="18">User C</user>
</users>
```

**Configuration**:

| Setting | Value |
|---------|-------|
| **Root selector** | `users.user` |

| Column selector | Title | Description |
|-----------------|-------|-------------|
| `_` | Name | Selects the text inside `<user>` |
| `$.age` | Age | Selects the `age` attribute |

## Example: Simple text-only elements

**XML data**:

```xml
<users>
    <user>User A</user>
    <user>User B</user>
    <user>User C</user>
</users>
```

**Configuration**:

| Setting | Value |
|---------|-------|
| **Root selector** | `users.user` |

| Column selector | Title |
|-----------------|-------|
| `_` | Name |

## Query XML from a URL

Enter the URL of your XML endpoint or file in the query editor. The plugin fetches and parses the XML data automatically.

**Example URL**: `https://example.com/data.xml`

## Use inline XML data

To provide XML data directly:

1. Set **Source** to **Inline**.
1. Enter your XML data in the data field.
1. Configure the root selector and columns.
