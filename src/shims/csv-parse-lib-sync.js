// uql@0.0.24 still requires the csv-parse@4 path `csv-parse/lib/sync`, which
// exported the parse function as module.exports. csv-parse@7 only exposes
// `csv-parse/sync` with a named `parse` export. Keep a thin shim so forcing
// the nested uql dependency onto the patched 7.0.2 release keeps working.
const { parse } = require('csv-parse/sync');

module.exports = parse;
