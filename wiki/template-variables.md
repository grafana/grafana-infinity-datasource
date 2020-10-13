## variables

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
