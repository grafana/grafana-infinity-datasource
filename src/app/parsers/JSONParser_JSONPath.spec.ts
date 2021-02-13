import { JSONParser } from './JSONParser';
import { InfinityQuerySources, InfinityQueryFormat, InfinityQueryType, ScrapColumnFormat } from './../../types';

const JSONResults = new JSONParser(
  {
    customers: [
      {
        name: 'mary',
        age: 22,
        gender: 'female',
      },
      {
        name: 'joseph',
        age: 41,
        gender: 'male',
      },
    ],
    premium_customers: [
      {
        name: 'john doe',
        age: 21,
        gender: 'male',
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
    root_selector: '$.*',
    columns: [
      {
        text: 'Name',
        type: ScrapColumnFormat.String,
        selector: 'name',
      },
    ],
  }
);
describe('JSON - JSONPath', () => {
  it('With Columns', () => {
    expect(JSONResults.toTable().rows.length).toBe(3);
    expect(JSONResults.toTable().rows[0].length).toBe(1);
    expect(JSONResults.toTable().rows[1][0]).toBe('joseph');
    expect(JSONResults.toTable().columns.length).toBe(1);
  });
});

const JSONResults1 = new JSONParser(
  {
    customers: [
      {
        name: 'mary',
        age: 22,
        gender: 'female',
      },
      {
        name: 'joseph',
        age: 41,
        gender: 'male',
      },
    ],
    premium_customers: [
      {
        name: 'john doe',
        age: 21,
        gender: 'male',
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
    root_selector: '$.*',
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
    ],
  }
);
describe('JSON - JSONPath', () => {
  it('With multi Columns', () => {
    expect(JSONResults1.toTable().rows.length).toBe(3);
    expect(JSONResults1.toTable().rows[0].length).toBe(2);
    expect(JSONResults1.toTable().rows[2][0]).toBe('john doe');
    expect(JSONResults1.toTable().columns.length).toBe(2);
  });
});

const JSONResults2 = new JSONParser(
  {
    customers: [
      {
        name: 'mary',
        age: 22,
        gender: 'female',
      },
      {
        name: 'joseph',
        age: 41,
        gender: 'male',
      },
    ],
    premium_customers: [
      {
        name: 'john doe',
        age: 21,
        gender: 'male',
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
    root_selector: '$.customers',
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
    ],
  }
);
describe('JSON - JSONPath', () => {
  it('With multi Columns', () => {
    expect(JSONResults2.toTable().rows.length).toBe(2);
    expect(JSONResults2.toTable().rows[0].length).toBe(2);
    expect(JSONResults2.toTable().rows[0][0]).toBe('mary');
    expect(JSONResults2.toTable().columns.length).toBe(2);
  });
});

const JSONResults3 = new JSONParser(
  {
    $customers: [
      {
        name: 'mary',
        age: 22,
        gender: 'female',
      },
      {
        name: 'joseph',
        age: 41,
        gender: 'male',
      },
    ],
    $premium_customers: [
      {
        name: 'john doe',
        age: 21,
        gender: 'male',
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
    root_selector: '$customers',
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
        text: 'Gender',
        type: ScrapColumnFormat.String,
        selector: 'gender',
      },
    ],
  }
);
describe('JSON - JSONPath', () => {
  it('With multi Columns', () => {
    expect(JSONResults3.toTable().rows.length).toBe(2);
    expect(JSONResults3.toTable().rows[0].length).toBe(3);
    expect(JSONResults3.toTable().rows[0][0]).toBe('mary');
    expect(JSONResults3.toTable().columns.length).toBe(3);
  });
});
