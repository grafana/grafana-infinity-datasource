---
slug: '/integrations/azure'
title: Azure API
menuTitle: Azure
description: Connect the Infinity data source to Azure management APIs.
aliases:
  - infinity/azure
  - /azure
keywords:
  - infinity
  - Azure
  - Microsoft
  - API
  - OAuth2
weight: 200
---

# Azure API integration

Connect the Infinity data source to Azure management APIs to query subscriptions, resources, cost data, and security information.

## Before you begin

- Access to the Azure portal with permissions to create app registrations.
- Note your Tenant ID.

## Create an Azure app registration

1. In the [Azure portal](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps), navigate to **Azure Active Directory** > **App registrations**.
1. Click **New registration** and create an application.
1. Navigate to **Certificates & secrets** and create a new client secret.
1. Note down the following values:
   - **Client ID** (Application ID)
   - **Client Secret** (the secret value)
   - **Tenant ID**

1. Assign the app **Reader** or **Monitoring Reader** role to the subscriptions or resources you want to query.

## Configure the data source

1. In Grafana, navigate to **Connections** > **Data sources**.
1. Click **Add data source** and select **Infinity**.
1. Expand the **Authentication** section and select **OAuth2**.
1. Select **Client Credentials** as the OAuth2 type.
1. Configure the following settings:

   | Setting | Value |
   |---------|-------|
   | Client ID | Your Azure app client ID |
   | Client Secret | Your Azure app client secret |
   | Token URL | `https://login.microsoftonline.com/<TENANT_ID>/oauth2/token` |
   | Scopes | Leave empty |

1. Add an endpoint parameter:
   - **Key**: `resource`
   - **Value**: `https://management.azure.com/`

1. In **Allowed hosts**, enter `https://management.azure.com/`.
1. Click **Save & test**.

## Query Azure APIs

After configuration, you can query Azure management APIs.

### Example: List subscriptions

1. In the query editor, configure:
   - **Type**: JSON
   - **Source**: URL
   - **Parser**: Default, Backend, or UQL
   - **URL**: `https://management.azure.com/subscriptions?api-version=2020-01-01`

1. Click **Run query** to see your Azure subscriptions.

### More Azure API examples

Refer to the [Azure REST API documentation](https://learn.microsoft.com/en-us/rest/api/azure/) for available endpoints:

- **List resource groups**: `https://management.azure.com/subscriptions/{subscriptionId}/resourcegroups?api-version=2021-04-01`
- **List virtual machines**: `https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Compute/virtualMachines?api-version=2023-03-01`
- **Cost management**: `https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-03-01`
