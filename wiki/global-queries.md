## Global Queries / Registered Queries

Working with same queries in multiple dashboards might be hard some times. To change a query, you need to update all the dashboards. So Infinity datasource gives an option to register queries globally and then allows to reuse the queries across dashboards.

### Registering Query

To register a query, in the datasource instance settings perform the following actions

* Click **Add Global Query** button
* Change the name and id of the query. Id should be unique per datasource instance.
* Enter the query fields.
* Click `Save`

![image](https://user-images.githubusercontent.com/153843/93780448-1635d080-fc20-11ea-8c92-d6e91dbcf003.png)

You can have multiple queries registered per datasource instance.

### Using Registered queries in the panel

In order to use the registered query in the dashboard, you have to select `Global Query` / `global` as type. Then select the query you needed from the list.

![image](https://user-images.githubusercontent.com/153843/93780923-ab38c980-fc20-11ea-9d87-078233102905.png)

### Provision the global queries

You can also provision the global queries in the datasource provisioning. Below example provides a sample of inline csv query provisioning

```yaml
apiVersion: 1
datasources:
- name: ProvisionedQueries
  type: yesoreyeram-infinity-datasource
  access: proxy
  isDefault: false
  basicAuth: false
  jsonData:
       datasource_mode: "basic"
       global_queries:
          - name: Countries
            id: countries
            query:
               type: csv
               source: inline
               format: table
               data : |
                    country,continent
                    india,asia
                    china,asia
                    uk,europe
               columns:
                    - selector: country
                      text: Country
                      type: string
                    - selector: continent
                      text: Continent
                      type: string
  version: 1
  readOnly: true
```
