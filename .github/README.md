<!-- markdownlint-configure-file {
  "MD013": false,
  "MD033": false
} -->

<h1 align="center">
  Grafana Infinity Datasource
</h1>

<p align="center">Visualize data from JSON, CSV, XML, GraphQL and HTML endpoints in Grafana.</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#%EF%B8%8F-download">Download</a> •
  <a href="#%EF%B8%8F-documentation">Documentation</a> •
  <a href="#%EF%B8%8F-useful-links">Useful links</a> •
  <a href="#%EF%B8%8F-project-assistance">Project assistance</a> •
  <a href="#%EF%B8%8F-license">License</a>
</p>

<p align="center">
    <a href="https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource">
      <img src="https://raw.githubusercontent.com/grafana/grafana-infinity-datasource/main/src/img/icon.svg" alt="Grafana Infinity Datasource" width=140">
    </a>
</p>

## 🎯 Key Features

- Get data from multiple sources into grafana
- Supports various data formats
  - JSON
  - CSV / TSV / any delimited format
  - XML
  - GraphQL
  - HTML
  - RSS/ATOM
- Support various authentication
  - Basic authentication
  - Bearer token authentication
  - API Key authentication
  - OAuth passthrough
  - OAuth2 client credentials
  - OAuth2 JWT authentication
  - AWS/Azure/GCP authentication
  - Digest authentication
- Flexible data manipulation with UQL, GROQ, JSONata
- Supports alerting, recorded queries, public dashboards, query caching
- Utility variable functions
- Supports for Grafana node graph panel, annotations etc

## ⚙️ Download

You can download and install this grafana plugin using various options

- From [Grafana plugin catalog](https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/)
- From [Github release page](https://github.com/grafana/grafana-infinity-datasource/releases) (also available beta, pre-release versions)
- Using grafana cli
  - `grafana-cli plugins install yesoreyeram-infinity-datasource`
- Using docker
  - `docker run -p 3000:3000 -e "GF_INSTALL_PLUGINS=yesoreyeram-infinity-datasource" grafana/grafana:latest`

## 🎯 Documentation

For the plugin documentation, visit [plugin documentation website](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource).

## ⚡️ Useful Links

- [Plugin documentation](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource)
- [Demo video](https://youtu.be/Wmgs1E9Ry-s)

## 👍 Contributing

you can contribute in one of the following ways

- If you find any interesting APIs, [showcase](https://github.com/grafana/grafana-infinity-datasource/discussions/categories/show-and-tell) how you are using the API with Infinity datasource so that other community members will get benefit out of it.
- [Test different APIs](https://github.com/grafana/grafana-infinity-datasource/discussions/categories/specific-apis) and create bugs if not working as expected
- Read the [contributing guide](https://github.com/grafana/grafana-infinity-datasource/blob/main/CONTRIBUTING.md) for more details

## ⭐️ Project assistance

If you want to say **thank you** or/and support active development of `Grafana Infinity Datasource`:

- Add a [GitHub Star](https://github.com/grafana/grafana-infinity-datasource) to the project.
- Tweet about project [on your Twitter](https://twitter.com/intent/tweet?text=Checkout%20this%20cool%20%23grafana%20datasource%20%40grafanainfinity.%20%0A%0ALiterally,%20get%20your%20data%20from%20anywhere%20into%20%23grafana.%20JSON,%20CSV,%20XML,%20GraphQL,%20OAuth2,%20RSS%20feed,%20%23kubernetes,%20%23azure,%20%23aws,%20%23gcp%20and%20more%20stuff.%0A%0Ahttps%3A//grafana.com/docs/plugins/yesoreyeram-infinity-datasource%0A).
- Write articles about project on [Dev.to](https://dev.to/), [Medium](https://medium.com/) or personal blog.

## ⚠️ License

This project is licensed under [Apache 2.0](https://github.com/grafana/grafana-infinity-datasource/blob/main/LICENSE)
