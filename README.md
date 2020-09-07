<p align="center">
    <a href="https://yesoreyeram.github.io/grafana-infinity-datasource">
        <h1 align="center">Grafana Infinity Data source</h2>
    </a>
    <h5 align="center">Infinity data source plugin for Grafana. Turn any website into your grafana datasource.</h5>
</p>
<p align="center">
    <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/actions?query=workflow%3A%22Build+%26+Publish%22" target="_blank"><img src="https://github.com/yesoreyeram/grafana-infinity-datasource/workflows/Build%20&%20Publish/badge.svg"/></a>
    <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/issues" target="_blank"><img src="https://img.shields.io/github/issues/yesoreyeram/grafana-infinity-datasource"/></a>
    <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/yesoreyeram/grafana-infinity-datasource" alt="Grafana Infinity data source license" /></a>
    <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs are welcome" /></a>
    <a href="https://GitHub.com/yesoreyeram/grafana-infinity-datasource/graphs/commit-activity"><img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Grafana Infinity datasource is maintained" /></a>
    <a href="https://codeclimate.com/github/yesoreyeram/grafana-infinity-datasource/maintainability"><img src="https://api.codeclimate.com/v1/badges/fe316cba222e99e573dd/maintainability" /></a>
</p>
<p align="center">
    <img src="https://user-images.githubusercontent.com/153843/92399290-faabcf80-f121-11ea-9261-b06c708e81c0.png" width="500" height="200"></img><br/>
    <img src="https://user-images.githubusercontent.com/153843/92382187-1a33ff80-f104-11ea-92ec-e5c4fa83fd3f.png" width="500" height="200"></img>
</p>

## Features

* Turn any website into grafana datasource
* JSON / CSV / HTML urls as a data source
    * Selecting attributes of HTML elements instead of text of the html element (Work in progress)
    * Filter the results (Work in progress). Example: Ignore-first-row, Ignore-nth-rows, Ignore-odd, Ignore-even etc.
    * Header-less CSV files support (Work in progress)
    * Custom fields support (Work in progress). Example: Sum of two fields. Joining two fields etc.

More screenshots on how to use this plugin is available [here](https://github.com/yesoreyeram/grafana-infinity-datasource/issues/1).

## JSON URL as a datasource

In the below example, we are going to convert the JSON URL `https://jsonplaceholder.typicode.com/todos` into a grafana datasource.

![image](https://user-images.githubusercontent.com/153843/92381992-bf020d00-f103-11ea-936d-94f903faa5e6.png)

The URL returns an array of objects. Each item in the array goes as a table row. Property of each object goes into column of the table. By default, the datasource will not consider any columns for display. You have to manually specify the column names and corresponding properties in the JSON object.

**Note:** As the URL returns an array of objects, root selector / row have to be blank. If the root of the document is an object and you want to select specific property of the object, you can specify the selector of the object as a root selector / row. Example given [here](https://github.com/yesoreyeram/grafana-infinity-datasource/issues/1#issue-694996991).

## CSV URL as a datasource

In the below example, we are going to convert the CSV URL `https://gist.githubusercontent.com/yesoreyeram/64a46b02f0bf87cb527d6270dd84ea47/raw/32ae9b1a4a0183dceb3596226b818c8f428193af/sample-with-quotes.csv` into a grafana datasource.

![image](https://user-images.githubusercontent.com/153843/92382040-d8a35480-f103-11ea-8ff8-48c7ca211062.png)

This is same as your JSON configuration. Ignore the root / rows as each line of CSV will be your rows. Though your csv file have columns, specify them as columns manually. Columns will appear in the same order you specify.

## HTML URL as a datasource

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

## Installation

There are multiple ways to install this plugin into your grafana instance

### Download and extract zip file

Download the zip file from [github](https://github.com/yesoreyeram/grafana-infinity-datasource/archive/master.zip) and extract into your grafana plugin folder. Then restart Grafana.

### Using grafana-cli

If you are using grafana-cli, execute the following command to install the plugin

```
grafana-cli --pluginUrl https://github.com/yesoreyeram/grafana-infinity-datasource/archive/master.zip plugins install yesoreyeram-infinity-datasource
```

### Using helm chart

If you use helm chart to provision grafana, use the following config to install the plugin

```
plugins:
  - https://github.com/yesoreyeram/grafana-infinity-datasource/archive/master.zip;yesoreyeram-infinity-datasource
```

## Configuration

Once the plugin installed, you need to create an instance of the datasource. To create an instance follow the steps

* Go to `http://localhost:3000/datasources` and select *Add data source*
* Search for **Infinity** plugin
* Give some name. Any name. Sure; Your kitten names are allowed.
* Save (and test)

## License

Grafana Infinity datasource is licensed under the [Apache 2.0 License](https://github.com/yesoreyeram/grafana-infinity-datasource/blob/master/LICENSE).
