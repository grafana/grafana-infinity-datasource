#!/bin/sh

mkdir -p dist

outfile=./dist/README.md

touch $outfile
echo "" > $outfile

# echo '<h1 style="text-align:center;" class="btn-danger" ><a href="https://yesoreyeram.github.io/grafana-infinity-datasource" target="_blank" style="color:white;text-decoration:none;">Click here for plugin wiki site with more details</a></h1>\n\n' >> $outfile

cat README.md >> $outfile
echo "\n" >> $outfile

cat ./wiki/csv.md >> $outfile
echo "\n" >> $outfile
cat ./wiki/json.md >> $outfile
echo "\n" >> $outfile
cat ./wiki/graphql.md >> $outfile
echo "\n" >> $outfile
cat ./wiki/xml.md >> $outfile
echo "\n" >> $outfile
cat ./wiki/html.md >> $outfile
echo "\n" >> $outfile
cat ./wiki/global-queries.md >> $outfile
echo "\n" >> $outfile
cat ./wiki/template-variables.md >> $outfile
echo "\n" >> $outfile
cat ./wiki/installation.md >> $outfile
echo "\n" >> $outfile
cat ./CHANGELOG.md >> $outfile
echo "\n" >> $outfile

exit 0;
