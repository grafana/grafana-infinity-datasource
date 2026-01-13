---
slug: '/reference-data'
title: 'Reference Data'
menuTitle: Reference Data
description: Reference Data
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
weight: 7002
---

# Reference data

You can add multiple small size static data as reference data in your data source config. Then, you can query them multiple times directly without re-entering the same data in multiple places. You can also use provisioning to configure this reference data.

> Reference data feature is available from plugin version 1.2.0

Reference data name must be unique. If duplicate matches found, first matching record will be returned. Reference name can be any valid string. It is handy to specify suffix to the reference name such as `my list of computers.csv`.

Below is the example on how to configure reference data.

![image](https://user-images.githubusercontent.com/153843/198975951-1642f55d-e2a8-4eab-ae18-b2f2a9d3fce1.png#center)

Below image is the example on how to query it.

![image](https://user-images.githubusercontent.com/153843/198976089-0736c591-2a53-4aac-a58f-00f3c92797f8.png#center)

{{< admonition type="note" >}}
We suggest to add only small size data as reference data.
It's designed to support data of less than 10 MB. Adding data of bigger size may affect the performance of Grafana and the plugin.
{{< /admonition >}}
