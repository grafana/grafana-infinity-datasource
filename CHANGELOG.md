# Change Log

Change history of the project. All the feature updates, bug fixes, breaking changes will be documented here.

## [ 0.8.8 ]

- UQL: New command `jsonata` which helps to perform JSONata query over json, xml, csv APIs
- Chore: More logging added in backend for failure scenarios
- Chore: Provisioning helper added to the datasource config page which provides datasource yaml for provisioning

## [ 0.8.7 ]

- UQL: New command `distinct`
- UQL: New function `kv` which provide kv pair array from object. (useful when the results are key value format)
- UQL: New mathematical functions (`floor`/`ceil`/`round`/`sign`/`pow`/`sin`/`cos`/`tan`/`log`/`log2`/`log10`)
- Bug fix: Fixed a bug where error from the API causing segment violation error (#299)
- Bug fix: Fixed a bug where UQL editor throw error sometimes when using grafana versions higher than 8.3.4
- Bug fix: Fixed a bug where negative numbers in string were converted to positive numbers (#297)

## [ 0.8.6 ]

- UQL: Now support comments. Any new line starts with `#` will be treated as comment
- UQL: New command `mv-expand`
- UQL: New functions `parse_url`, `parse_urlquery`
- UQL: Fixed a bug where new line in UQL throws error when queries created from windows systems
- UQL: keyword suggestions for UQL Query editor

## [ 0.8.5 ]

- Auth: Fixed a bug where custom endpoint params were ignored when using OAuth2 client credentials
- Auth: Fixed a bug where TLS certs are not loaded correctly

## [ 0.8.4]

- Auth: Dedicated Auth types added for Api key authentication and bearer token authentication
- Security: Ability to configure allowed hosts for URL
- YAML: YAML query type support added via UQL. (experimental)

## [ 0.8.3 ]

- UQL: UQL update ( now support summarize by multiple fields, first, last summarizations )
- XML: Fixed a bug where numbers shown as null when using timeseries format. fix #254

## [ 0.8.2 ]

- XML: Fixed a bug where numbers shown as null when using timeseries format. fix #254

## [ 0.8.1 ]

- Auth: Forward OAuth identity support
- Auth: OAuth2 Client credentials authentication support - alpha
- Auth: OAuth2 JWT authentication support - alpha
- Chore: Query inspector now shows actual data in response meta data. (frame->schema->meta->custom)
- GROQ: GROQ Query support - alpha

## [ 0.8.0 ]

- TSV: custom query type for tsv files
- UQL: support for UQL queries
- Chore: secure query params passed to all requests by default
- NodeGraph: support for Node Graph panel
- Chore: basic E2E tests for config editor added
- Chore: typescript updates
- "as-is" data format added for debugging
- comma in the numbers are now ignored and considered as number
- variable editor, global query editor bug fixes. Previously, unable to add columns in variable editor
- fixes [#191](https://github.com/yesoreyeram/grafana-infinity-datasource/issues/191), [#146](https://github.com/yesoreyeram/grafana-infinity-datasource/issues/146), [#210](https://github.com/yesoreyeram/grafana-infinity-datasource/issues/210)

## [ 0.7.10 ]

- proxy support for outgoing requests

## [ 0.7.9 ]

- Ability to customize timeout

## [ 0.7.8 ]

- Bug fixes, docs update

## [ 0.7.7 ]

- Bug fixes and docs update
- DEPRECATED : URL field in the datasource config is now deprecated. Use URL in the Query Editor.
- DEPRECATED : Global queries are now deprecated in favour of Grafana's panel library

## [ 0.7.6 ]

- UnixTimeStamp variable added (alpha)
- Changed try url to [heroku](https://grafana-infinity-datasource.herokuapp.com/explore)

## [ 0.7.5 ]

- Fixed a bug where data not loading where no column names provided
- Support auto parse for more JSON types

## [ 0.7.4 ]

- Enabled support for annotations
- Results return correct frame name. Now returning RefId as frame name.
- Minimum required version of grafana is now 7.2.0
- Moved docs to gh-pages

## [ 0.7.3 ]

- Variable editor bug fixes
- Columnar format support

## [ 0.7.2 ]

- Github URLs normalized
- Auto find array data

## [ 0.7.1 ]

- Fix for [mixed datasource mode not working in 0.7](https://github.com/yesoreyeram/grafana-infinity-datasource/issues/78)

## [ 0.7.0 ]

- Data frame format added
- Custom secure query strings support added
- Support for custom headers and query strings in individual queries
- More CSV options - TSV, optional headers support, custom delimiters, etc
- Allow variables in root/rows selector
- Placeholder for migrating into backend plugin
- Migrated website from vuepress to gatsby
- Vercel deployment added for website

## [ 0.6.1 ]

- Plugin signed
- JSONPath support for JSON root selector
- Auto generate columns for CSV, JSON
- Support for Unix/epoch seconds format
- Support for filtering rows
- Variable Query support
- Logo updated
- Published to [grafana.com](https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/)

## [ 0.5.0 ]

- XML Support

## [ 0.4.0 ]

- Registered / Global Queries
- UNIX EPOCH / millisecond timestamp format
- Template variables support. Collection, CollectionLookup and Join variable
- Bug fixes

## [ 0.3.0 ]

- Authentication support
- Variables support in query url & data

## [ 0.2.0 ]

- GraphQL Support
- Mathematical expressions and Random Walk

## [ 0.1.0 ]

- Inline CSV / JSON support
- Stats / Timeseries format support

## [ 0.0.1 ]

- First working version
