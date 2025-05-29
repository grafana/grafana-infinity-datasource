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

For more information, refer to [Configuring URL](/docs/yesoreyeram-infinity-datasource/<INFINITY_PLUGIN_VERSION>/references/url/).

## Network

For configuring network settings such as proxy setting, Refer the [Network Documentation](/docs/plugins/yesoreyeram-infinity-datasource/latest/setup/configuration/network/)

## Health check

{{< shared id="health-check" >}}
The settings for the Infinity data source on the configuration page don't automatically validate the URL. To ensure that your settings, including authentication and API keys, are valid, you need to enable the custom health check in the **Health check** section of the **Configuration** page.

{{< admonition type="note" >}}
The custom health check supports only HTTP GET methods. It verifies the response status code, specifically looking for an HTTP 200 status, but doesn't check the content of the response.
{{< /admonition >}}
{{< /shared >}}

### Troubleshooting

If you receive a `Health check failed` message after you click **Save & Test**, check the URL to ensure it's valid and you entered it correctly.

## Allowing dangerous HTTP methods

By default infinity only allow GET and POST HTTP methods to reduce the risk of destructive payloads. But through configuration, you can allow other methods such as `PATCH`,`POST` and `DELETE` for any unconventional use cases. If you need to make use of this feature, Enable the `Allow dangerous HTTP methods` setting under URL section of the datasource config

> This feature is only available from infinity plugin version v3.0.0

{{< admonition type="warning" >}}
Infinity doesn't validate any permissions against the underlying API. Enable this setting with caution as this can potentially perform any destructive action in the underlying API.
{{< /admonition >}}
