---
slug: '/provisioning'
title: 'Provisioning'
menuTitle: Provisioning
description: Provisioning
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
weight: 291
---

# Provisioning datasources

If you want to [provision](https://grafana.com/docs/grafana/latest/administration/provisioning/#provisioning-grafana) your data sources via Grafana provisioning feature, use the following settings.

## Basic Provisioning

If you need to provision via file, use the following settings for the basic use cases:

```yaml
- name: <<YOUR DATASOURCE INSTANCE NAME>>
  type: yesoreyeram-infinity-datasource
```

## Advanced Provisioning

If you need an advanced version of the datasource, use the following format:

```yaml
- name: <<YOUR DATASOURCE INSTANCE NAME. Example -- Github>>
  type: yesoreyeram-infinity-datasource
  basicAuth: true
  basicAuthUser: <<YOUR USER NAME. Example -- github_id>>
  jsonData:
    auth_method: 'basicAuth'
    allowedHosts:
      - 'https://foo.com/bar'
      - 'https://example.com'
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
```

For more advanced configuration, refer **Generate provisioning yaml file** section of this document:

## Custom headers

If you want to provision a custom header, you can use the following syntax:

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

## More examples

For more examples of provisioning such as `oauth2`, etc, use provisioning section of the Infinity data source config. You will be able to generate provisioning file by manually configuring the data source.

## Generate provisioning yaml file

Once can manually configure the data source an you have verified it is working, you can generate the provisioning YAML file from the data source config page itself. Look for `Provisioning Script` button at the bottom of the config page inside **more** section.
