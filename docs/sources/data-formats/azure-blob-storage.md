---
slug: '/azure-blob-storage'
title: Azure Blob Storage
menuTitle: Azure Blob Storage
description: Query data from Azure Blob Storage with the Infinity data source
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/references/azure-blob-storage/
keywords:
  - infinity
  - Azure Blob Storage
  - Azure
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 60
---

# Azure Blob Storage

{{< admonition type="note" >}}
Azure Blob Storage support is available from Infinity plugin version 2.1.0.
{{< /admonition >}}

Query JSON, CSV, TSV, or XML files stored in Azure Blob Storage directly from Grafana.

## Before you begin

You need the following Azure credentials:

- **Storage account name**: Your Azure Blob Storage account name.
- **Storage account key**: Either the primary or secondary access key for the storage account.

## Configure authentication

To connect to Azure Blob Storage:

1. Open the Infinity data source configuration page.
1. In the **Authentication** section, select **Azure Blob** as the authentication type.
1. Select your **Azure cloud** region:

   | Cloud | Description |
   |-------|-------------|
   | **Azure** | Default Azure public cloud (`blob.core.windows.net`) |
   | **Azure US Government** | Azure Government cloud (`blob.core.usgovcloudapi.net`) |
   | **Azure China** | Azure China cloud (`blob.core.chinacloudapi.cn`) |

1. Enter your **Storage account name**.
1. Enter your **Storage account key**.
1. Click **Save & test** to verify the connection.

## Query Azure Blob Storage

In the query editor, configure the following settings:

| Setting | Description |
|---------|-------------|
| **Type** | Data format of the blob: JSON, CSV, TSV, or XML |
| **Parser** | Backend or UQL |
| **Source** | Azure Blob |
| **Container name** | Name of the Azure Blob Storage container |
| **Blob name** | Name of the blob (file) to retrieve |

{{< admonition type="tip" >}}
You can use Grafana variables in both the container name and blob name fields for dynamic queries.
{{< /admonition >}}

## Supported formats and parsers

Azure Blob Storage supports the following combinations:

| Format | Parsers available |
|--------|-------------------|
| JSON | Backend, UQL, GROQ |
| CSV | Backend, UQL |
| TSV | Backend, UQL |
| XML | Backend, UQL |

Refer to the individual [data format](/docs/plugins/yesoreyeram-infinity-datasource/latest/data-formats/) documentation for details on configuring columns and selectors.
