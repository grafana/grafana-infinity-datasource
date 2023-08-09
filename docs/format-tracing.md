---
slug: '/wiki/tracing'
title: 'Tracing'
previous_page_title: 'Variables'
previous_page_slug: '/wiki/template-variables'
next_page_title: 'Installation'
next_page_slug: '/wiki/installation'
---

You can visualize your data in the tracing format by configuring the following

- Select **Trace** as **Format**
- Ensure you have following fields

  - `spanID` - string
  - `parentSpanID` - string
  - `traceID` - string
  - `startTime` - timestamp
  - `duration` - number
  - `serviceName` - string
  - `operationName` - string

  For example, with the following CSV data

```csv
spanID,parentSpanID,traceID,startTime,duration,serviceName,operationName
s1,,t1,1,10000,router,foo
s2,s1,t1,2,6000,frontend,foo
s3,s1,t1,4,4000,backend,foo
s4,s2,t1,3,1000,parsing,foo
s5,s2,t1,3,1500,formatting,foo
s6,s3,t2,5,2200,db,foo
```

and the following UQL query will produce a trace view

```sql
parse-csv
| extend "startTime"=unixtime_seconds_todatetime("startTime")
```
