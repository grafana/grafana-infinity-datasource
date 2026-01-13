---
slug: '/integrations/rss-feeds'
title: RSS and status feeds
menuTitle: RSS feeds
description: Visualize RSS feeds and status pages using the Infinity data source.
aliases:
  - infinity/aws-status-feeds
  - /aws-status-feeds
keywords:
  - infinity
  - RSS
  - XML
  - status feeds
  - annotations
weight: 400
---

# RSS and status feeds integration

Visualize RSS feeds, Atom feeds, and status pages as Grafana annotations or table data. This is useful for monitoring service status pages and correlating outages with your metrics.

## Before you begin

Most RSS feeds are publicly accessible and don't require authentication. For private feeds, configure appropriate authentication in the data source settings.

## Example: AWS status feed as annotations

Use the [AWS status RSS feed](https://status.aws.amazon.com/rss/all.rss) to display service incidents as annotations on your dashboards.

### Configure the annotation

1. In your dashboard, go to **Settings** > **Annotations**.
1. Click **Add annotation query**.
1. Select your Infinity data source.
1. Configure the query:

   | Setting | Value |
   |---------|-------|
   | Type | XML |
   | Source | URL |
   | Format | Data frame |
   | URL | `https://status.aws.amazon.com/rss/all.rss` |
   | Rows/Root | `rss.channel[0].item` |

1. Add columns:

   | Column | Selector | Type |
   |--------|----------|------|
   | title | `title` | String |
   | description | `description` | String |
   | pubDate | `pubDate` | Timestamp |
   | link | `guid[0]._` | String |

### Reference RSS item structure

```xml
<item>
  <title><![CDATA[Service is operating normally: [RESOLVED] SMS Delivery Delays]]></title>
  <link>http://status.aws.amazon.com/</link>
  <pubDate>Fri, 14 Jan 2022 14:44:00 PST</pubDate>
  <guid isPermaLink="false">http://status.aws.amazon.com/#sns-us-east-1_1642200240</guid>
  <description><![CDATA[Description of the incident...]]></description>
</item>
```

## Alternative: Use UQL

For more control over the data transformation, use UQL instead of the XML parser:

1. Set **Type** to **UQL**.
1. Set the **URL** to the RSS feed.
1. Use the following UQL query:

```sql
parse-xml
| scope "rss.channel.item"
| extend "published date"=todatetime("pubDate")
| project "title", "published date", "description", "link"
```

## Display as a table

Use the same query configuration in a table panel to display status items in a list format, which is useful for creating status dashboards.

## More status feeds

This approach works with any RSS or Atom feed:

- [GitHub Status](https://www.githubstatus.com/history.rss)
- [Google Cloud Status](https://status.cloud.google.com/en/feed.atom)
- [Azure Status](https://azure.status.microsoft/en-us/status/feed/)
- News feeds and blog RSS feeds
