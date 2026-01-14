---
slug: '/tracing'
title: Tracing
menuTitle: Tracing
description: Configure data for trace visualization with the Infinity data source
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/references/display-options/format-tracing/
keywords:
  - infinity
  - tracing
  - traces
  - visualization
labels:
  products:
    - oss
weight: 50
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
