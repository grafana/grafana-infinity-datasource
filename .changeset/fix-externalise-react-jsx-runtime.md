---
"grafana-infinity-datasource": patch
---

Externalise `react/jsx-runtime` and `react/jsx-dev-runtime` so the host Grafana provides a version-matched JSX runtime, preventing plugin load failures on Grafana 13.x (React 19) when a bundled dependency imports `react/jsx-runtime`
