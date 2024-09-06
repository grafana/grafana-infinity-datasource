---
slug: '/xml'
title: 'XML'
menuTitle: XML
description: XML
hero:
  title: Visualize XML with Infinity
  level: 1
  width: 110
  image: https://www.svgrepo.com/show/375305/xml-document.svg
  height: 110
  description: Visualize XML data from your REST APIs using infinity data source plugin
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
weight: 24
---

{{< docs/hero-simple key="hero" >}}

<hr style="margin-bottom:30px"/>

## 📊 Overview

<div style="margin-bottom:30px"></div>

{{< docs/play title="Infinity plugin XML demo" url="https://play.grafana.org/d/infinity-xml" >}}

The following example, uses an XML response in Grafana:

![image](https://user-images.githubusercontent.com/153843/99292060-a0716e00-2838-11eb-9af8-cf87adfd8fd5.png#center)

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

If you want to get the user's name and age from the preceding XML example, use the following syntax:

Rows/Root: `users.user` to select all the user objects inside the user element.

**Columns:**

Column1 Name: Use `name` as the selector for the property `name`.

Column2 Age: Use `$.age` as the selector for the attribute `age`.

## Example 2

Consider the below example:

```xml
<users>
    <user age="20"> User A</user>
    <user age="21">User B</user>
    <user age="18">User C</user>
</users>
```

If you want to get the user's name and age from the preceding XML example, use the following syntax:

Rows/Root: `users.user` to select all the user objects inside user element.

**Columns:**

Column1 Name: Use `_` as the selector for the property `name`. Here `_` refers to the text inside the node.

Column2 Age: Use `$.age` as the selector for the attribute `age`.

## Example 3

Consider the following example:

```xml
<users>
    <user>User A</user>
    <user>User B</user>
    <user>User C</user>
  </users>
```

If you want to get the user's name and age from the preceding XML example, use the following syntax:

Rows/Root: `users.user` to select all the user objects inside user element

**Columns:**

Column1 Name: Use `_` as the selector for the property `name`. Here `_` refers to the text inside the node

## XML URL

You can also use the hosted XML via the URL. The following example shows how you connect XML using [a GitHub gist](https://gist.githubusercontent.com/yesoreyeram/655a362eed0f51be24e16d3f1127a31d/raw/aa58549a5cf9d06dae1204b5a09be5d651adc744/text.xml).

![image](https://user-images.githubusercontent.com/153843/99293208-39ed4f80-283a-11eb-831e-ae14d297a2f3.png#center)

The following image shows a sample example visualized using bar gauge panel and time series format:

![image](https://user-images.githubusercontent.com/153843/99294213-a9b00a00-283b-11eb-9b8b-26842c2bc69b.png#center)
