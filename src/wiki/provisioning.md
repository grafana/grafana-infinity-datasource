---
slug: "/wiki/provisioning"
title: "Provisioning"
previous_page_title: "Configuration"
previous_page_slug: "/wiki/configuration"
next_page_title: "URL"
next_page_slug: "/wiki/url"
---

If you want to [provision](https://grafana.com/docs/grafana/latest/administration/provisioning/#provisioning-grafana) your datasources via grafana provisioning feature, use the following settings

### Basic Provisioning

If you need to provision via file, use the following settings for the basic use cases.

```yaml
- name: <<YOUR DATASOURCE INSTANCE NAME>>
  type: yesoreyeram-infinity-datasource
  access: proxy
  isDefault: false
  version: 1
  jsonData:
       tlsSkipVerify: false
  readOnly: true
```

### Advanced Provisioning

If you need an advanced version of the datasource, use the following format.

```yaml
- name: <<YOUR DATASOURCE INSTANCE NAME. Example -- Github>>
  type: yesoreyeram-infinity-datasource
  access: proxy
  isDefault: false
  url: <<YOUR URL. can be empty>>
  basicAuth: true
  basicAuthUser: <<YOUR USER NAME. Example -- github_id>>
  jsonData:
       tlsSkipVerify: <<true or false>> -- false by default
       tlsAuth: <<true or false>> -- false by default
       tlsAuthWithCACert: <<true or false>> -- false by default
       serverName: <<server name that matches in certificate for tlsAuthWithCACert>>
       local_sources_options:
          enabled: <<true or false>> -- false by default 
          allowed_paths:
               - /etc/path1
               - /some/other/path
  secureJsonData:
       basicAuthPassword: <<YOUR PASSWORD. Example -- MY_Github_PAT_Token>>
       tlsCACert: <<Your TLS cert>>
       tlsClientCert: <<Your client certificate>>
       tlsClientKey: <<Your client key>>
  version: 1
  readOnly: true
```
