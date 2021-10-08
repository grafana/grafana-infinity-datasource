---
slug: '/wiki/url'
title: 'URL'
previous_page_title: 'Provisioning'
previous_page_slug: '/wiki/provisioning'
next_page_title: 'Configuration'
next_page_slug: '/wiki/configuration'
---

## URL

You can enter any URL in the query URL field. URL should be a valid json / csv / graphql / xml / html endpoint.

In the query editor, click the expand icon next the URL field to configure more query URL options like HTTP Method (GET/POST), additional headers and additional query strings.

**Leave the URL in the datasource configuration blank.** URL in the datasource config is now deprecated. Use URL in the query editor instead.

## Variables in URL

In the query URL, you can use any [grafana global variables](https://grafana.com/docs/grafana/latest/variables/variable-types/global-variables) or any dashboard variables.

For example,

```bash
https://example.com/path/subpath?from=${__from:date:YYYY-MM}&to=${__to:date:YYYY-MM}

will produce

https://example.com/path/subpath?from=2020-01&to=2020-04
```

## Secure keys in the URL query strings

In some cases, you may need to pass the secure API keys as part of your URL. Hard-coding them in the panel is not secure. You can configure those secure keys in the datasource settings and then use them in the query URL using `${__qs.KEY_NAME}` style reference.

### Configuring secure keys in datasource settings

![image](https://user-images.githubusercontent.com/153843/116439894-f3b80580-a847-11eb-9788-8c60bce00866.png#center)

### Using the secure keys in panel URLs

For example, You want to use the url `https://example.com/hello?mykey=bar&something=else` where **bar** is your secret. So instead of hard-coding you can use `https://example.com/hello?mykey=${__qs.foo}&something=else` where `${__qs.foo}` represents the key **foo** in the dashboard settings.

![image](https://user-images.githubusercontent.com/153843/116440219-295cee80-a848-11eb-9c2e-d33e363c49fa.png#center)

> Secure keys feature is available only from 0.7 version of the plugin

## Headers in the URL

You can configure the headers required for the URL in the datasource config and also in the query headers. By default infinity datasource automatically sets two headers. Header `User-Agent : Grafana` will be set for all requests and `Content-Type : application/json`. You can override these headers in the datasource configuration page.
