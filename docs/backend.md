---
slug: '/wiki/backend'
title: 'Backend Parser'
previous_page_title: 'UQL'
previous_page_slug: '/wiki/uql'
next_page_title: 'GROQ'
next_page_slug: '/wiki/groq'
---

## Backend parser

Backend parser for infinity is introduced in version 1.0.0. Setting the parser to backend in your query editor will allow you to use features such as `alerting`, `grafana expressions` ,`recorded queries`, `enterprise query caching` and `public dashboards`.

Support for backend parser is available for JSON from version 1.0.0.
Support for backend parser is available for CSV/TSV/GraphQL from version 1.1.0.
Support for backend parser is available for XML/HTML from version 1.2.0.

## Root selector / Field selector

For JSON, Data received from the server should be in array format. If not, then the array must be specified by the root selector. Root selector have to be in the format specified by [gjson](https://github.com/tidwall/gjson#path-syntax).

> Backend parser uses gjson style selectors and legacy/default/frontend parser uses lodash type selectors.

## Computed fields

Once you have some fields already and you want to compute new field based on existing columns, you can use computed fields to do. This is something similar to grafana's `Add field from calculation -> Binary Operation` but enhanced with powerful expression language. For example `price * qty` gives the multiplication value of two columns names `price` and `qty`

![calculated fields](https://user-images.githubusercontent.com/153843/196197153-306bbf2a-bc95-4be2-b3ad-75e12c8ea404.png#center)

## Filter

If you want to filter data, you can use filter expression. The expression should yield `true` or `false`. Example: `price > 500`, `name != 'MacBook' && price != null`, `name IN ('MacBook','MacBook Air')` and `!(name IN ('MacBook','MacBook Air'))` are valid filter expressions.

![Filter expression](https://user-images.githubusercontent.com/153843/196344664-33733b04-3ac9-4c00-9c3c-970a9cb63bb3.png)

## Summarize

Backend parser also supports summarizing the fields into a metric. For example, `count(something)` or `max(some-other-thing)` or `mean([some other thing])` can be calculated from the array of data. You can also use numeric options such as `sum`,`min`,`max`,`mean`,`first` and `last`. You can also use expressions like `sum(price) / count(id)`.

When specifying the field name, all special characters must be replaced with `-` and also transformed to lower case. Or the field name can also be specified within square brackets if they contain special characters. For example if the field name is `Something Else!`, then that can be specified like `min(something-else-)` or `min([Something Else!])`.
