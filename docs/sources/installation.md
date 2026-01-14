---
slug: '/installation'
title: Install the Infinity data source
menuTitle: Install
description: Learn how to install the Infinity data source plugin for Grafana.
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/setup/installation/
keywords:
  - infinity
  - installation
  - plugin
  - grafana-cli
  - docker
  - helm
weight: 15
---

# Install the Infinity data source

You can install the Infinity data source plugin using several methods, depending on your Grafana deployment.

## Before you begin

- Grafana 10.4.8 or later.
- Administrator access to your Grafana instance.

## Grafana Cloud

The Infinity data source plugin is available in Grafana Cloud. To install:

1. In your Grafana Cloud stack, navigate to **Administration** > **Plugins**.
1. Search for "Infinity".
1. Click **Install**.

No additional configuration is required for Grafana Cloud installations.

## Install from the Grafana plugin catalog

The simplest way to install the plugin is from the [Grafana plugin catalog](https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/):

1. In Grafana, navigate to **Administration** > **Plugins**.
1. Search for "Infinity".
1. Click **Install**.

Alternatively, visit the [plugin page](https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/?tab=installation) and follow the installation instructions.

## Install using grafana-cli

Use the Grafana CLI to install the latest version:

```shell
grafana-cli plugins install yesoreyeram-infinity-datasource
```

To install a specific version, provide the plugin URL:

```shell
grafana-cli --pluginUrl https://github.com/grafana/grafana-infinity-datasource/releases/download/v2.4.0/yesoreyeram-infinity-datasource-2.4.0.zip plugins install yesoreyeram-infinity-datasource
```

After installation, restart Grafana for the plugin to load.

## Install from GitHub releases

To install manually:

1. Download the desired version from [GitHub releases](https://github.com/grafana/grafana-infinity-datasource/releases).
1. Extract the archive to your Grafana plugins directory (typically `/var/lib/grafana/plugins/`).
1. Restart Grafana.

## Install using Docker

Use the `GF_INSTALL_PLUGINS` environment variable to install the plugin when starting the container:

```shell
docker run -p 3000:3000 -e "GF_INSTALL_PLUGINS=yesoreyeram-infinity-datasource" grafana/grafana:latest
```

To install a specific version:

```shell
docker run -p 3000:3000 -e "GF_INSTALL_PLUGINS=yesoreyeram-infinity-datasource;https://github.com/grafana/grafana-infinity-datasource/releases/download/v2.4.0/yesoreyeram-infinity-datasource-2.4.0.zip" grafana/grafana:latest
```

## Install using Helm

If you deploy Grafana using the [Grafana Helm chart](https://github.com/grafana/helm-charts/tree/main/charts/grafana), add the plugin to your `values.yaml`:

```yaml
plugins:
  - yesoreyeram-infinity-datasource
```

To install a specific version:

```yaml
plugins:
  - https://github.com/grafana/grafana-infinity-datasource/releases/download/v2.4.0/yesoreyeram-infinity-datasource-2.4.0.zip;yesoreyeram-infinity-datasource
```

## Verify installation

After installation:

1. In Grafana, navigate to **Connections** > **Data sources**.
1. Click **Add data source**.
1. Search for "Infinity" — if it appears, the installation was successful.

## Next steps

- [Configure the Infinity data source](/docs/plugins/yesoreyeram-infinity-datasource/latest/configure/)
- [Create your first query](/docs/plugins/yesoreyeram-infinity-datasource/latest/query/)
