---
'grafana-infinity-datasource': patch
---

Add generic backend pagination support for GraphQL/JSON/CSV/TSV/XML/HTML URL queries, including cursor pagination improvements for GraphQL (`replace` first-page handling, `hasNextPage`-aware stopping), plus stronger retry and boundary behavior.
