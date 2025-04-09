---
menuTitle: Visualize JSON data
title: Visualize JSON data using the Infinity data source
description: Welcome to the Grafana learning journey that provides the best practice for creating a dashboard that visualizes JSON data using the Infinity data source.
weight: 600
journey:
  skill: Beginner
  source: Docs & blog posts
  logo:
    src: /static/img/menu/infinity-logo.png
    background: '#fff'
    width: 46
    height: 55
step: 1
layout: single-journey
cascade:
  layout: single-journey
cta:
  type: start
  title: Are you ready?
  cta_text: Let's go!
related_journeys:
  title: Related journeys
  heading: Consider taking the following journeys before you start this journey.
  items:
    - title: Create a private connection to a data source
      link: '/docs/learning-journeys/private-data-source-connect/'
---

# Visualize JSON data using the Infinity data source

Welcome to the Grafana learning journey that teaches you best practices for using the Infinity data source to visualize JSON data.

The following image shows a dashboard populated with traffic monitoring data in JSON format. The data is available via a public URL.

![Image that shows traffic monitoring data in JSON format](/media/docs/learning-journey/infinity-json/json-dashboard-example.png)

{{< docs/box >}}

{{< docs/icon-heading heading="## Here's what to expect" >}}

When you complete this journey, you'll be able to:

1. Install the Infinity data source and add it to your Grafana Cloud instance
1. Configure basic authentication
1. Select a private data source connection
1. Create a dashboard using JSON data

{{< /docs/box >}}

## Troubleshooting

If you get stuck, we've got your back! Where appropriate, troubleshooting information is just a click away.

## More to explore

We understand you might want to explore other capabilities not strictly on this path. We'll provide you opportunities where it makes sense.

## Before you begin

Before you add and configure the Infinity data source plugin, ensure you have:

- A Grafana Cloud account. To create an account, see [Grafana Cloud](https://grafana.com/signup/cloud/connect-account).
- Grafana Cloud Admin permissions.
- A JSON file populated with data that is accessible using a URL.
- Knowledge of your data structure, such as the JSON name and value pairs.
- Knowledge of the authentication method used to secure the JSON endpoint.
- [Created a private connection to a data source](/docs/learning-journeys/private-data-source-connect) and the PDC agent is running.
  - While not required, setting up a private data source connection is highly recommended when you use Grafana Cloud to connect to a data source.
