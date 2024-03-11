---
slug: '/variables'
title: 'Template variables'
menuTitle: Template variables
description: Template variables
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
weight: 401
---

# Creating template variable using Infinity Query

Like panels, you can have your own CSV/JSON in your variable. Variable queries are expected to return one or more columns. This will give you the ability to get your variables set from CSV/JSON/XML or any other external sources.

![image](https://user-images.githubusercontent.com/153843/119243000-d6323f00-bb5a-11eb-822e-99f39b32968d.png#center)

> **Note**: If you want to have variables with different text than its value, then rename the columns to `__text` and `__value` respectively.

<!-- markdownlint-disable MD028 -->

> **Note**: It is always recommended to rename your columns to `__text`/`__value` when having more than 1 column in your variable query. Any other columns except `__text`/`__value` will be ignored when there are more than 1 column. This is useful in scenarios where backend queries require more columns to perform operations such as filtering but want to select only one column for variable.
