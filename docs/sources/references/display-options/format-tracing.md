---
slug: '/tracing'
title: 'Tracing format'
menuTitle: Tracing format
description: Tracing format
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
weight: 7102
---

# Visualizing data in Tracing format

You can visualize your data in the tracing format by configuring the following:

- Select **Trace** as **Format**
- Ensure you have following fields

  - `spanID` - string
  - `parentSpanID` - string
  - `traceID` - string
  - `startTime` - timestamp
  - `duration` - number
  - `serviceName` - string
  - `operationName` - string

  For example, with the following CSV data:

```csv
spanID,parentSpanID,traceID,startTime,duration,serviceName,operationName
s1,,t1,1,10000,router,foo
s2,s1,t1,2,6000,frontend,foo
s3,s1,t1,4,4000,backend,foo
s4,s2,t1,3,1000,parsing,foo
s5,s2,t1,3,1500,formatting,foo
s6,s3,t2,5,2200,db,foo
```

The following UQL query produces a trace view:

```sql
parse-csv
| extend "startTime"=unixtime_seconds_todatetime("startTime")
```
