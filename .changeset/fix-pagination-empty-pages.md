---
'grafana-infinity-datasource': patch
---

Fix paginated queries failing with a merge error when a page returns an empty result, and stop fetching further pages once an empty or short page is received
