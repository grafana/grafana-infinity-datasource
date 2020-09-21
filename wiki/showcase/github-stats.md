## Github Stats

We can leverage [Github graphql API](https://docs.github.com/en/graphql) to query the github stats using the plugin.

![image](https://user-images.githubusercontent.com/153843/93736971-c3392a80-fbd9-11ea-8597-dac9c0f9641b.png)

Sample Query given in the below example. You can customize your query to bring the stats you needed.

### Query Editor

![image](https://user-images.githubusercontent.com/153843/93736996-d3510a00-fbd9-11ea-8c05-065758d66e82.png)
![image](https://user-images.githubusercontent.com/153843/93737011-e1068f80-fbd9-11ea-8c82-ea516f83cf3d.png)

Query Used:

```graphql
{
  repository(owner:"$GithubUser", name:"$GithubRepo") {
    issues(last:20) {
      edges {
        node {
          author{
            login
          }
          state
          title
          url
        }
      }
    }
  }
}
```

### Datasource Configuration

Select **Advanced** mode and use your github username and PAT token as password

![image](https://user-images.githubusercontent.com/153843/93736929-b1578780-fbd9-11ea-9413-5585ff79d3a8.png)
