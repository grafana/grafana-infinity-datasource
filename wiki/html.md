---
slug: "/wiki/html"
title: "HTML"
---

In the below example, we are going to convert the HTML URL `https://grafana.com/about/team/` into grafana datasource.

![image](https://user-images.githubusercontent.com/153843/92399290-faabcf80-f121-11ea-9261-b06c708e81c0.png)

Once you open the page in browser, right click and inspect the element (first element of the array you want to display). Then copy the selector as your root / rows element. 

![image](https://user-images.githubusercontent.com/153843/92396876-ac94cd00-f11d-11ea-850d-f1754f980fc7.png)

Then you can select, individual properties of the row as columns of the table as shown in the example image. You can select any element with in the row context.

![image](https://user-images.githubusercontent.com/153843/92382094-f4a6f600-f103-11ea-8035-e1bbd9157629.png)

![image](https://user-images.githubusercontent.com/153843/92747321-fbd83900-f37b-11ea-8be9-9366386dc6e2.png)

Example :

- `h4` --> h4 element will be selected
- `.team__title` --> Element with the class `team__title` will be selected
- `td:nth-child(4)` --> 4th td element within the row context will be selected. This will be useful when you element doesn't have any id or duplicate class names. 

### Limitations

* Only symmetrical data can be scrapped. (Example: `table` elements with `colspan` or `rowspan` might break the scrapping)
* Only text element is supported. Attribute scraping not available
* To scrap the AJAX content, use JSON api
* Websites may block you/your IP address, If the scrapping is at high frequency/refresh rate.
* Caching is not implemented. So be aware of the rate limits.
* Use CORS servers as a proxy if the websites blocks CORS request. Refer the installation page about setting up CORS proxy.
