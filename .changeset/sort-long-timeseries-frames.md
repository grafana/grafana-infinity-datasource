---
'grafana-infinity-datasource': patch
---

Time series format: sort long frames by time before converting them to wide, so rows that are out of time order no longer collapse every series into one line
