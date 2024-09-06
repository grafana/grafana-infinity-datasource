---
slug: '/azure'
title: 'Azure API'
menuTitle: Azure API
description: Azure API
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
weight: 8200
---

# Azure Authentication

Here are the detailed steps on how to connect Microsoft Azure APIs:

1. Create a new service client in [Azure portal](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)
2. Create a client secret for the client created above
3. Note down the Client ID, Client Secret and Tenant ID
4. Give reader/monitoring reader access to the resources/subscriptions as necessary
5. Install the infinity plugin in Grafana and add data source for the same
   1. Expand Authentication section and select "OAuth2"
   2. Select "Client Credentials" as OAuth2 type
   3. Specify the Client ID
   4. Specify the Client Secret
   5. Specify the Token URL `https://login.microsoftonline.com/<TENANT_ID>/oauth2/token`. Replace `<TENANT_ID>` with yours
   6. Leave the Scopes section empty
   7. Add the following Endpoint param
      1. Key : `resource` Value: `https://management.azure.com/`
   8. If you are using Infinity 1.0.0+, then also specify `https://management.azure.com/` as an allowed URL.
6. Click Save and Test.
7. Click the `Explore` button
8. Configure the query
   1. Specify `json` as query type
   2. Specify `url` as source
   3. Specify `default` parser (only applicable for Infinity 1.0.0+)
   4. Specify `table` as format
   5. Method : GET
   6. URL : `https://management.azure.com/subscriptions?api-version=2020-01-01`
9. Click **Run Query** to see the results

## Config Editor

![Config Editor](https://user-images.githubusercontent.com/153843/190214740-c8b548f9-ef64-4399-941f-41df5f631fdc.png)

## Query using Default Parser

![Query using Default Parser](https://user-images.githubusercontent.com/153843/190215987-d21424dd-f12e-4ea3-be79-f2959e960dc0.png)

## Query using Backend Parser

![Query using Backend Parser](https://user-images.githubusercontent.com/153843/190216309-12a8f8f7-3a9d-4b90-bc48-0919b0a94e72.png)

## Query using UQL Parser

![UQL](https://user-images.githubusercontent.com/153843/190216710-d39d779c-d984-4fe8-b450-f55ebfcd6496.png)
