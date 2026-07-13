---
"grafana-infinity-datasource": patch
---

Fix variable editor crash when the query returns a field without a name, such as when adding a new column with an empty selector while using the JSONata or JQ backend parsers
