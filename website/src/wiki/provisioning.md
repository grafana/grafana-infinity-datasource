---
slug: '/wiki/provisioning'
title: 'Provisioning'
previous_page_title: 'Configuration'
previous_page_slug: '/wiki/configuration'
next_page_title: 'URL'
next_page_slug: '/wiki/url'
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
    oauthPassThru: <<true or false>> -- false by default. Set to true if you want to pass the auth token from grafana
    tlsSkipVerify: <<true or false>> -- false by default
    tlsAuth: <<true or false>> -- false by default
    tlsAuthWithCACert: <<true or false>> -- false by default
    serverName: <<server name that matches in certificate for tlsAuthWithCACert>>
    timeoutInSeconds: <<60>> -- or whatever the timeout you want set. If not set defaults to 60.
  secureJsonData:
    basicAuthPassword: <<YOUR PASSWORD. Example -- MY_Github_PAT_Token>>
    tlsCACert: <<Your TLS cert>>
    tlsClientCert: <<Your client certificate>>
    tlsClientKey: <<Your client key>>
  version: 1
  readOnly: true
```

### Custom headers

If you want to provision custom header, you can use the following syntax

```yaml
jsonData:
  httpHeaderName1: <<Header1 Key>>
  httpHeaderName2: <<Header2 Key>>
  httpHeaderName3: X-API-Token
  httpHeaderName4: <<Header4 Key>>
secureJsonData:
  httpHeaderValue1: <<Header1 Value>>
  httpHeaderValue2: <<Header2 Value>>
  httpHeaderValue2: xxxx-1234-xxxx-yyyy-1234
  httpHeaderValue4: <<Header4 Value>>
```
