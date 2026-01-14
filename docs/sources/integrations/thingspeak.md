---
slug: '/integrations/thingspeak'
title: ThingSpeak API
menuTitle: ThingSpeak
description: Visualize IoT sensor data from ThingSpeak using the Infinity data source.
aliases:
  - /docs/plugins/yesoreyeram-infinity-datasource/latest/examples/thingspeak/
keywords:
  - infinity
  - ThingSpeak
  - IoT
  - sensors
  - time series
labels:
  products:
    - oss
weight: 500
---

# ThingSpeak API integration

Connect to the ThingSpeak IoT platform to visualize sensor data and metrics from your IoT devices.

## Before you begin

- A ThingSpeak channel with data (public channels work without authentication)
- For private channels, your ThingSpeak Read API Key
- Know your channel ID

This guide uses the public [traffic monitor channel](https://thingspeak.com/channels/38629) (Channel ID: 38629) for examples.

## Configure the data source

1. In Grafana, navigate to **Connections** > **Data sources**.
1. Click **Add data source** and select **Infinity**.
1. In **Allowed hosts**, enter `https://thingspeak.com`.
1. For private channels, expand **Authentication** and select **API Key**.
   - Set **Key** to `api_key` and add your ThingSpeak Read API Key.
   - Set **Add to** to **Query String**.
1. Click **Save & test**.

## Query examples

ThingSpeak provides data in JSON, CSV, and XML formats. Choose the format that best fits your needs.

### JSON format

**Configuration:**

| Setting | Value |
|---------|-------|
| **Type** | JSON |
| **URL** | `https://thingspeak.com/channels/38629/feed.json` |
| **Parser** | Backend |
| **Root selector** | `feeds` |

**Columns:**

| Selector | Alias | Type |
|----------|-------|------|
| `created_at` | Time | Timestamp |
| `field1` | Field 1 | Number |
| `field2` | Field 2 | Number |

### CSV format

**Configuration:**

| Setting | Value |
|---------|-------|
| **Type** | CSV |
| **URL** | `https://thingspeak.com/channels/38629/feed.csv` |

The CSV format automatically detects column headers.

### XML format

**Configuration:**

| Setting | Value |
|---------|-------|
| **Type** | XML |
| **URL** | `https://thingspeak.com/channels/38629/feed.xml` |
| **Root selector** | `channel.feeds.feed` |

**Columns:**

| Selector | Alias | Type |
|----------|-------|------|
| `created-at` | Time | Timestamp |
| `field1` | Field 1 | Number |

## Filter by dashboard time range

By default, ThingSpeak returns recent data regardless of your Grafana time range. To filter by the dashboard time range, add time parameters to the URL:

```
https://thingspeak.com/channels/38629/feed.json?start=${__from:date:YYYY-MM-DD HH:NN:SS}&end=${__to:date:YYYY-MM-DD HH:NN:SS}
```

This uses Grafana's time variables to pass the selected time range to the API.

## Query long time ranges

For time ranges longer than 2 hours, ThingSpeak requires data aggregation. Add an aggregation parameter:

```
https://thingspeak.com/channels/38629/feed.json?start=${__from:date:YYYY-MM-DD HH:NN:SS}&end=${__to:date:YYYY-MM-DD HH:NN:SS}&average=60
```

### Aggregation options

| Parameter | Description |
|-----------|-------------|
| `average=N` | Average values over N minutes |
| `sum=N` | Sum values over N minutes |
| `median=N` | Median values over N minutes |
| `timescale=N` | Timescale values over N minutes |

### Valid aggregation intervals

| Minutes | Duration |
|---------|----------|
| 10 | 10 minutes |
| 15 | 15 minutes |
| 20 | 20 minutes |
| 30 | 30 minutes |
| 60 | 1 hour |
| 240 | 4 hours |
| 720 | 12 hours |
| 1440 | 1 day |

For example, `average=1440` calculates the daily average.

## ThingSpeak URL parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `results` | Number of results to return | `results=100` |
| `start` | Start date/time | `start=2024-01-01` |
| `end` | End date/time | `end=2024-01-31` |
| `timezone` | Timezone for timestamps | `timezone=America/New_York` |
| `status` | Include status field | `status=true` |

## Troubleshoot

| Issue | Cause | Solution |
|-------|-------|----------|
| Empty response | Private channel without API key | Add your Read API Key in authentication settings |
| No data for time range | Time range > 2 hours without aggregation | Add an aggregation parameter (average, sum, median) |
| Field values are null | Sensor not reporting that field | Verify the field exists in your ThingSpeak channel |
| 400 Bad Request | Invalid aggregation interval | Use a valid interval (10, 15, 20, 30, 60, 240, 720, 1440) |

## Additional resources

- [ThingSpeak REST API documentation](https://www.mathworks.com/help/thingspeak/rest-api.html)
- [Public ThingSpeak channels](https://thingspeak.com/channels/public)
- [ThingSpeak Read a Channel Feed](https://www.mathworks.com/help/thingspeak/readdata.html)
