# Grafana Infinity Datasource

Visualize data from JSON, CSV, XML, GraphQL and HTML endpoints.

[![click here for documentation](https://user-images.githubusercontent.com/153843/189100076-7fe3535d-0bc3-4e4a-b37d-14934ae621db.png)](https://yesoreyeram.github.io/grafana-infinity-datasource)

## Documentation

Detailed documentation and examples are available in [plugin website](https://yesoreyeram.github.io/grafana-infinity-datasource)

Docs on how to use JSON API - [Docs](https://yesoreyeram.github.io/grafana-infinity-datasource/wiki/json)

### [Demo video](https://youtu.be/Wmgs1E9Ry-s)

## Try before installing

Using the following links,You can try **Infinity datasource plugin** without installing grafana/plugin. You can change the URL, customize headers to get the results of your API

### [Try before installing - UQL](<https://grafana-infinity-datasource.herokuapp.com/explore?orgId=1&left=%7B%22datasource%22:%22Infinity%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22type%22:%22uql%22,%22source%22:%22url%22,%22format%22:%22table%22,%22url%22:%22https:%2F%2Fgithub.com%2Fvega%2Fvega%2Fblob%2Fmain%2Fdocs%2Fdata%2Fcars.json%22,%22url_options%22:%7B%22method%22:%22GET%22,%22data%22:%22%22%7D,%22root_selector%22:%22%22,%22columns%22:%5B%5D,%22filters%22:%5B%5D,%22global_query_id%22:%22%22,%22uql%22:%22parse-json%20%5Cn%23%7C%20Below%20lines%20are%20commented.%20Remove%20hash%20infront%20of%20below%20lines%20one%20by%20one%20and%20run%20query%20to%20see%20how%20uql%20works%5Cn%23%7C%20project%20%5C%22Name%5C%22,%20%5C%22Miles_per_Gallon%5C%22,%20%5C%22Cylinders%5C%22,%20%5C%22Displacement%5C%22,%20%5C%22Origin%5C%22,%20%5C%22Year%5C%22%5Cn%23%7C%20extend%20%5C%22Year%5C%22%3Dtodatetime(%5C%22Year%5C%22)%5Cn%23%7C%20project-away%20%5C%22Miles_per_Gallon%5C%22%5Cn%23%7C%20summarize%20count(),%20%5C%22Max%20Cylinders%5C%22%3Dmax(%5C%22Cylinders%5C%22)%20by%20%5C%22Origin%5C%22%5Cn%23%7C%20order%20by%20%5C%22Max%20Cylinders%5C%22%20desc%5Cn%23%7C%20limit%202%22%7D%5D,%22range%22:%7B%22from%22:%22now-1h%22,%22to%22:%22now%22%7D%7D>)

### [Try before installing - JSON](https://grafana-infinity-datasource.herokuapp.com/d/try/try?orgId=1&editPanel=2)

### [Try before installing - CSV](https://grafana-infinity-datasource.herokuapp.com/d/try/try?orgId=1&editPanel=3)

### [Demo Grafana](https://grafana-infinity-datasource.herokuapp.com/d/yesoreyeram-infinty-datasource)

## Known limitations

- Alerting only supports on `JSON`/`GraphQL`/`CSV`/`TSV` type queries with `backend` parser.
- Recorded queries only supports on `JSON`/`GraphQL`/`CSV`/`TSV` type queries with `backend` parser.
- Public dashboards only supports on `JSON`/`GraphQL`/`CSV`/`TSV` type queries with `backend` parser.
