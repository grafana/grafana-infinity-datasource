---
slug: '/wiki/installation'
title: 'Installation'
previous_page_title: 'Home'
previous_page_slug: '/welcome'
next_page_title: 'Configuration'
next_page_slug: '/wiki/configuration'
---

There are multiple ways to install this plugin into your grafana instance

### Install from grafana.com

Install the plugin from [grafana.com plugins page](https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/?tab=installation) using the instructions provided there. With this installation, you will get the latest published version of the plugin.

### Install from github

Download the required version of release zip file from [github](https://github.com/yesoreyeram/grafana-infinity-datasource/releases) and extract into your grafana plugin folder. Then restart Grafana.

### Install using grafana-cli

If you are using grafana-cli, execute the following command to install the latest published version of the plugin

```shell
grafana-cli plugins install yesoreyeram-infinity-datasource
```

If you need custom version of the plugin from github, you can install using the following command.

```shell
grafana-cli --pluginUrl <ZIP_FILE_URL> plugins install yesoreyeram-infinity-datasource
```

Example:

```shell
grafana-cli --pluginUrl https://github.com/yesoreyeram/grafana-infinity-datasource/releases/download/v0.8.7/yesoreyeram-infinity-datasource-0.8.7.zip plugins install yesoreyeram-infinity-datasource
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
  - https://github.com/yesoreyeram/grafana-infinity-datasource/releases/download/v0.8.7/yesoreyeram-infinity-datasource-0.8.7.zip;yesoreyeram-infinity-datasource
```

### Install using docker

With docker, you can install the plugin using the following command. This will download the latest published version of the plugin from grafana plugins directory.

```shell
docker run -p 3000:3000 -e "GF_INSTALL_PLUGINS=yesoreyeram-infinity-datasource" grafana/grafana:8.4.6
```

If you need to install a custom version of the plugin with docker, use the following command.

```shell
docker run -p 3000:3000 -e "GF_INSTALL_PLUGINS=https://github.com/yesoreyeram/grafana-infinity-datasource/releases/download/v0.8.7/yesoreyeram-infinity-datasource-0.8.7.zip;yesoreyeram-infinity-datasource" grafana/grafana:8.4.6
```
