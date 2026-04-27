---
slug: '/examples/aws'
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
    - enterprise
    - cloud
weight: 100
---

# AWS API

Connect the Infinity data source to AWS management APIs to query metrics, list resources, and retrieve cost data.

The Infinity data source supports two AWS authentication providers and optional IAM role assumption for cross-account or role-based access.

## Authentication providers

| Provider | Description |
| --- | --- |
| **Access & Secret Key** | Static credentials. Provide an AWS access key and secret key directly. |
| **Default Credentials / IAM Role** | Uses the AWS SDK default credential chain: environment variables, shared credentials file, EC2 instance profile, ECS task role, or EKS IRSA. No static keys required. |

## IAM role assumption (AssumeRole)

Both authentication providers support optional IAM role assumption via STS `AssumeRole`. This is useful for:

- **Cross-account access** — access resources in a different AWS account.
- **Least-privilege** — use a base identity with minimal permissions and assume a role with specific permissions.
- **EKS IRSA** — the pod authenticates via IRSA (default credentials) and then assumes a target role that has the required permissions.

| Field | Description |
| --- | --- |
| **Assume Role ARN** | Optional. The ARN of the IAM role to assume (for example, `arn:aws:iam::123456789012:role/MyRole`). |
| **External ID** | Optional. Used when the target role's trust policy requires an external ID for cross-account access. |

Temporary credentials obtained via `AssumeRole` are automatically refreshed by the AWS SDK when they expire.

## Grafana server configuration

The Grafana server must allow the AWS authentication providers used by the plugin. Add the following to `grafana.ini` or set equivalent environment variables:

```ini
[aws]
allowed_auth_providers = default, keys, credentials
assume_role_enabled = true
```

Or via environment variables:

```
GF_AWS_ALLOWED_AUTH_PROVIDERS=default,keys,credentials
GF_AWS_ASSUME_ROLE_ENABLED=true
```

## Before you begin

For **Access & Secret Key** authentication:

- Create an AWS IAM user with programmatic access
- Note down your Access Key ID and Secret Access Key
- Assign appropriate IAM permissions for the APIs you want to query (for example, CloudWatch ReadOnly, Cost Explorer ReadOnly)

For **Default Credentials / IAM Role** authentication:

- Ensure the Grafana instance has an IAM role attached (instance profile, task role, or IRSA service account) with the required permissions

## Configure the data source

### Using Access & Secret Key

1. In Grafana, navigate to **Connections** > **Data sources**.
1. Click **Add new data source** and select **Infinity**.
1. Expand the **Authentication** section and select **AWS**.
1. Select **Access & Secret Key** as the **Auth Provider**.
1. Configure the following settings:

   | Setting | Description | Example |
   |---------|-------------|---------|
   | **Region** | AWS region for your resources | `us-east-1` |
   | **Service** | AWS service identifier | `monitoring` |
   | **Access Key** | Your IAM access key ID | `KEY...` |
   | **Secret Key** | Your IAM secret access key | (stored securely) |

1. In **Allowed hosts**, enter your AWS endpoint (for example, `https://monitoring.us-east-1.amazonaws.com`).
1. Click **Save & test**.

### Using Default Credentials / IAM Role

This method is suitable for EC2 instances, ECS tasks, and EKS pods with IRSA.

1. In Grafana, navigate to **Connections** > **Data sources**.
1. Click **Add new data source** and select **Infinity**.
1. Expand the **Authentication** section and select **AWS**.
1. Select **Default Credentials / IAM Role** as the **Auth Provider**.
1. Select **Region** and enter **Service**.
1. Optionally, enter an **Assume Role ARN** for cross-account access.
1. In **Allowed hosts**, enter your AWS endpoint.
1. Click **Save & test**.

#### EKS IRSA example

When running on EKS with [IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html):

1. Create an IAM role with the required permissions and a trust policy that allows the Kubernetes service account.
1. Annotate the Kubernetes service account:
   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: grafana
     annotations:
       eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/GrafanaRole
   ```
1. Configure the data source with **Default Credentials / IAM Role**. No static keys are needed.
1. If the IRSA role only has `sts:AssumeRole` permissions, set the **Assume Role ARN** to the target role.

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

   ```sh
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

```sh
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

```sh
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
  "Metrics": ["UnBlendedCost"]
}
```

## Provision the data source

### Access Key & Secret Key

```yaml
apiVersion: 1
datasources:
  - name: AWS Infinity
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: aws
      aws:
        authType: keys
        region: us-east-1
        service: monitoring
      allowedHosts:
        - https://monitoring.us-east-1.amazonaws.com
    secureJsonData:
      awsAccessKey: YOUR_ACCESS_KEY
      awsSecretKey: YOUR_SECRET_KEY
```

### Access Key & Secret Key + AssumeRole

```yaml
apiVersion: 1
datasources:
  - name: AWS Infinity (AssumeRole)
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: aws
      aws:
        authType: keys
        region: us-east-1
        service: monitoring
        assumeRoleArn: arn:aws:iam::123456789012:role/MyRole
        externalId: my-external-id
      allowedHosts:
        - https://monitoring.us-east-1.amazonaws.com
    secureJsonData:
      awsAccessKey: YOUR_ACCESS_KEY
      awsSecretKey: YOUR_SECRET_KEY
```

### Default Credentials / IAM Role

```yaml
apiVersion: 1
datasources:
  - name: AWS Infinity (IAM Role)
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: aws
      aws:
        authType: default
        region: us-east-1
        service: monitoring
      allowedHosts:
        - https://monitoring.us-east-1.amazonaws.com
```

### Default Credentials + AssumeRole

```yaml
apiVersion: 1
datasources:
  - name: AWS Infinity (IAM Role + AssumeRole)
    type: yesoreyeram-infinity-datasource
    jsonData:
      auth_method: aws
      aws:
        authType: default
        region: us-east-1
        service: monitoring
        assumeRoleArn: arn:aws:iam::123456789012:role/MyRole
      allowedHosts:
        - https://monitoring.us-east-1.amazonaws.com
```

## Troubleshoot

| Issue | Cause | Solution |
|-------|-------|----------|
| 403 Forbidden | Missing IAM permissions | Verify your IAM user or role has the required permissions |
| SignatureDoesNotMatch | Incorrect credentials or region | Verify access key, secret key, and region |
| Connection timeout | Wrong endpoint | Verify the allowed hosts match your endpoint URL |
| Empty response | Wrong service identifier | Check the [AWS service endpoints](https://docs.aws.amazon.com/general/latest/gr/aws-service-information.html) for the correct identifier |
