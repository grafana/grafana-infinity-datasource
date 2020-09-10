# Infinity Datasource

## Features

* Turn any website into grafana datasource
* Inline CSV / JSON support
* JSON / CSV / HTML urls as a data source

### Road Map / Upcoming features

* Selecting attributes of HTML elements instead of text of the html element
* Filter the results. Example: Ignore-first-row, Ignore-nth-rows, Ignore-odd, Ignore-even etc.
* Header-less CSV files support
* Custom fields support. Example: Sum of two fields. Joining two fields etc.

## HTML URL

In the below example, we are going to convert the HTML URL `https://grafana.com/about/team/` into grafana datasource.

![image](https://user-images.githubusercontent.com/153843/92382094-f4a6f600-f103-11ea-8035-e1bbd9157629.png)

Once you open the page in browser, right click and inspect the element (first element of the array you want to display). Then copy the selector as your root / rows element. 

![image](https://user-images.githubusercontent.com/153843/92396876-ac94cd00-f11d-11ea-850d-f1754f980fc7.png)

Then you can select, individual properties of the row as columns of the table as shown in the example image. You can select any element with in the row context.

Example :

- `h4` --> h4 element will be selected
- `.team__title` --> Element with the class `team__title` will be selected
- `td:nth-child(4)` --> 4th td element within the row context will be selected. This will be useful when you element doesn't have any id or duplicate class names. 

## CORS setup

Some URLs you might not access directly due to CORS restriction set by the websites. At that time you may need to use proxy servers or hosted services as mentioned [here](https://stackoverflow.com/a/32167044/1576253). Example: Use **https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/wiki/FIFA_World_Cup** to connect with wikipedia.


## License

Grafana Infinity datasource is licensed under the [Apache 2.0 License](https://github.com/yesoreyeram/grafana-infinity-datasource/blob/master/LICENSE).
