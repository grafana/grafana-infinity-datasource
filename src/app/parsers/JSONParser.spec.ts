import { JSONParser } from '@/app/parsers/JSONParser';

const JSONResults1 = new JSONParser(
  {},
  {
    refId: '',
    type: 'json',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: '',
    columns: [],
  }
);
describe('JSONParser', () => {
  it('Basic', () => {
    expect(JSONResults1.toTable()).toMatchSnapshot();
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
    type: 'json',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: '',
    columns: [
      {
        text: 'Name',
        type: 'string',
        selector: 'name',
      },
    ],
  }
);
describe('JSONParser', () => {
  it('With Columns', () => {
    expect(JSONResults2.toTable()).toMatchSnapshot();
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
    type: 'json',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: 'users',
    columns: [
      {
        text: 'Name',
        type: 'string',
        selector: 'name',
      },
      {
        text: 'Age',
        type: 'string',
        selector: 'age',
      },
    ],
  }
);
describe('JSONParser', () => {
  it('With Columns & Root Selector', () => {
    expect(JSONResults3.toTable()).toMatchSnapshot();
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
    type: 'json',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: 'users',
    columns: [
      {
        text: 'Name',
        type: 'string',
        selector: 'name',
      },
      {
        text: 'Age',
        type: 'number',
        selector: 'age',
      },
      {
        text: 'Year',
        type: 'timestamp',
        selector: 'year',
      },
      {
        text: 'Date',
        type: 'timestamp_epoch',
        selector: 'date',
      },
    ],
  }
);
describe('JSONParser', () => {
  it('With Columns & Root Selector', () => {
    expect(JSONResults4.toTable()).toMatchSnapshot();
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
    type: 'json',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: 'users',
    columns: [],
  }
);
describe('JSONParser', () => {
  it('Auto Columns Table', () => {
    expect(JSONResults5.toTable()).toMatchSnapshot();
  });
});
