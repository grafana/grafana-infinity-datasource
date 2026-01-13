---
slug: '/integrations/thingspeak'
title: ThingSpeak API
menuTitle: ThingSpeak
description: Visualize IoT sensor data from ThingSpeak using the Infinity data source.
aliases:
  - infinity/thingspeak
  - /thingspeak
keywords:
  - infinity
  - ThingSpeak
  - IoT
  - sensors
  - timeseries
weight: 500
---

# ThingSpeak API integration

Connect to the ThingSpeak IoT platform to visualize sensor data and metrics from your IoT devices.

## Before you begin

- A ThingSpeak channel with data (public channels work without authentication).
- For private channels, your ThingSpeak API key.

This guide uses the public [traffic monitor channel](https://thingspeak.com/channels/38629) (Channel ID: 38629) for examples.

## Query ThingSpeak data

ThingSpeak provides data in JSON, CSV, and XML formats. Choose the format that best fits your needs.

### JSON example

1. In the query editor, configure:
   - **Type**: JSON
   - **URL**: `https://thingspeak.com/channels/38629/feed.json`
   - **Rows/Root**: `feeds`

1. Add columns for your data fields:

   | Column | Selector | Type |
   |--------|----------|------|
   | Time | `created_at` | Timestamp |
   | Field 1 | `field1` | Number |
   | Field 2 | `field2` | Number |

### CSV example

1. In the query editor, configure:
   - **Type**: CSV
   - **URL**: `https://thingspeak.com/channels/38629/feed.csv`

1. Add columns matching your CSV headers.

### XML example

1. In the query editor, configure:
   - **Type**: XML
   - **URL**: `https://thingspeak.com/channels/38629/feed.xml`
   - **Rows/Root**: `channel.feeds[0].feed`

1. Add columns:

   | Column | Selector | Type |
   |--------|----------|------|
   | Time | `created-at[0]._` | Timestamp |
   | Field 1 | `field1[0]._` | Number |

## Filter by dashboard time range

By default, ThingSpeak returns recent data regardless of your Grafana time range. To filter by the dashboard time range, add time parameters to the URL:

```
https://thingspeak.com/channels/38629/feed.json?start=${__from:date:YYYY-MM-DD HH:NN:SS}&end=${__to:date:YYYY-MM-DD HH:NN:SS}
```

This uses Grafana's [global time variables](https://grafana.com/docs/grafana/latest/dashboards/variables/add-template-variables/#__from-and-__to) to pass the selected time range to the API.

## Query long time ranges

For time ranges longer than 2 hours, ThingSpeak requires data aggregation. Add an aggregation parameter to your URL:

```
https://thingspeak.com/channels/38629/feed.json?start=${__from:date:YYYY-MM-DD HH:NN:SS}&end=${__to:date:YYYY-MM-DD HH:NN:SS}&average=1440
```

### Aggregation options

| Parameter | Description |
|-----------|-------------|
| `average=N` | Average values over N minutes |
| `sum=N` | Sum values over N minutes |
| `median=N` | Median values over N minutes |
| `timescale=N` | Timescale values over N minutes |

Valid aggregation intervals (in minutes): 10, 15, 20, 30, 60, 240, 720, 1440.

For example, `average=1440` calculates the daily average (1440 minutes = 1 day).

## Additional resources

- [ThingSpeak API documentation](https://www.mathworks.com/help/thingspeak/rest-api.html)
- [ThingSpeak channels](https://thingspeak.com/channels/public)
