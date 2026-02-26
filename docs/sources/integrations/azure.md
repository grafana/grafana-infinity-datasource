---
slug: '/integrations/azure'
title: Azure API
menuTitle: Azure
description: Connect the Infinity data source to Azure management APIs.
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/examples/azure/
keywords:
  - infinity
  - Azure
  - Microsoft
  - API
  - OAuth2
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 200
---

# Azure API integration

Connect the Infinity data source to Azure management APIs to query subscriptions, resources, cost data, and security information.

## Before you begin

- Access to the Azure portal with permissions to create app registrations
- Note your Azure Tenant ID

## Create an Azure app registration

1. In the [Azure portal](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps), navigate to **Microsoft Entra ID** > **App registrations**.
1. Click **New registration** and create an application.
1. Navigate to **Certificates & secrets** and create a new client secret.
1. Note down the following values:

   | Value | Location |
   |-------|----------|
   | **Client ID** | Overview > Application (client) ID |
   | **Client Secret** | Certificates & secrets > Client secrets > Value |
   | **Tenant ID** | Overview > Directory (tenant) ID |

1. Navigate to **API permissions** and verify the app has the required permissions.
1. Assign the app a role (for example, **Reader** or **Monitoring Reader**) on the subscriptions or resources you want to query.

## Configure the data source

1. In Grafana, navigate to **Connections** > **Data sources**.
1. Click **Add data source** and select **Infinity**.
1. Expand the **Authentication** section and select **OAuth2**.
1. Select **Client Credentials** as the grant type.
1. Configure the following settings:

   | Setting | Value |
   |---------|-------|
   | **Client ID** | Your Azure app client ID |
   | **Client Secret** | Your Azure app client secret |
   | **Token URL** | `https://login.microsoftonline.com/<TENANT_ID>/oauth2/token` |
   | **Scopes** | Leave empty |

1. Add an **Endpoint parameter**:
   - **Key**: `resource`
   - **Value**: `https://management.azure.com/`

1. In **Allowed hosts**, enter `https://management.azure.com`.
1. Click **Save & test**.

## Query examples

### List subscriptions

**URL:**

```
https://management.azure.com/subscriptions?api-version=2020-01-01
```

**Configuration:**
- **Type**: JSON
- **Parser**: Backend or UQL
- **Root selector**: `value`

### List resource groups

**URL:**

```
https://management.azure.com/subscriptions/{subscriptionId}/resourcegroups?api-version=2021-04-01
```

**UQL query:**

```sql
parse-json
| scope "value"
| project "Name"="name", "Location"="location", "Provisioning State"="properties.provisioningState"
```

### List virtual machines

**URL:**

```
https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Compute/virtualMachines?api-version=2023-03-01
```

**UQL query:**

```sql
parse-json
| scope "value"
| project "Name"="name", "Location"="location", "VM Size"="properties.hardwareProfile.vmSize", "OS"="properties.storageProfile.osDisk.osType"
```

### Query cost data

**URL:**

```
https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-03-01
```

**Method:** POST

**Body (JSON):**

```json
{
  "type": "Usage",
  "timeframe": "MonthToDate",
  "dataset": {
    "granularity": "Daily",
    "aggregation": {
      "totalCost": {
        "name": "Cost",
        "function": "Sum"
      }
    }
  }
}
```

## Provision the data source

Configure Azure OAuth2 authentication through provisioning:

```yaml
apiVersion: 1
datasources:
  - name: Azure Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: oauth2
      oauth2:
        oauth2_type: client_credentials
        client_id: YOUR_CLIENT_ID
        token_url: https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/token
      oauthPassThru: false
      allowedHosts:
        - https://management.azure.com
    secureJsonData:
      oauth2ClientSecret: YOUR_CLIENT_SECRET
```

## Troubleshoot

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid or expired credentials | Regenerate client secret and update configuration |
| 403 Forbidden | Missing role assignment | Assign Reader role to the app on the target subscription |
| Invalid token | Wrong token URL | Verify tenant ID in the token URL |
| Empty response | Wrong API version | Check Azure REST API docs for the correct `api-version` |

## Additional resources

- [Azure REST API documentation](https://learn.microsoft.com/en-us/rest/api/azure/)
- [Azure Resource Manager API reference](https://learn.microsoft.com/en-us/rest/api/resources/)
- [Azure Cost Management API](https://learn.microsoft.com/en-us/rest/api/cost-management/)
