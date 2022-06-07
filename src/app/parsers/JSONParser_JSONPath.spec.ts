import { JSONParser } from './JSONParser';

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
    type: 'json',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: '$.*',
    columns: [
      {
        text: 'Name',
        type: 'string',
        selector: 'name',
      },
    ],
  }
);
describe('JSON - JSONPath', () => {
  it('With Columns', () => {
    expect(JSONResults.toTable()).toMatchSnapshot();
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
    type: 'json',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: '$.*',
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
    ],
  }
);
describe('JSON - JSONPath', () => {
  it('With multi Columns', () => {
    expect(JSONResults1.toTable()).toMatchSnapshot();
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
    type: 'json',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: '$.customers',
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
    ],
  }
);
describe('JSON - JSONPath', () => {
  it('With multi Columns', () => {
    expect(JSONResults2.toTable()).toMatchSnapshot();
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
    type: 'json',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: '$customers',
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
        text: 'Gender',
        type: 'string',
        selector: 'gender',
      },
    ],
  }
);
describe('JSON - JSONPath', () => {
  it('With multi Columns', () => {
    expect(JSONResults3.toTable()).toMatchSnapshot();
  });
});
