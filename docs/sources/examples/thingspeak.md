---
slug: '/thingspeak'
title: 'Thingspeak API'
menuTitle: Thingspeak API
description: Visualizing data from ThingSpeak API
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
weight: 8001
---

# Visualizing data from ThingSpeak REST API

In this example, you'll learn how to visualize data from ThingSpeak API.

For demo purposes, the [traffic monitor public channel](https://thingspeak.com/channels/38629) (Channel ID : 38629) is being used.  ThingSpeak APIs are available in different formats such as JSON, CSV, and XML, and we are going to see how to use all of those different API formats.

## JSON Example

As you can see in the picture below, we're using the [JSON feed URL](https://thingspeak.com/channels/38629/feed.json) of the channel. According to this JSON schema, the data points are under the node called `feeds`, so we'll specify the same as our `Rows/Root` selector. Then for the columns, we need to first specify our time column which is `created_at` field in our JSON feed. Then, we can specify one or more metrics (number) fields as shown in the picture below.

![image](https://user-images.githubusercontent.com/153843/108479371-9030bb00-728d-11eb-8ae5-f186c78db64e.png#center)

## CSV Example

If you prefer CSV format over JSON, here is the example settings of the same channel. We are using the [CSV feed URL](https://thingspeak.com/channels/38629/feed.csv) of the channel. In the query, choose `CSV` as your type, specify the CSV feed URL and then, the fields you needed along with time field.

![image](https://user-images.githubusercontent.com/153843/108479976-4b595400-728e-11eb-868e-b2d550f496f3.png#center)

## XML Example

You are not limited to CSV or JSON. You can also use XML format as well in your query if your prefer that. We are using the [XML feed URL](https://thingspeak.com/channels/38629/feed.xml) of the channel. The query setup is almost same as for CSV/JSON. Notable configurations are your rows/root field and timestamp field. As shown in the picture below, we are using `channel.feeds[0].feed` as root/rows selector and then for selecting timestamp, we use `created-at[0]._`

![image](https://user-images.githubusercontent.com/153843/108480329-b99e1680-728e-11eb-91f3-38c5585477e2.png#center)

## Using Grafana's time filter

After you set up the query, you may find that your are always querying recent data in the graphs, regardless of the time range chosen in Grafana. To solve this issue, you need to pass the Grafana's dynamic time range in the URL. As per the [ThingSpeak API specification](https://community.thingspeak.com/documentation%20.../api/), you should to pass the start and end time to the URL as query string params. To do that, append `?start=${__from:date:YYYY-MM-DD HH:NN:SS}&end=${__to:date:YYYY-MM-DD HH:NN:SS}` to the URL. You can use any variable as specified in the [grafana doc](https://grafana.com/docs/grafana/latest/variables/variable-types/global-variables/)

The full URL now becomes `https://thingspeak.com/channels/38629/feed.json?start=${__from:date:YYYY-MM-DD HH:NN:SS}&end=${__to:date:YYYY-MM-DD HH:NN:SS}`.

![image](https://user-images.githubusercontent.com/153843/108482298-392ce500-7291-11eb-9137-888fc4b3515b.png#center#center)

## Long time range

Typically you can retrieve all the metrics without any aggregation for up to 2 hours. If you are looking for a longer time range, you may need to pass an aggregation filter to your URL. Here in the below example, we are looking for data of the last 180 days, so we are pulling the aggregated data using the URL `https://thingspeak.com/channels/38629/feed.json?start=${__from:date:YYYY-MM-DD HH:NN:SS}&end=${__to:date:YYYY-MM-DD HH:NN:SS}&average=1440`. An important thing to note here is **average=1440**, where it specifies to take average of each 1440 minutes/1day. You can specify more granular time aggregations. As per the document, 10, 15, 20, 30, 60, 240, 720, 1440 are the valid time range in minutes. Also, instead average you can use sum/timescale/median functions.

![image](https://user-images.githubusercontent.com/153843/108484741-0cc69800-7294-11eb-956b-8dfb74123301.png#center)

## Note

> This post was originally posted in [a GitHub discussion](https://github.com/grafana/grafana-infinity-datasource/discussions/38)
