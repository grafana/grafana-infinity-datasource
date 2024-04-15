---
slug: '/xml'
title: 'XML'
menuTitle: XML
description: XML
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

# Visualizing XML data

{{< docs/play title="Infinity plugin XML demo" url="https://play.grafana.org/d/infinity-xml" >}}

In the below example, we are going to see how to use xml response in grafana

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

In the above example XML, we want list the user's name and age. So use the below syntax

Rows/Root : `users.user` to select all the user objects inside user element

**Columns:**

Column1 Name : Use `name` as the selector for the property `name`

Column2 Age : Use `$.age` as the selector for the attribute `age`

## Example 2

Consider the below example

```xml
<users>
    <user age="20"> User A</user>
    <user age="21">User B</user>
    <user age="18">User C</user>
</users>
```

In the above example XML, we want list the user's name and age. So use the below syntax

Rows/Root : `users.user` to select all the user objects inside user element

**Columns:**

Column1 Name : Use `_` as the selector for the property `name`. Here `_` refers to the text inside the node

Column2 Age : Use `$.age` as the selector for the attribute `age`

## Example 3

Consider the below example

```xml
<users>
    <user>User A</user>
    <user>User B</user>
    <user>User C</user>
  </users>
```

In the above example XML, we want list the user's name. So use the below syntax

Rows/Root : `users.user` to select all the user objects inside user element

**Columns:**

Column1 Name : Use `_` as the selector for the property `name`. Here `_` refers to the text inside the node

## XML URL

You can also use the hosted XML via the URL. Example shown below demonstrates how we connect XML from this [gist](https://gist.githubusercontent.com/yesoreyeram/655a362eed0f51be24e16d3f1127a31d/raw/aa58549a5cf9d06dae1204b5a09be5d651adc744/text.xml).

![image](https://user-images.githubusercontent.com/153843/99293208-39ed4f80-283a-11eb-831e-ae14d297a2f3.png#center)

Sample example visualized using bar gauge panel and timeseries format.

![image](https://user-images.githubusercontent.com/153843/99294213-a9b00a00-283b-11eb-9b8b-26842c2bc69b.png#center)
