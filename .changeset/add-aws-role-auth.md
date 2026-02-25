---
"grafana-infinity-datasource": minor
---

Add optional AWS IAM role authentication (AssumeRole) alongside existing Access Key/Secret Key method. Supports both "keys" and "default" (EC2/ECS instance profile) credential providers, with optional AssumeRoleARN and ExternalID fields. Temporary credentials are automatically refreshed on expiry via AWS SDK CredentialsCache.
