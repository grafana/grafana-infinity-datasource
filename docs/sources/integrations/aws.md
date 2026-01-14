---
slug: '/integrations/aws'
title: AWS API
menuTitle: AWS
description: Connect the Infinity data source to AWS management APIs.
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/examples/aws/
keywords:
  - infinity
  - AWS
  - CloudWatch
  - API
labels:
  products:
    - oss
weight: 100
---

# AWS API integration

Connect the Infinity data source to AWS management APIs to query metrics, list resources, and retrieve cost data.

## Before you begin

- Create an AWS IAM user with programmatic access
- Note down your Access Key ID and Secret Access Key
- Assign appropriate IAM permissions for the APIs you want to query (for example, CloudWatch ReadOnly, Cost Explorer ReadOnly)

## Configure the data source

1. In Grafana, navigate to **Connections** > **Data sources**.
1. Click **Add data source** and select **Infinity**.
1. Expand the **Authentication** section and select **AWS**.
1. Configure the following settings:

   | Setting | Description | Example |
   |---------|-------------|---------|
   | **Region** | AWS region for your resources | `us-east-1` |
   | **Service** | AWS service identifier | `monitoring` |
   | **Access Key** | Your IAM access key ID | `AKIA...` |
   | **Secret Key** | Your IAM secret access key | (stored securely) |

1. In **Allowed hosts**, enter your AWS endpoint (for example, `https://monitoring.us-east-1.amazonaws.com`).
1. Click **Save & test**.

{{< admonition type="tip" >}}
Find the appropriate service name in the [AWS service endpoints documentation](https://docs.aws.amazon.com/general/latest/gr/aws-service-information.html).
{{< /admonition >}}

## Common AWS service identifiers

| Service | Identifier | Endpoint pattern |
|---------|------------|------------------|
| CloudWatch | `monitoring` | `monitoring.<region>.amazonaws.com` |
| Cost Explorer | `ce` | `ce.us-east-1.amazonaws.com` |
| EC2 | `ec2` | `ec2.<region>.amazonaws.com` |
| S3 | `s3` | `s3.<region>.amazonaws.com` |
| Lambda | `lambda` | `lambda.<region>.amazonaws.com` |

## Query examples

### List CloudWatch metrics

1. Set the **URL** to:

   ```
   https://monitoring.us-east-1.amazonaws.com?Action=ListMetrics&Version=2010-08-01
   ```

1. Set **Type** to **XML** (AWS returns XML by default).
1. Set **Parser** to **Backend**.
1. Set the **Root selector** to extract the metrics array.

### CloudWatch metrics with UQL

Use UQL to transform and filter the AWS XML response:

```sql
parse-xml
| scope "ListMetricsResponse.ListMetricsResult.Metrics.member"
| project "Namespace", "MetricName", "Dimensions"
```

### List EC2 instances

**URL:**

```
https://ec2.us-east-1.amazonaws.com?Action=DescribeInstances&Version=2016-11-15
```

**UQL query:**

```sql
parse-xml
| scope "DescribeInstancesResponse.reservationSet.item.instancesSet.item"
| project "InstanceId"="instanceId", "State"="instanceState.name", "Type"="instanceType"
```

### Cost Explorer data

{{< admonition type="note" >}}
Cost Explorer API requires the `ce` service and is only available in `us-east-1`.
{{< /admonition >}}

**URL:**

```
https://ce.us-east-1.amazonaws.com
```

**Method:** POST

**Body (JSON):**

```json
{
  "TimePeriod": {
    "Start": "${__from:date:YYYY-MM-DD}",
    "End": "${__to:date:YYYY-MM-DD}"
  },
  "Granularity": "DAILY",
  "Metrics": ["UnblendedCost"]
}
```

## Provision the data source

Configure AWS authentication through provisioning:

```yaml
apiVersion: 1
datasources:
  - name: AWS Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: aws
      aws:
        region: us-east-1
        service: monitoring
      allowedHosts:
        - https://monitoring.us-east-1.amazonaws.com
    secureJsonData:
      awsAccessKey: YOUR_ACCESS_KEY
      awsSecretKey: YOUR_SECRET_KEY
```

## Troubleshoot

| Issue | Cause | Solution |
|-------|-------|----------|
| 403 Forbidden | Missing IAM permissions | Verify your IAM user has the required permissions |
| SignatureDoesNotMatch | Incorrect credentials or region | Verify access key, secret key, and region |
| Connection timeout | Wrong endpoint | Verify the allowed hosts match your endpoint URL |
| Empty response | Wrong service identifier | Check the [AWS service endpoints](https://docs.aws.amazon.com/general/latest/gr/aws-service-information.html) for the correct identifier |
