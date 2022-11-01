---
slug: '/wiki/limitations'
title: 'Limitations'
previous_page_title: 'Home'
previous_page_slug: '/welcome'
next_page_title: 'Configuration'
next_page_slug: '/wiki/configuration'
---

Infinity plugin have the following known limitations

## Alerting, Public Dashboards, Enterprise Recorded Queries, Enterprise Query Caching support

These features only work from 1.0.0 of the plugin and works only when parser is set to **backend**

- JSON supports all the above from 1.0.0
- GraphQL supports all the above from 1.1.0
- CSV supports all the above from 1.1.0
- TSV supports all the above from 1.1.0
- XML supports all the above from 1.2.0

## OAuth support

- OAuth authentication support is in early stages. But most of the common cases like "Azure", "GCP", "Google Analytics" authentication are tested. If in case something not working, report [here](https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/260)

## Other limitations

- For list of all known bugs, check [here](https://github.com/yesoreyeram/grafana-infinity-datasource/issues)
