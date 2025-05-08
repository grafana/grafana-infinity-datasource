import { CSVParser } from '@/app/parsers/CSVParser';

const CSVResults1 = new CSVParser(``, {
  refId: '',
  type: 'csv',
  source: 'inline',
  data: '',
  format: 'table',
  root_selector: '',
  columns: [],
});
describe('CSVParser', () => {
  it('Basic', () => expect(CSVResults1.toTable()).toMatchSnapshot());
});
const CSVResults2 = new CSVParser(
  `
country,population
india,10
usa,7
uk,k
china,11
`,
  {
    refId: '',
    type: 'csv',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: '',
    columns: [
      {
        text: 'Country',
        type: 'string',
        selector: 'country',
      },
      {
        text: 'Population',
        type: 'number',
        selector: 'population',
      },
    ],
  },
  new Date('2022-05-18')
);
describe('CSVParser', () => {
  it('With Columns', () => {
    expect(CSVResults2.toTable()).toMatchSnapshot();
    expect(CSVResults2.toTimeSeries()).toMatchSnapshot();
  });
});
const CSVResults3 = new CSVParser(
  `
year,country,population
1990,india,10
1990,usa,7
1990,uk,5
1990,china,11
1990,india,11
1990,usa,8
1990,uk,5
1990,china,12
`,
  {
    refId: '',
    type: 'csv',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: '',
    columns: [
      {
        text: 'Year',
        type: 'timestamp',
        selector: 'year',
      },
      {
        text: 'Country',
        type: 'string',
        selector: 'country',
      },
      {
        text: 'Population',
        type: 'number',
        selector: 'population',
      },
    ],
  }
);
describe('CSVParser', () => {
  it('With Timestamp YYYY And Aggregation', () => {
    expect(CSVResults3.toTable()).toMatchSnapshot();
    expect(CSVResults3.toTimeSeries()).toMatchSnapshot();
  });
});

const CSVResults4 = new CSVParser(
  `
year,country,population
1990,india,10
1990,usa,7
1990,uk,5
1992,china,11
1990,india,11
1990,usa,8
1990,uk,5
1990,china,12
`,
  {
    refId: '',
    type: 'csv',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: '',
    columns: [],
  }
);
describe('CSVParser', () => {
  it('Auto Columns Table', () => {
    expect(CSVResults4.toTable()).toMatchSnapshot();
    expect(CSVResults4.toTimeSeries()).toMatchSnapshot();
  });
});
describe('CSVParser', () => {
  it('Parse numbers correctly', () => {
    const parser = new CSVParser(
      `
key,value
"normal number",123
"string number","123"
"number with decimal","123.45"
"number with comma","123,456.78"
`,
      {
        refId: '',
        type: 'csv',
        source: 'inline',
        data: '',
        format: 'table',
        root_selector: '',
        columns: [
          { selector: 'key', type: 'string', text: 'key' },
          { selector: 'value', type: 'number', text: 'value' },
        ],
      },
      new Date('2022-05-18')
    );
    expect(parser.toTable()).toMatchSnapshot();
    expect(parser.toTimeSeries()).toMatchSnapshot();
  });
});
describe('geo map', () => {
  let data = `"lat","long","desc","branches"
"51.5072","0.1276","London","2"
"35.6897","139.6922","Tokyo","3"
"18.9667","72.8333","Mumbai","10"`;
  it('table', () => {
    let input = new CSVParser(data, {
      refId: 'A',
      type: 'csv',
      source: 'inline',
      data,
      root_selector: '',
      format: 'table',
      columns: [
        { selector: 'lat', type: 'number', text: '' },
        { selector: 'long', type: 'number', text: '' },
        { selector: 'desc', type: 'string', text: '' },
        { selector: 'branches', type: 'number', text: '' },
      ],
    });
    expect(input.toTable()).toMatchSnapshot();
  });
});
