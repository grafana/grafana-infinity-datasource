---
slug: "/wiki/time-formats"
title: "Time formats"
previous_page_title: "Template variables"
previous_page_slug: "/wiki/template-variables"
next_page_title: "Configuration"
next_page_slug: "/wiki/configuration"
---

## Time formats

Timestamp fields should be one of the standard javascript date format as specified [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date).

![image](https://user-images.githubusercontent.com/153843/92720934-3d0d2080-f35d-11ea-93e3-c1ff46d4ea59.png#center)

For example, below lists various valid timestamp formats. Your time field can be one of this format.

```
year,population
2017,8
2017-02,9
2017-03,9.3
2017/04,9.4
2017/05/23,9.4
2017-06-25T12:10:00Z,10.1
"July 12, 2017 03:24:00",12
2017/08/23 10:30,9.4
2017/09/23 10:30:20,9.4
2017-10-23 10:30:20,9.4
Thu Nov 23 2017 10:30:20 GMT+0000 (Greenwich Mean Time),10.1
"Sat, 23 Dec 2017 10:30:20 GMT",12
01/29/2018,12.4
```

## UNIX EPOCH Time formats

If your data is in unix epoch time formats (unix milliseconds format), You can select **Timestamp ( UNIX ms )** / **timestamp_epoch** as as type. Below snippet shows some examples

```
Year,Population
1262304000000,200
1293840000000,201
```

In the above example, first row represents year 2010 and second row represents 2011.

Unix epoch time also supported. You can select **Timestamp ( UNIX s )** / **timestamp_epoch_s** as type if your api data is in seconds.
