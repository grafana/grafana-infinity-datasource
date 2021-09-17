---
slug: '/wiki/configuration'
title: 'Configuration'
previous_page_title: 'Installation'
previous_page_slug: '/wiki/installation'
next_page_title: 'Provisioning'
next_page_slug: '/wiki/provisioning'
---

Once the plugin installed, you need to create an instance of the datasource. To create an instance follow the steps

- Go to `http://localhost:3000/datasources` and select _Add data source_
- Search for **Infinity** plugin
- Give a name to your datasource
- Save.

![image](https://user-images.githubusercontent.com/153843/118472644-f4ceab00-b700-11eb-89e1-eec404755cd0.png#center)

This datasource can work out of the box without any additional configuration. If you need the URL to be authenticated or pass additional headers/query/tls/timeout settings, configure the corresponding section.

- Configuration will be applied to all the queries. If you need different configuration for different queries, create separate instance of infinity datasource

- If you configure the URL in the settings, the same will be prefixed along with all your queries.

> If you specify the URL as `https://example.com/path` in your datasource config and `/my-endpoint` as your url in the query, then the final URL will be `https://example.com/path/my-endpoint`

More details about the URL and related settings can be found in [url](/wiki/url) page
