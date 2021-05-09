---
slug: "/wiki/template-variables"
title: "Template variables"
---


## Standard Mode ( Infinity Query )

Like panels, you can have your own CSV/JSON in your variable. Variable queries are expected to return one or more columns. This will give you the ability to get your variables set from CSV/JSON/XML or any other external sources.

If two columns returned, first column value will be used as display text and second column will be used as value. If more than 2 columns returned, all the results will be flattened and returned as variable list.

## Legacy Mode Variable

In legacy mode, you have the option to write in your query in the following formats.

### Collection ( Key value pair )

List of key value pair wrapped with `Collection()`. Text/key followed by values separated by commas.

For example, the query  `Collection(Prod,pd,Non Prod,np,Development,dev,SIT,sit)` produce 4 variables as follows

![image](https://user-images.githubusercontent.com/153843/95761696-993cca80-0ca4-11eb-867a-60d8caa03d39.png)

Under the hood following 4 keys have corresponding values

### CollectionLookup ( Key value pair and Lookup Variable )

`CollectionLookup(pd,prod-server,np,nonprod-server,dev,dev-server,$Nested)` . Last value should be the key to lookup. 

![image](https://user-images.githubusercontent.com/153843/95761926-ec168200-0ca4-11eb-8758-ff5885564180.png)

![image](https://user-images.githubusercontent.com/153843/95762001-081a2380-0ca5-11eb-957a-34bfca767769.png)

![image](https://user-images.githubusercontent.com/153843/95762082-241dc500-0ca5-11eb-9d9f-b3f6d1440b76.png)

### Join ( Concat variables into a new variable )

Example : `Join($Environment,-hello-,$ServerName)` will produce a new string variable from three separate strings. 

### Random ( Random element from CSV)

Example : `Random(A,B,C)` will produce one of A/B/C. When creating a variable of this type, set it to refresh "on time range change", so it will produce random element when dashboard refreshes. 

More details available in [this github issue](https://github.com/yesoreyeram/grafana-infinity-datasource/issues/4).
