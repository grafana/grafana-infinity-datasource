---
slug: "/wiki/installation"
title: "Installation"
---

There are multiple ways to install this plugin into your grafana instance

### Install from grafana.com

Download the latest zip file from [grafana.com plugins page](https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/) using the instructions provided there.

### Install from github 

Download the required version of release zip file from [github](https://github.com/yesoreyeram/grafana-infinity-datasource/releases) and extract into your grafana plugin folder. Then restart Grafana.

### Install using grafana-cli

If you are using grafana-cli, execute the following command to install the latest published version of the plugin

```sh
grafana-cli plugins install yesoreyeram-infinity-datasource
```

If you need custom version of the plugin from github, you can install using the following command.

```sh
grafana-cli --pluginUrl <ZIP_FILE_URL> plugins install yesoreyeram-infinity-datasource
```

Example:

```sh
grafana-cli --pluginUrl https://github.com/yesoreyeram/grafana-infinity-datasource/releases/download/v0.6.1/yesoreyeram-infinity-datasource-0.6.1.zip plugins install yesoreyeram-infinity-datasource
```

### Install using helm chart

If you use helm chart to provision grafana, use the following config to install the plugin

```yml
plugins:
  - yesoreyeram-infinity-datasource
```

If you need to install a custom version of the plugin from github.com, you can provide the zip file url

```yml
plugins:
  - <ZIP_FILE_URL>;yesoreyeram-infinity-datasource
```

Example:

```yml
plugins:
  - https://github.com/yesoreyeram/grafana-infinity-datasource/releases/download/v0.6.1/yesoreyeram-infinity-datasource-0.6.1.zip;yesoreyeram-infinity-datasource
```
