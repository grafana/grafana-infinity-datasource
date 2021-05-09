---
slug: "/wiki/provisioning"
title: "Provisioning"
---

If you want to [provision](https://grafana.com/docs/grafana/latest/administration/provisioning/#provisioning-grafana) your datasources via grafana provisioning feature, use the following settings

### Basic Provisioning

If you need to provision via file, use the following settings for the basic use cases.

```yaml
- name: <<YOUR DATASOURCE INSTANCE NAME>>
  type: yesoreyeram-infinity-datasource
  access: proxy
  isDefault: false
  jsonData:
       datasource_mode: "basic"
  version: 1
  readOnly: true
```

### Advanced Provisioning

If you need an advanced version of the datasource, use the following format.

```yaml
- name: <<YOUR DATASOURCE INSTANCE NAME. Example -- Github>>
  type: yesoreyeram-infinity-datasource
  access: proxy
  isDefault: false
  url: <<YOUR URL. Example -- https://api.github.com/graphql>>
  basicAuth: true
  basicAuthUser: <<YOUR USER NAME. Example -- github_id>>
  jsonData:
       datasource_mode: "advanced"
  secureJsonData:
       basicAuthPassword: <<YOUR PASSWORD. Example -- MY_Github_PAT_Token>>
  version: 1
  readOnly: true
```
