---
slug: '/network'
title: 'Network'
menuTitle: Network
description: Network configuration of Infinity datasource plugin
hero:
  title: Network configuration for outgoing API requests
  level: 1
  image: https://www.svgrepo.com/show/391924/network.svg
  width: 110
  height: 110
  description: Network configuration for outgoing API requests from Grafana Infinity data source plugin
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
  - network
labels:
  products:
    - oss
weight: 205
---

<!-- markdownlint-configure-file { "MD013": false, "MD033": false, "MD025": false, "MD034": false } -->

{{< docs/hero-simple key="hero" >}}

## Proxy settings

Infinity always send API requests from Grafana server to the underlying downstream server. Sometimes, The requested needs to be routed via proxy servers. In such cases, you can configure the proxy settings by following the instructions below.

Infinity does support following ways to configure your proxy.

- [Proxy from environment variable](#proxy-from-environment-variable) (default)
- [No Proxy](#no-proxy)
- [Proxy URL](#proxy-url)

### Proxy from environment variable

This is the default method used when no other option selected.

If you want your data source to connect via proxy, set the environment appropriate environment variables. `HTTP_PROXY`, `HTTPS_PROXY` and `NO_PROXY`. `HTTPS_PROXY` takes precedence over `HTTP_PROXY` for https requests.

### No Proxy

As the name suggests, All the requests skip the proxy and directly goes to underlying API from grafana server.

### Proxy URL

If you want to setup specific proxy URL for the datasource, you can configure in the datasource config network section.

Proxy URLs can have user name and password if the proxy mode is set to **URL**. You can set the user name in **Proxy User Name** field and the password in **Proxy Password** field.

{{< admonition type="warning" >}}
<br/>Setting up username and password should only be used with legacy sites. RFC 2396 warns that interpreting Userinfo this way <b>is NOT RECOMMENDED, because the passing of authentication information in clear text (such as URI) has proven to be a security risk in almost every case where it has been used.</b>
{{< /admonition >}}

{{< admonition type="note" >}}

- Infinity doesn't send requests to downstream APIs from user browser directly
- Proxy support is available from v0.7.10
- Proxy URL specification in data source config is available from v2.2.0
- Proxy URL username and password in data source config is available from v3.3.0

{{< /admonition >}}
