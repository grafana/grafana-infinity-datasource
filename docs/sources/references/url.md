---
slug: '/url'
title: 'URL'
menuTitle: URL
description: URL
aliases:
  - infinity
keywords:
  - data source
  - infinity
  - json
  - graphql
  - csv
  - tsv
  - xml
  - html
  - api
  - rest
labels:
  products:
    - oss
weight: 7001
---

# Configuring URL

You can enter any URL in the query URL field. URL must be a valid JSON, CSV, GraphQL, XML, or HTML endpoint.

In the query editor, click the expand icon next the URL field to configure more query URL options like HTTP Method (GET/POST), additional headers and additional query strings.

## Variables in URL

In the query URL, you can use any [grafana global variables](https://grafana.com/docs/grafana/latest/variables/variable-types/global-variables) or any dashboard variables this includes from and to timestamps of the dashboard

For example,

```bash
https://example.com/path/subpath?from=${__from:date:YYYY-MM}&to=${__to:date:YYYY-MM}
```

will produce

```bash
https://example.com/path/subpath?from=2020-01&to=2020-04
```

## Secure keys in the URL query strings

In some cases, you may need to pass the secure API keys as part of your URL. Hard-coding them in the panel is not secure. You can configure those secure keys in the datasource settings.

![image](https://user-images.githubusercontent.com/153843/116439894-f3b80580-a847-11eb-9788-8c60bce00866.png#center)

You can also use Api key authentication for this purpose.

## Headers in the URL

You can configure the headers required for the URL in the datasource config and also in the query headers. By default infinity datasource automatically sets two headers. Header `User-Agent : Go-http-client/1.1` will be set for all requests and `Content-Type : application/json`. You can override these headers in the datasource configuration page.

Note: We suggest adding secure headers only via configuration and not in query.

## Allowed Hosts

Leaving blank will allow all the hosts. This is by default.

If your data source needs to allow only certain hosts, configure the allowed host names in the config. There can be multiple hosts allowed. Host names are case sensitive and needs to be full host name. Example: `https://en.wikipedia.org/`
