# Infinity Datasource

<p align="center">
  <img align="center" src="https://user-images.githubusercontent.com/153843/92741922-03491380-f377-11ea-9c31-9a744afd3388.png" width="800" height="400"/>
</p>

## Features

* Inline CSV / JSON datasource
* JSON / CSV / HTML urls as a data source
* Turn any website into grafana datasource

### Road Map / Upcoming features

* Header-less CSV files support
* Generic Auth Page
* Selecting attributes of HTML elements instead of text of the html element
* Custom fields support. Example: Sum of two fields. Joining two fields etc.
* Filter the results. Example: Ignore-first-row, Ignore-nth-rows, Ignore-odd, Ignore-even, value-above-30, first-20 etc.

## CORS setup

Some URLs you might not able to access directly due to CORS restriction set by the websites. At that time, you may need to use proxy servers or hosted services as mentioned [here](https://stackoverflow.com/a/32167044/1576253). Example: Use **https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/wiki/FIFA_World_Cup** to connect with wikipedia.

You can setup your own cors-anywhere proxy by cloning https://github.com/Rob--W/cors-anywhere as mentioned [here](https://stackoverflow.com/a/47085173/1576253)

## License

Grafana Infinity datasource is licensed under the [Apache 2.0 License](https://github.com/yesoreyeram/grafana-infinity-datasource/blob/master/LICENSE).
