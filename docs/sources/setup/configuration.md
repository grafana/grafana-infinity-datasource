---
slug: '/configuration'
title: 'Configuration'
menuTitle: Configuration
description: Configuration of Infinity datasource plugin
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
weight: 201
---

# Configuring Infinity data source plugin

After the plugin is installed, you need to create an instance of the data source:

1. Go to `http://localhost:3000/datasources` and select **Add data source**
1. Search for the **Infinity** plugin
1. Give a name to your datasource
1. Save.

![image](https://user-images.githubusercontent.com/153843/118472644-f4ceab00-b700-11eb-89e1-eec404755cd0.png#center)

This data source can work out of the box without any additional configuration. If you need the URL to be authenticated or pass additional headers/query/tls/timeout settings, configure the corresponding section.

- Configuration will be applied to all the queries. If you need different configuration for different queries, create separate instances of the data source. 

- If you configure the URL in the settings, the same will be prefixed along with all your queries.

> If you specify the URL as `https://example.com/path` in your datasource config and `/my-endpoint` as your url in the query, then the final URL will be `https://example.com/path/my-endpoint`.

For more information, refer to [Configuring URL](/docs/plugins/yesoreyeram-infinity-datasource/<INFINITY_PLUGIN_VERSION>/references/url/).

## Health check

When you save the Infinity datasource settings in the config page, by default this will just save the settings and will not perform any validation against any URLs. If you want to validate the settings such as authentication or API keys, then you must enable the custom health check in the health check section of the configuration page.

> Currently only HTTP GET methods are supported in the custom health check. Also custom health checks only validate the response status code HTTP 200 and doesn't perform any validation against the response content.

## Proxy outgoing requests

If you want your data source to connect via proxy, set the environment appropriate environment variables. HTTP_PROXY, HTTPS_PROXY and NO_PROXY. HTTPS_PROXY takes precedence over HTTP_PROXY for https requests.

> proxy support is available from v0.7.10

If you want to setup specific proxy URL for the datasource, you can configure in the datasource config network section.

> Proxy URL specification in data source config is available from v2.2.0
