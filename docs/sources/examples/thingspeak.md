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
    - enterprise
    - grafana cloud
weight: 8001
---

# Visualizing data from ThingSpeak REST API

In this example, we are going to visualize data from ThingSpeak API.

For demo purpose, I am using [traffic monitor public channel](https://thingspeak.com/channels/38629) ( Channel ID : 38629 ). You may know already that, ThingSpeak APIs available in different formats such as JSON, CSV and XML. We are going to see how to use all of those different API formats.

## JSON Example

As you can see in the below picture, I am using the [JSON feed url](https://thingspeak.com/channels/38629/feed.json) of the channel. If you look at the JSON schema, my data points are under the node called `feeds`. So I specify the same as my `Rows/Root` selector. Then for the columns, we need to first specify our time column which is `created_at` field in our json feed. Then we can specify one or more metrics(number) fields as shown in the below picture.

![image](https://user-images.githubusercontent.com/153843/108479371-9030bb00-728d-11eb-8ae5-f186c78db64e.png#center)

## CSV Example

If you prefer CSV format over JSON, here is the example settings of the same channel. I am using [CSV feed url](https://thingspeak.com/channels/38629/feed.csv) of the channel. In the query, Choose `CSV` as your type, specify the csv feed URL and then the fields you needed along with time field.

![image](https://user-images.githubusercontent.com/153843/108479976-4b595400-728e-11eb-868e-b2d550f496f3.png#center)

## XML Example

You are not limited to CSV, JSON. You can also use xml format as well in your query if your prefer that. I am using [XML feed url](https://thingspeak.com/channels/38629/feed.xml) of the channel. Query setup is almost same as csv/json. Notable configurations are your rows/root field and timestamp field. As you see in the below picture, I am using `channel.feeds[0].feed` as my root/rows selector and then for selecting timestamp, I use `created-at[0]._`

![image](https://user-images.githubusercontent.com/153843/108480329-b99e1680-728e-11eb-91f3-38c5585477e2.png#center)

## Using Grafana's time filter

Once you setup the query, you may find that your are always querying recent data in the graphs irrespective of the time range chosen in Grafana. To solve this issue, we need to pass the Grafana's dynamic time range in the url. As per the [ThingSpeak API specification](https://community.thingspeak.com/documentation%20.../api/), you need to pass the start and end time to the url as query string params. To do that, I am appending `?start=${__from:date:YYYY-MM-DD HH:NN:SS}&end=${__to:date:YYYY-MM-DD HH:NN:SS}` to the url. You can use any variable as specified in the [grafana doc](https://grafana.com/docs/grafana/latest/variables/variable-types/global-variables/)

My full url now becomes `https://thingspeak.com/channels/38629/feed.json?start=${__from:date:YYYY-MM-DD HH:NN:SS}&end=${__to:date:YYYY-MM-DD HH:NN:SS}`.

![image](https://user-images.githubusercontent.com/153843/108482298-392ce500-7291-11eb-9137-888fc4b3515b.png#center#center)

## Long time range

Typically for up to 2 hour you can get all the metrics without any aggregation. If you are looking for more long time range, you may need to pass aggregation filter to your url. Here in the below example, I am looking for data worth of recent 180days. So i am pulling the aggregated data using the url `https://thingspeak.com/channels/38629/feed.json?start=${__from:date:YYYY-MM-DD HH:NN:SS}&end=${__to:date:YYYY-MM-DD HH:NN:SS}&average=1440` the key to look at here is **average=1440** where it specify to take average of each 1440 minutes/1day. You can specify more granular time aggregation. As per the document, 10, 15, 20, 30, 60, 240, 720, 1440 are the valid time range in minutes. Also instead average you can use sum/timescale/median functions.

![image](https://user-images.githubusercontent.com/153843/108484741-0cc69800-7294-11eb-956b-8dfb74123301.png#center)

## Note

> This post was originally posted in [github discussion](https://github.com/grafana/grafana-infinity-datasource/discussions/38)
