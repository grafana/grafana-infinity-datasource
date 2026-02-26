---
slug: '/reference-data'
title: Reference data
menuTitle: Reference data
description: Store small static datasets in your Infinity data source configuration for reuse across queries.
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/references/reference-data/
keywords:
  - infinity
  - reference data
  - static data
  - inline data
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 10
---

# Reference data

Reference data lets you store small static datasets directly in your data source configuration. Use this feature to define data once and query it from multiple dashboards without re-entering the same data in each query.

## Before you begin

- Ensure you have the Infinity data source installed and configured
- Have administrator access to edit the data source configuration

## Use cases

- Store lookup tables for mapping codes to descriptions
- Define static configuration data used across multiple dashboards
- Store small reference datasets that don't change frequently

## Supported formats

Reference data supports the following formats:

- JSON
- CSV
- TSV
- XML
- HTML

## Configure reference data

1. Navigate to **Connections** > **Data sources** and select your Infinity data source.
2. Scroll to the **Reference data** section.
3. Click **Add Reference Data**.
4. Enter a unique **Name** for the reference data (for example, `servers.csv` or `region-codes.json`).
5. Enter the data in the **Data** field using your chosen format.
6. Click **Save & test**.

You can add multiple reference data entries to a single data source instance.

{{< admonition type="note" >}}
Reference data names must be unique within a data source instance. If duplicate names exist, the first matching entry is returned.
{{< /admonition >}}

## Query reference data

1. In the query editor, set **Source** to **Reference**.
2. Select your reference data from the **Reference** drop-down.
3. Configure the **Type** to match your data format (JSON, CSV, XML, etc.).
4. Set the **Format** and configure columns as needed.

## Provision reference data

You can configure reference data through provisioning:

```yaml
apiVersion: 1
datasources:
  - name: Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      refData:
        - name: servers.csv
          data: |
            id,name,region,status
            1,server-a,us-east,active
            2,server-b,eu-west,active
            3,server-c,ap-south,maintenance
        - name: regions.json
          data: |
            [
              {"code": "us-east", "name": "US East"},
              {"code": "eu-west", "name": "EU West"},
              {"code": "ap-south", "name": "Asia Pacific"}
            ]
```

## Size limits

{{< admonition type="warning" >}}
Reference data is designed for small datasets of less than 10 MB. Larger datasets may affect Grafana and plugin performance. For larger datasets, use URL-based queries instead.
{{< /admonition >}}
