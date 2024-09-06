---
slug: '/installation'
title: 'Installation'
menuTitle: Installation
description: This document introduces the Infinity data source
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
weight: 101
---

# Installing Infinity data source plugin

There are multiple ways to install this plugin into your Grafana instance

## Install from grafana.com

Install the plugin from [grafana.com plugins page](https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/?tab=installation) using the instructions provided there. With this installation, you will get the latest published version of the plugin.

## Install from github

Download the required version of release archive from [GitHub](https://github.com/grafana/grafana-infinity-datasource/releases) and extract into your Grafana plugin folder. Then, restart Grafana.

## Install using grafana-cli

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
grafana-cli --pluginUrl https://github.com/grafana/grafana-infinity-datasource/releases/download/v2.4.0/yesoreyeram-infinity-datasource-2.4.0.zip plugins install yesoreyeram-infinity-datasource
```

## Install using helm chart

If you use [grafana helm chart](https://github.com/grafana/helm-charts/blob/grafana-6.32.12/charts/grafana/values.yaml#L482) to provision grafana, use the following config to install the plugin

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
  - https://github.com/grafana/grafana-infinity-datasource/releases/download/v2.4.0/yesoreyeram-infinity-datasource-2.4.0.zip;yesoreyeram-infinity-datasource
```

## Install using Docker

With Docker, you can install the plugin using the following command. This will download the latest published version of the plugin from Grafana plugins directory.

```shell
docker run -p 3000:3000 -e "GF_INSTALL_PLUGINS=yesoreyeram-infinity-datasource" grafana/grafana-enterprise:10.2.3
```

If you need to install a custom version of the plugin with Docker, use the following command:

```shell
docker run -p 3000:3000 -e "GF_INSTALL_PLUGINS=https://github.com/grafana/grafana-infinity-datasource/releases/download/v2.4.0/yesoreyeram-infinity-datasource-2.4.0.zip;yesoreyeram-infinity-datasource" grafana/grafana-enterprise:10.2.3
```
