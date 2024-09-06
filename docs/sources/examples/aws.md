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

## Steps to connect to AWS APIs

1. Create a new service account in [AWS console](https://us-east-1.console.aws.amazon.com/iam/home#/users$new?step=details). ( AWS Console -> IAM -> Access Management -> Users -> Add users)
   1. Select **Access key - Programmatic access** as AWS Credentials type
   2. Set required permissions (preferably CloudWatch ReadOnly Permission)
   3. Copy the access key and secret key
2. Install the Infinity plugin in Grafana and add data source for the same
3. Expand Authentication section and select "AWS"
4. Select region. Example `us-east-1`
5. Select service. Example `monitoring`. You can find the appropriate service name [here](https://docs.aws.amazon.com/general/latest/gr/aws-service-information.html).
6. Enter the access key and secret key you copied in step 1
7. Enter `https://monitoring.us-east-1.amazonaws.com` as allowed URL. (replace the service name and region as necessary )
8. Click "Save and Test"
9. Click the Explore button
10. Enter the URL `https://monitoring.us-east-1.amazonaws.com?Action=ListMetrics`
11. Select "JSON" as Query type
12. Optionally, Select "Backend" / "UQL" as parser.
13. Enter the Root Selector `ListMetricsResponse.ListMetricsResult.Metrics`
14. Click Run Query to see the results

## Config Editor

![image](https://user-images.githubusercontent.com/153843/210791648-7d05d435-2a26-469c-9bfd-e4db98018999.png#center)

## Query with Backend parser

![image](https://user-images.githubusercontent.com/153843/210788954-e8bf3fab-e1c7-426d-8e87-610315c6afee.png#center)

## Query with UQL parser

![image](https://user-images.githubusercontent.com/153843/210791302-178391c9-93f9-4449-8f5a-8e14a3db1eff.png#center)

sample uql query is given below

```sql
parse-json
| scope "ListMetricsResponse.ListMetricsResult.Metrics"
| mv-expand "dimension"="Dimensions"
| project "Namespace", "MeasureName", "Dimension Name"="dimension.Name", "Dimension Value"="dimension.Value"
```

## Query with Default/Frontend parser

![image](https://user-images.githubusercontent.com/153843/210790702-af822bdc-e974-4410-83b2-8e7776f03516.png#center)
