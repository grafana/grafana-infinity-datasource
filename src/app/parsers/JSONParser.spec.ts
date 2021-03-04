import { JSONParser } from './JSONParser';
import { InfinityQuerySources, InfinityQueryFormat, InfinityQueryType, ScrapColumnFormat } from './../../types';

const JSONResults1 = new JSONParser(
  {},
  {
    refId: '',
    type: InfinityQueryType.JSON,
    source: InfinityQuerySources.Inline,
    data: '',
    format: InfinityQueryFormat.Table,
    url: '',
    url_options: {
      method: 'GET',
    },
    root_selector: '',
    columns: [],
  }
);
describe('JSONParser', () => {
  it('Basic', () => {
    expect(JSONResults1.toTable().rows.length).toBe(0);
    expect(JSONResults1.toTable().columns.length).toBe(0);
  });
});

const JSONResults2 = new JSONParser(
  [
    {
      name: 'foo',
      age: 20,
    },
    {
      name: 'bar',
      age: 25,
    },
  ],
  {
    refId: '',
    type: InfinityQueryType.JSON,
    source: InfinityQuerySources.Inline,
    data: '',
    format: InfinityQueryFormat.Table,
    url: '',
    url_options: {
      method: 'GET',
    },
    root_selector: '',
    columns: [
      {
        text: 'Name',
        type: ScrapColumnFormat.String,
        selector: 'name',
      },
    ],
  }
);
describe('JSONParser', () => {
  it('With Columns', () => {
    expect(JSONResults2.toTable().rows.length).toBe(2);
    expect(JSONResults2.toTable().rows[0].length).toBe(1);
    expect(JSONResults2.toTable().rows[1][0]).toBe('bar');
    expect(JSONResults2.toTable().columns.length).toBe(1);
  });
});

const JSONResults3 = new JSONParser(
  {
    id: 'hello',
    users: [
      {
        name: 'foo',
        age: 20,
      },
      {
        name: 'bar',
        age: 25,
      },
      {
        name: 'baz',
        age: 30,
      },
    ],
  },
  {
    refId: '',
    type: InfinityQueryType.JSON,
    source: InfinityQuerySources.Inline,
    data: '',
    format: InfinityQueryFormat.Table,
    url: '',
    url_options: {
      method: 'GET',
    },
    root_selector: 'users',
    columns: [
      {
        text: 'Name',
        type: ScrapColumnFormat.String,
        selector: 'name',
      },
      {
        text: 'Age',
        type: ScrapColumnFormat.String,
        selector: 'age',
      },
    ],
  }
);
describe('JSONParser', () => {
  it('With Columns & Root Selector', () => {
    expect(JSONResults3.toTable().rows.length).toBe(3);
    expect(JSONResults3.toTable().rows[0].length).toBe(2);
    expect(JSONResults3.toTable().rows[1][0]).toBe('bar');
    expect(JSONResults3.toTable().rows[2][1]).toBe(30);
    expect(JSONResults3.toTable().columns.length).toBe(2);
  });
});

const JSONResults4 = new JSONParser(
  {
    id: 'hello',
    users: [
      {
        name: 'foo',
        age: 20,
        year: 2010,
        date: 1262304000000,
      },
      {
        name: 'bar',
        age: 25,
        year: '2011',
        date: 1293840000000,
      },
      {
        name: 'baz',
        age: 30,
        year: '2012/01',
        date: '1325376000000',
      },
      {
        name: 'apple',
        age: 32,
        year: '2013/12/25',
        date: 1387929600000,
      },
    ],
  },
  {
    refId: '',
    type: InfinityQueryType.JSON,
    source: InfinityQuerySources.Inline,
    data: '',
    format: InfinityQueryFormat.Table,
    url: '',
    url_options: {
      method: 'GET',
    },
    root_selector: 'users',
    columns: [
      {
        text: 'Name',
        type: ScrapColumnFormat.String,
        selector: 'name',
      },
      {
        text: 'Age',
        type: ScrapColumnFormat.Number,
        selector: 'age',
      },
      {
        text: 'Year',
        type: ScrapColumnFormat.Timestamp,
        selector: 'year',
      },
      {
        text: 'Date',
        type: ScrapColumnFormat.Timestamp_Epoch,
        selector: 'date',
      },
    ],
  }
);
describe('JSONParser', () => {
  it('With Columns & Root Selector', () => {
    expect(JSONResults4.toTable().rows.length).toBe(4);
    expect(JSONResults4.toTable().rows[0].length).toBe(4);
    expect(JSONResults4.toTable().rows[1][0]).toBe('bar');
    expect(JSONResults4.toTable().rows[2][1]).toBe(30);
    expect(JSONResults4.toTable().rows[0][2]).toStrictEqual(new Date('2010-01-01T00:00:00.000Z'));
    // expect(JSONResults4.toTable().rows[1][2]).toStrictEqual(new Date('2011-01-01T00:00:00.000Z'));
    // expect(JSONResults4.toTable().rows[2][2]).toStrictEqual(new Date('2012-01-01T00:00:00.000Z'));
    // expect(JSONResults4.toTable().rows[3][2]).toStrictEqual(new Date('2013-12-25T00:00:00.000Z'));
    // expect(JSONResults4.toTable().rows[0][3]).toStrictEqual(new Date('2010-01-01T00:00:00.000Z'));
    // expect(JSONResults4.toTable().rows[1][3]).toStrictEqual(new Date('2011-01-01T00:00:00.000Z'));
    // expect(JSONResults4.toTable().rows[2][3]).toStrictEqual(new Date('2012-01-01T00:00:00.000Z'));
    // expect(JSONResults4.toTable().rows[3][3]).toStrictEqual(new Date('2013-12-25T00:00:00.000Z'));
    expect(JSONResults4.toTable().columns.length).toBe(4);
  });
});

const JSONResults5 = new JSONParser(
  {
    id: 'hello',
    users: [
      {
        name: 'foo',
        age: 20,
      },
      {
        name: 'bar',
        age: 25,
      },
      {
        name: 'baz',
        age: 30,
      },
    ],
  },
  {
    refId: '',
    type: InfinityQueryType.JSON,
    source: InfinityQuerySources.Inline,
    data: '',
    format: InfinityQueryFormat.Table,
    url: '',
    url_options: {
      method: 'GET',
    },
    root_selector: 'users',
    columns: [],
  }
);
describe('JSONParser', () => {
  it('Auto Columns Table', () => {
    expect(JSONResults5.toTable().rows.length).toBe(3);
    expect(JSONResults5.toTable().rows[0].length).toBe(2);
    expect(JSONResults5.toTable().rows[1][0]).toBe('bar');
    expect(JSONResults5.toTable().rows[2][1]).toBe(30);
    expect(JSONResults5.toTable().columns.length).toBe(2);
  });
});
