---
"grafana-infinity-datasource": patch
---

Fix cursor pagination for POST APIs that expect the next page token inside the JSON body. The `body_json` pagination param type is now implemented (cursor value is injected into the request JSON body), exposed in the query editor, and cursor pagination no longer errors when the final page omits the cursor field.
