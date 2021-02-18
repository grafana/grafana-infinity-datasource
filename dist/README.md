<div style="text-align: center; width: 100%">
    <h1 align="center">
        <br/>
        <a href="https://yesoreyeram.github.io/grafana-infinity-datasource" target="_blank"><img src="https://raw.githubusercontent.com/yesoreyeram/grafana-infinity-datasource/master/src/img/icon.svg" alt="Grafana Infinity Datasource" width="200" /></a>
        <br />
        Grafana Infinity Datasource
        <br />
    </h1>
    <h4 align="center">Grafana datasource plugin to fetch data from JSON, CSV, XML, GraphQL and HTML.
    </h4>
    <br />
    <div align="center">
        <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/actions?query=workflow%3A%22Build+%26+Publish%22" target="_blank"><img src="https://github.com/yesoreyeram/grafana-infinity-datasource/workflows/Build%20&%20Publish/badge.svg" /></a>
        <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/issues" target="_blank"><img src="https://img.shields.io/github/issues/yesoreyeram/grafana-infinity-datasource" /></a>
        <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/yesoreyeram/grafana-infinity-datasource" alt="Grafana Infinity data source license" /></a>
        <a href="https://GitHub.com/yesoreyeram/grafana-infinity-datasource/graphs/commit-activity" target="_blank"><img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Grafana Infinity datasource is maintained" /></a>
        <a href="https://codeclimate.com/github/yesoreyeram/grafana-infinity-datasource/maintainability" target="_blank"><img src="https://api.codeclimate.com/v1/badges/7e2ae1bce7310890065c/maintainability" /></a>
    </div>
    <br />
    <p align="center">
        <a href="#key-features">Key Features</a> •
        <a href="https://github.com/yesoreyeram/grafana-infinity-datasource" target="_blank">Github</a>•
        <a href="https://yesoreyeram.github.io/grafana-infinity-datasource" target="_blank">Wiki</a>•
        <a href="https://sriramajeyam.com/grafana-infinity-datasource/wiki/installation">Installation</a> •
        <a href="#license">License</a>
    </p>
    <br />
    <p align="center">
        <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/34" target="_blank"><img src="https://user-images.githubusercontent.com/153843/108427049-7dd66300-7234-11eb-8d27-cec50945a66c.png" width="600"/></a>
    </p>
    <br/>
    <br/>
</div>

## Key Features

* JSON, CSV, XML, GraphQL & HTML Datasources
* Data from external url / Inline data
* Support for Authenticated URLs
* Utility variables
* Mathmatical series Generation

## JSON

You can visualize JSON from any URL. Any valid JSON returning array of objects at root level or at any of the node can be used as the datasource. More information about using JSON datasource is available in the [github discussion](https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/34).

If your JSON doesn't have any time column and only have point-in-time metric values, still you can use your json to pretend like timeseries. Refer the above github discussion for more details.

In the below example, we are visualising a [json data](https://gist.githubusercontent.com/yesoreyeram/2433ce69862f452b9d0460c947ee191f/raw/f8200a62b68a096792578efd5e3c72fdc5d99d98/population.json) without time field. Our JSON  has only two fields aka `country` and `population`.  So we asked the plugin to add a dummy time field to the data so that we can visualize them in any of the grafana's stock panel. If you closely look at the image above, you can see we specified 'format' as **timeseries**.  

![image](https://user-images.githubusercontent.com/153843/108415716-cdf9f900-7225-11eb-8e0d-5d767104a080.png)


For reference, JSON data from the URL is given below

```json
[
  { "country": "india", "population": 300 },
  { "country": "usa", "population": 200 },
  { "country": "uk", "population": 150 },
  { "country": "china", "population": 400 }
]
```

## CSV

Same as JSON, you can visualize any csv URL using the datasource. CSVs are expected to have headers. You can visualize CSV just using the url and wihtout any additional configuration. By default all the CSV fields will be considered as text fields. If you specify individual fields and types, only the specific fields will be displayed. More information about using CSV datasource is available in the [github discussion](https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/36).

![image](https://user-images.githubusercontent.com/153843/108428461-8465da00-7236-11eb-8769-b1c145cbe203.png)

## XML

You can visualize any XML data using the infinity data source with few simple steps. Frst you need to specify url of the xml, then specify the root/rows value and then finally columns.

If your rows are directly under the root node, you can specify the rows as shown below. In my example I want to list all the [CDs in the CATALOG](https://gist.githubusercontent.com/yesoreyeram/655a362eed0f51be24e16d3f1127a31d/raw/aa58549a5cf9d06dae1204b5a09be5d651adc744/text.xml). So my root node is `CATALOG.CD`. Then for columns, I can specify each column and its type as shown below

![image](https://user-images.githubusercontent.com/153843/108434283-50db7d80-723f-11eb-858e-25a7fef18edb.png)

You can also visualise complex XML structures explained in this [github discussion](https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/37)


## License

Grafana Infinity datasource is licensed under the [Apache 2.0 License](https://github.com/yesoreyeram/grafana-infinity-datasource/blob/master/LICENSE).
