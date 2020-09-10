## HTML URL

In the below example, we are going to convert the HTML URL `https://grafana.com/about/team/` into grafana datasource.

![image](https://user-images.githubusercontent.com/153843/92382094-f4a6f600-f103-11ea-8035-e1bbd9157629.png)

Once you open the page in browser, right click and inspect the element (first element of the array you want to display). Then copy the selector as your root / rows element. 

![image](https://user-images.githubusercontent.com/153843/92396876-ac94cd00-f11d-11ea-850d-f1754f980fc7.png)

Then you can select, individual properties of the row as columns of the table as shown in the example image. You can select any element with in the row context.

Example :

- `h4` --> h4 element will be selected
- `.team__title` --> Element with the class `team__title` will be selected
- `td:nth-child(4)` --> 4th td element within the row context will be selected. This will be useful when you element doesn't have any id or duplicate class names. 
