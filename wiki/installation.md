## Installation

There are multiple ways to install this plugin into your grafana instance

### Download and extract zip file

Download the latest zip file from [github](https://github.com/yesoreyeram/grafana-infinity-datasource/releases) and extract into your grafana plugin folder. Then restart Grafana.

### Using grafana-cli

If you are using grafana-cli, execute the following command to install the plugin

```sh
grafana-cli plugins install yesoreyeram-infinity-datasource
```
or

```sh
grafana-cli --pluginUrl <ZIP_FILE_URL> plugins install yesoreyeram-infinity-datasource
```

Example:

```sh
grafana-cli --pluginUrl https://github.com/yesoreyeram/grafana-infinity-datasource/releases/download/v0.6.0-alpha2/yesoreyeram-infinity-datasource-0.6.0.zip plugins install yesoreyeram-infinity-datasource
```

### Using helm chart

If you use helm chart to provision grafana, use the following config to install the plugin

```yml
plugins:
  - <ZIP_FILE_URL>;yesoreyeram-infinity-datasource
```

Example:

```yml
plugins:
  - https://github.com/yesoreyeram/grafana-infinity-datasource/releases/download/v0.6.0-alpha2/yesoreyeram-infinity-datasource-0.6.0.zip;yesoreyeram-infinity-datasource
```

## Configuration

Once the plugin installed, you need to create an instance of the datasource. To create an instance follow the steps

* Go to `http://localhost:3000/datasources` and select *Add data source*
* Search for **Infinity** plugin
* Give some name. Any name. Sure; Your kitten names are allowed.
* Select mode as `Basic`
* Save.

If you ever need an URL to be authenticated or proxy through grafana server, you need to use `Advanced` mode.  With advanced mode consider the following.

* Only one domain allowed. (If you need to access multiple domains, use multiple instances of the datasource)
* Specify the domain name as the URL in the datasource settings. This can also contain common url path. Example: `https://api.github.com/graphql`
* While querying, use the remaining part of the the URL. For example, using `/my-endpoint` will yield the final url as `https://api.github.com/graphql/my-endpoint`

## Provisioning

If you want to [provision](https://grafana.com/docs/grafana/latest/administration/provisioning/#provisioning-grafana) your datasources via grafana provisioning feature, use the following settings

### Basic Provisioning

If you need to provision via file, use the following settings for the basic use cases.

```yaml
- name: <<YOUR DATASOURCE INSTANCE NAME>>
  type: yesoreyeram-infinity-datasource
  access: proxy
  isDefault: false
  jsonData:
       datasource_mode: "basic"
  version: 1
  readOnly: true
```

### Advanced Provisioning

If you need an advanced version of the datasource, use the following format.

```yaml
- name: <<YOUR DATASOURCE INSTANCE NAME. Example -- Github>>
  type: yesoreyeram-infinity-datasource
  access: proxy
  isDefault: false
  url: <<YOUR URL. Example -- https://api.github.com/graphql>>
  basicAuth: true
  basicAuthUser: <<YOUR USER NAME. Example -- mygithubid>>
  jsonData:
       datasource_mode: "advanced"
  secureJsonData:
       basicAuthPassword: <<YOUR PASSWORD. Example -- MY_Github_PAT_Token>>
  version: 1
  readOnly: true
```
