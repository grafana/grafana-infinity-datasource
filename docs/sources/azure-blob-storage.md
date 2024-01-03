---
slug: '/azure-blob-storage'
title: 'Azure Blob Storage'
menuTitle: Azure Blob Storage
description: Azure Blob Storage
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
    - enterprise
    - grafana cloud
weight: 704
---

# Azure Blob Storage

> This feature is available only from version 2.1.0

To retrieve docs(json/csv/tsv/xml) from Azure Blob Storage, you need to setup **Azure Blob Storage** type of authentication.

## Authentication

To retrieve content from azure blob storage, you need to provide the following information in the configuration section.

- Choose "Azure Blob Storage" as authentication type
- Provide Azure storage account name
- Provide Azure storage account key ( either primary key or secondary key)

## Retrieving data from azure blob storage

In the query editor, provide the following details

- **Query Type**: json/csv/tsv/xml/html
- **Parser**: backend/uql
- **Source**: Azure Blob
- **Storage container name**:
