---
'grafana-infinity-datasource': patch
---

Fixed an error while determining dataframe type (previously caused issues in alerting & recorded queries when there is a single row of results)
