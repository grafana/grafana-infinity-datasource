---
slug: "/wiki/configuration"
title: "Configuration"
---

Once the plugin installed, you need to create an instance of the datasource. To create an instance follow the steps

* Go to `http://localhost:3000/datasources` and select *Add data source*
* Search for **Infinity** plugin
* Give some name. Any name. Sure; Your kitten names are allowed.
* Select mode as `Basic`
* Save.

If you ever need an URL to be authenticated or proxy through grafana server, you need to use `Advanced` mode.  With advanced mode consider the following.

* Only one domain allowed. (If you need to access multiple domains, use multiple instances of the datasource)
* Specify the domain name as the URL in the datasource settings. This can also contain common url path. Example: `https://api.github.com/graphql`
* While querying, use the remaining part of the the URL. For example, using `/my-endpoint` will yield the final url as `https://api.github.com/graphql/my-endpoint`
