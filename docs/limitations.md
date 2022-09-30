---
slug: '/wiki/limitations'
title: 'Limitations'
previous_page_title: 'Home'
previous_page_slug: '/welcome'
next_page_title: 'Configuration'
next_page_slug: '/wiki/configuration'
---

Infinity plugin have the following known limitations

- Alerting only supported with `json` type of queries with `backend` as parser (introduced in v1.0.0)
- Recorded queries only supported with `json` type of queries with `backend` as parser (introduced in v1.0.0)
- Alerting only supported with `csv`/`tsv`/`graphql` type of queries with `backend` as parser (introduced in v1.1.0)
- Recorded queries only supported with `csv`/`tsv`/`graphql` type of queries with `backend` as parser (introduced in v1.1.0)
- OAuth authentication support is in early stages. But most of the common cases like "Azure", "GCP", "Google Analytics" authentication are tested. If in case something not working, report [here](https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/260)
- For list of all known bugs, check [here](https://github.com/yesoreyeram/grafana-infinity-datasource/issues)
