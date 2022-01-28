const j = require('jsonpath-plus');
const data = [
  { id: '647', address: { locality: 'Bonn', postal_code: '56867', street_name: 'Bahnhofstrasse', street_number: 5 }, something: null, something_else: null },
  { id: '648', address: { locality: 'Bonn', postal_code: '56867', street_name: 'Beethovenstrasse', street_number: 37 }, something: null, something_else: null },
  { id: '649', address: { locality: 'Köln', postal_code: '56854', street_name: 'Hauptstrasse', street_number: 12 }, something: null, something_else: null },
];
console.log(j);
