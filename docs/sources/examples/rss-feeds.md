---
slug: '/aws-status-feeds'
title: 'AWS Status feeds as Grafana annotations'
menuTitle: RSS Status feeds (AWS status)
description: Visualizing data from AWS Status feeds
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
weight: 8003
---

# Visualizing data from AWS Status feeds

In this example, we are going to see how we can use AWS status feeds as Grafana annotations. This will be useful when you are dealing with any AWS outages. For this, we are going to use the [AWS RSS feed](https://status.aws.amazon.com/rss/all.rss). You can find more feeds at [AWS Status page](https://status.aws.amazon.com/)

![image](https://user-images.githubusercontent.com/153843/151575227-20088546-4368-4066-a91b-64058982544b.png#center)

## Connection setup

[AWS status feeds](https://status.aws.amazon.com/rss/all.rss) are open and no authentication required. So, you can simple create a datasource using infinity without any additional configuration.

## Annotation setup

In your dashboard, Once you create a annotation you will perform the following steps

- Create a annotation and select your Infinity datasource
- Select "XML" as query type, "URL" as source and Format "Data Frame"
- Provide `https://status.aws.amazon.com/rss/all.rss` as the URL
- You need to specify `rss.channel[0].item` as the URL. ( You can find this path from the original rss feed )
- Create `title`, `description` as columns and provide string type
- Create `pubDate` column and mark this as 'DateTime'
- Finally select `guid[0]._` as string. This is your link. So you can alias this to link

![image](https://user-images.githubusercontent.com/153843/151575928-4fc9f188-7f9a-43c5-a92a-6069fe434e6a.png)

Reference feed item is given below

```xml
<item>
    <title><![CDATA[Service is operating normally: [RESOLVED] SMS Delivery Delays]]></title>
    <link>http://status.aws.amazon.com/</link>
    <pubDate>Fri, 14 Jan 2022 14:44:00 PST</pubDate>
    <guid isPermaLink="false">http://status.aws.amazon.com/#sns-us-east-1_1642200240</guid>
    <description><![CDATA[Between 5:14 AM and 11:38 AM PST, we experienced increased delivery latency while delivering SMS messages using US toll-free numbers. Also starting at 5:14 AM, SMS message delivery receipts were delayed, which created a backlog of undelivered delivery receipts. We are continuing to work with our downstream partners to clear this backlog. Receipts for new SMS deliveries will also be delayed until this backlog clears. The issues have been resolved and the service is operating normally.]]></description>
    </item>
```

## Table view of status items

You can follow the same query procedure in your table panel to get the results as Table

![image](https://user-images.githubusercontent.com/153843/151576874-6f4d73d2-9331-4473-a7aa-a3eae0bec880.png#center)

## Alternate query method

If you are familiar with [UQL query](/docs/uql), you can achieve this with a simple query. Instead of selecting "XML" as your query type, you will choose "UQL" in this method and write the following UQL query.

![image](https://user-images.githubusercontent.com/153843/151577609-d2e5a7c3-aaf8-412b-83b8-965ca676eef4.png#center)

```sql
parse-xml
| scope "rss.channel.item"
| extend "published date"=todatetime("pubDate")
| project "title", "published date", "description", "link"
```

## More status feeds

With this approach, Not only AWS status feed but you can monitor any RSS feeds also.
