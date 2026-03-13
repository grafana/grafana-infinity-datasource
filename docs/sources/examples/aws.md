---
slug: '/aws'
title: 'AWS API'
menuTitle: AWS API
description: AWS API
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
weight: 8100
---

# AWS Authentication

Support for connecting to AWS API is available from version 1.3.0

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
| **Assume Role ARN** | Optional. The ARN of the IAM role to assume (e.g., `arn:aws:iam::123456789012:role/MyRole`). |
| **External ID** | Optional. Used when the target role's trust policy requires an external ID for cross-account access. Only shown when Assume Role ARN is set. |

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

## Steps to connect using Access & Secret Key

1. Create a new IAM user in [AWS console](https://us-east-1.console.aws.amazon.com/iam/home#/users$new?step=details) (AWS Console -> IAM -> Access Management -> Users -> Add users).
   1. Select **Access key - Programmatic access** as AWS Credentials type.
   2. Set required permissions (preferably CloudWatch ReadOnly Permission).
   3. Copy the access key and secret key.
2. Install the Infinity plugin in Grafana and add a data source.
3. Expand the Authentication section and select **AWS**.
4. Select **Access & Secret Key** as the Auth Provider.
5. Select region. Example: `us-east-2`.
6. Enter the service name. Example: `monitoring`. You can find the appropriate service name [here](https://docs.aws.amazon.com/general/latest/gr/aws-service-information.html).
7. Enter the access key and secret key you copied in step 1.
8. Enter `https://monitoring.us-east-2.amazonaws.com` as an allowed URL (replace the service name and region as necessary).
9. Click **Save and Test**.

## Steps to connect using Default Credentials / IAM Role

This method is suitable for EC2 instances, ECS tasks, and EKS pods with IRSA.

1. Ensure the Grafana instance has an IAM role attached (instance profile, task role, or IRSA service account) with the required permissions.
2. Install the Infinity plugin in Grafana and add a data source.
3. Expand the Authentication section and select **AWS**.
4. Select **Default Credentials / IAM Role** as the Auth Provider.
5. Select region. Example: `us-east-2`.
6. Enter the service name. Example: `monitoring`.
7. Optionally, enter an **Assume Role ARN** if you need to assume a different role (e.g., cross-account access).
8. Enter the allowed URL.
9. Click **Save and Test**.

### EKS IRSA example

When running on EKS with [IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html):

1. Create an IAM role with the required permissions and a trust policy that allows the Kubernetes service account.
2. Annotate the Kubernetes service account:
   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: grafana
     annotations:
       eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/GrafanaRole
   ```
3. Configure the data source with **Default Credentials / IAM Role**. No static keys are needed — the AWS SDK automatically picks up IRSA credentials from the pod environment.
4. If the IRSA role is a "bridge" role with only `sts:AssumeRole` permissions, set the **Assume Role ARN** to the target role that has the actual API permissions.

## Query example

### Query with Backend parser

![image](https://user-images.githubusercontent.com/153843/210788954-e8bf3fab-e1c7-426d-8e87-610315c6afee.png#center)

### Query with UQL parser

![image](https://user-images.githubusercontent.com/153843/210791302-178391c9-93f9-4449-8f5a-8e14a3db1eff.png#center)

Sample UQL query:

```sql
parse-json
| scope "ListMetricsResponse.ListMetricsResult.Metrics"
| mv-expand "dimension"="Dimensions"
| project "Namespace", "MeasureName", "Dimension Name"="dimension.Name", "Dimension Value"="dimension.Value"
```

### Query with Default/Frontend parser

![image](https://user-images.githubusercontent.com/153843/210790702-af822bdc-e974-4410-83b2-8e7776f03516.png#center)
