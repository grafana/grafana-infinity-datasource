---
'grafana-infinity-datasource': patch
---

Build and publish pipelines uses latest go lang version `1.23.5` which includes security fixes to the `crypto/x509` and `net/http` packages ( CVE-2024-45341 and CVE-2024-45336 ). More details can be found [here](https://groups.google.com/g/golang-announce/c/sSaUhLA-2SI)
