---
'grafana-infinity-datasource': patch
---

🐛 Update framesql to fix a panic in `min()`/`max()` when a field has no numeric values (now returns null)
