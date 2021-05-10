---
slug: "/wiki/url"
title: "URL"
---

### Secure keys in the URL query strings

In some cases, you may need to pass the secure API keys as part of your URL. hard-coding them in the panel is not a good idea for security reasons. Now you can use  the keys from datasource settings.

#### Configuring secure keys in datasource settings

![image](https://user-images.githubusercontent.com/153843/116439894-f3b80580-a847-11eb-9788-8c60bce00866.png)

#### Using the secure keys in panel URLS

![image](https://user-images.githubusercontent.com/153843/116440219-295cee80-a848-11eb-9c2e-d33e363c49fa.png)

For example, You want to use the url `https://example.com/hello?mykey=bar&something=else` where **bar** is your secret. So instead of hard-coding you can use `https://example.com/hello?mykey=${__qs.foo}&something=else` where `${__qs.foo}` represents the key **foo** in the dashboard settings.

> This feature is available only from 0.7 version of the plugin

### CORS Issues

If the API endpoints or web pages are protected by CORS, you cannot query them directly. Either you need to use a cors proxy or grafana proxy

#### CORS proxy

You can use proxy servers or hosted services as mentioned [here](https://stackoverflow.com/a/32167044/1576253) to overcome the CORS issue. Example: Use **https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/wiki/FIFA_World_Cup** to connect with wikipedia.
 
You can setup your own cors-anywhere proxy by cloning https://github.com/Rob--W/cors-anywhere as mentioned [here](https://stackoverflow.com/a/47085173/1576253)

#### Grafana Proxy

Alternatively, you can use grafana proxy as to overcome the CORS issue. The limitation of using grafana proxy is that you need to create datasource for each domains you are trying to connect. Specify the domain of URL in `https://example.com` format. (without trailing spaces). In the below example, screenshots explaining how to connect wikipedia via the grafana proxy.

![image](https://user-images.githubusercontent.com/153843/100860274-35ef3d80-3488-11eb-929b-be096edadb8a.png)

![image](https://user-images.githubusercontent.com/153843/100860310-430c2c80-3488-11eb-9fe5-168e22fa55a2.png)

