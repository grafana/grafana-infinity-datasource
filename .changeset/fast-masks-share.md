---
'grafana-infinity-datasource': patch
---

Add configurable TokenHeaders for OAuth2 token endpoint requests. Users can now specify custom headers (such as Accept, Content-Type, etc.) to send with OAuth2 token requests, fixing compatibility with strict OAuth2 servers that validate headers.
