---
title: Data formats
menuTitle: Data formats
description: Learn how to query different data formats with the Infinity data source
keywords:
  - infinity
  - data formats
  - JSON
  - CSV
  - XML
  - GraphQL
  - HTML
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 30
---

# Data formats

The Infinity data source can query and visualize data from multiple formats. Each format has its own configuration options and selector syntax.

## Supported formats

| Format | Description | Use case |
|--------|-------------|----------|
| [JSON](/docs/plugins/yesoreyeram-infinity-datasource/latest/data-formats/json/) | Query JSON APIs and files | REST APIs, most modern web services |
| [CSV](/docs/plugins/yesoreyeram-infinity-datasource/latest/data-formats/csv/) | Query CSV files and endpoints | Spreadsheet exports, data feeds |
| [XML](/docs/plugins/yesoreyeram-infinity-datasource/latest/data-formats/xml/) | Query XML APIs and files | SOAP APIs, RSS feeds, legacy systems |
| [GraphQL](/docs/plugins/yesoreyeram-infinity-datasource/latest/data-formats/graphql/) | Query GraphQL endpoints | GraphQL APIs |
| [HTML](/docs/plugins/yesoreyeram-infinity-datasource/latest/data-formats/html/) | Extract data from HTML pages | Web scraping, legacy systems without APIs |
| [Azure Blob Storage](/docs/plugins/yesoreyeram-infinity-datasource/latest/data-formats/azure-blob-storage/) | Query data from Azure Blob Storage | Cloud storage, Azure integrations |

## Common concepts

All data format queries share these common configuration options:

- **Source**: Where to get the data (URL, inline, Azure Blob, or reference)
- **Root selector**: Path to the array of data rows
- **Columns**: Define which fields to extract and their data types
- **Format**: Output format (table, time series, data frame, etc.)

For advanced data transformation, you can use [UQL](/docs/plugins/yesoreyeram-infinity-datasource/latest/query/uql/) or [GROQ](/docs/plugins/yesoreyeram-infinity-datasource/latest/query/groq/) parsers with any data format.
