---
'grafana-infinity-datasource': patch
---

Fix a connection freeze between Grafana and the plugin under heavy query load by updating google.golang.org/grpc to v1.85.0 ([grpc/grpc-go#9330](https://github.com/grpc/grpc-go/issues/9330))
