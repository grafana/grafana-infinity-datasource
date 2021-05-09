---
slug: "/wiki/installation"
title: "Installation"
---

There are multiple ways to install this plugin into your grafana instance

### Download and extract zip file

Download the latest zip file from [github](https://github.com/yesoreyeram/grafana-infinity-datasource/releases) and extract into your grafana plugin folder. Then restart Grafana.

### Using grafana-cli

If you are using grafana-cli, execute the following command to install the plugin

```sh
grafana-cli plugins install yesoreyeram-infinity-datasource
```
or

```sh
grafana-cli --pluginUrl <ZIP_FILE_URL> plugins install yesoreyeram-infinity-datasource
```

Example:

```sh
grafana-cli --pluginUrl https://github.com/yesoreyeram/grafana-infinity-datasource/releases/download/v0.6.0-alpha2/yesoreyeram-infinity-datasource-0.6.0.zip plugins install yesoreyeram-infinity-datasource
```

### Using helm chart

If you use helm chart to provision grafana, use the following config to install the plugin

```yml
plugins:
  - <ZIP_FILE_URL>;yesoreyeram-infinity-datasource
```

Example:

```yml
plugins:
  - https://github.com/yesoreyeram/grafana-infinity-datasource/releases/download/v0.6.0-alpha2/yesoreyeram-infinity-datasource-0.6.0.zip;yesoreyeram-infinity-datasource
```
