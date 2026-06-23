---
'grafana-infinity-datasource': patch
---

Fix: Handle empty pages in pagination to prevent merge errors

Pagination now gracefully handles empty pages (pages with no data) instead of
failing with "unable to merge fields due to different fields" error. Empty frames
are filtered out before merging paginated results.

Additionally, cursor-based pagination now stops gracefully when the cursor field
is missing from the response (e.g., on the last page), instead of returning an
error.
