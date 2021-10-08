---
slug: '/wiki/local-sources'
title: 'Local Sources / Files'
previous_page_title: "Time Formats"
previous_page_slug: "/wiki/time-formats"
next_page_title: "Installation"
next_page_slug: "/wiki/installation"
---

## Local Sources / Files

If you need to retrieve the data from local file in the grafana server, you can use **Local File** as your source.

## Configuring local sources / local files

In order to use the local files, first you need to enable them and provide list of allowed directories to query.

![image](https://user-images.githubusercontent.com/153843/118464665-0449f600-b6f9-11eb-916f-de974cf9e9c8.png#center)

## Querying local files

Once you configured the local sources, you can query them in your query.

![image](https://user-images.githubusercontent.com/153843/118464712-0f048b00-b6f9-11eb-9fa5-3a71b08bad2a.png#center)

If the grafana server doesn't provided access or not configured in the datasource settings, panel query will throw the error.

![image](https://user-images.githubusercontent.com/153843/118464797-23488800-b6f9-11eb-8c8d-b64f933be487.png#center)
