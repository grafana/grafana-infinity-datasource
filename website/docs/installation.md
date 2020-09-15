---
id: installation
title: Datasource Installation
sidebar_label: Installation
slug: /installation
---

## Installation

There are multiple ways to install this plugin into your grafana instance

### Download and extract zip file

Download the zip file from [github](https://github.com/yesoreyeram/grafana-infinity-datasource/archive/master.zip) and extract into your grafana plugin folder. Then restart Grafana.

### Using grafana-cli

If you are using grafana-cli, execute the following command to install the plugin

```
grafana-cli --pluginUrl https://github.com/yesoreyeram/grafana-infinity-datasource/archive/master.zip plugins install yesoreyeram-infinity-datasource
```

### Using helm chart

If you use helm chart to provision grafana, use the following config to install the plugin

```
plugins:
  - https://github.com/yesoreyeram/grafana-infinity-datasource/archive/master.zip;yesoreyeram-infinity-datasource
```
