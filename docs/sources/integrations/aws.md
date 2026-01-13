---
slug: '/integrations/aws'
title: AWS API
menuTitle: AWS
description: Connect the Infinity data source to AWS management APIs.
aliases:
  - infinity/aws
  - /aws
keywords:
  - infinity
  - AWS
  - CloudWatch
  - API
weight: 100
---

# AWS API integration

Connect the Infinity data source to AWS management APIs to query metrics, list resources, and retrieve cost data.

{{< admonition type="note" >}}
AWS authentication support is available from plugin version 1.3.0.
{{< /admonition >}}

## Before you begin

- Create an AWS IAM user with programmatic access.
- Note down your Access Key ID and Secret Access Key.
- Assign appropriate permissions (for example, CloudWatch ReadOnly).

## Configure the data source

1. In Grafana, navigate to **Connections** > **Data sources**.
1. Click **Add data source** and select **Infinity**.
1. Expand the **Authentication** section and select **AWS**.
1. Configure the following settings:

   | Setting | Example value |
   |---------|---------------|
   | Region | `us-east-1` |
   | Service | `monitoring` |
   | Access Key | Your AWS access key |
   | Secret Key | Your AWS secret key |

1. In **Allowed hosts**, enter your AWS endpoint (for example, `https://monitoring.us-east-1.amazonaws.com`).
1. Click **Save & test**.

{{< admonition type="tip" >}}
Find the appropriate service name in the [AWS service endpoints documentation](https://docs.aws.amazon.com/general/latest/gr/aws-service-information.html).
{{< /admonition >}}

## Query AWS APIs

After configuration, you can query AWS APIs using the Infinity query editor.

### Example: List CloudWatch metrics

1. In the query editor, set the URL to:

   ```
   https://monitoring.us-east-1.amazonaws.com?Action=ListMetrics
   ```

1. Select **JSON** as the query type.
1. Select **Backend** or **UQL** as the parser.
1. Set the root selector to `ListMetricsResponse.ListMetricsResult.Metrics`.
1. Click **Run query**.

### UQL query example

Use UQL to transform and filter the AWS response:

```sql
parse-json
| scope "ListMetricsResponse.ListMetricsResult.Metrics"
| mv-expand "dimension"="Dimensions"
| project "Namespace", "MeasureName", "Dimension Name"="dimension.Name", "Dimension Value"="dimension.Value"
```
