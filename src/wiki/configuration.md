---
slug: "/wiki/configuration"
title: "Configuration"
---

Once the plugin installed, you need to create an instance of the datasource. To create an instance follow the steps

* Go to `http://localhost:3000/datasources` and select *Add data source*
* Search for **Infinity** plugin
* Give some name to your datasource
* Save.

This datasource can work out of the box without any additional configuration. If you need the URL to be authenticated or pass additional headers/query/tls settings, configure the corresponding section.

* Configuration will be applied to all the queries. If you need different configuration for different queries, create separate instance of infinity datasource

* If you configure the URL in the settings, the same will be prefixed along with all your queries.

> If you specify the URL as `https://example.com/path` in your datasource config and `/my-endpoint` as your url in the query, then the final URL will be `https://example.com/path/my-endpoint`

More details about the URL and related settings can be found in [url](/wiki/url) page
