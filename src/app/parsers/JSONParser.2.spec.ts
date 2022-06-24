import { JSONParser } from './JSONParser';
import type { InfinityQuery } from './../../types';

const defaultTarget: InfinityQuery = {
  refId: '',
  type: 'json',
  source: 'inline',
  data: '',
  format: 'table',
  root_selector: '',
  columns: [],
};

describe('Empty Object', () => {
  const a = new JSONParser({}, defaultTarget);
  it('default test', () => {
    expect(a.toTable()).toMatchSnapshot();
  });
});
describe('Empty Array', () => {
  const a = new JSONParser([], defaultTarget);
  it('default test', () => {
    expect(a.toTable()).toMatchSnapshot();
  });
});
describe('String Array', () => {
  const a = new JSONParser(['foo', 'bar', 'baz'], defaultTarget);
  it('default test', () => {
    expect(a.toTable()).toMatchSnapshot();
  });
});
describe('Number Array', () => {
  const a = new JSONParser([1, 2, 3], defaultTarget);
  it('default test', () => {
    expect(a.toTable()).toMatchSnapshot();
  });
});
describe('String Array with duplicates', () => {
  const a = new JSONParser(['foo', 'bar', 'foo'], defaultTarget);
  it('default test', () => {
    expect(a.toTable()).toMatchSnapshot();
  });
});
describe('Simple Object', () => {
  const a = new JSONParser({ firstName: 'foo', lastName: 'bar' }, defaultTarget);
  it('default test', () => {
    expect(a.toTable()).toMatchSnapshot();
  });
});
describe('Simple Object with string array', () => {
  const a = new JSONParser({ firstName: 'foo', lastName: 'bar', users: ['one', 'two'] }, defaultTarget);
  it('default test', () => {
    expect(a.toTable()).toMatchSnapshot();
  });
});
describe('Simple Object with number array', () => {
  const a = new JSONParser({ firstName: 'foo', lastName: 'bar', users: [1, 2, 3] }, defaultTarget);
  it('default test', () => {
    expect(a.toTable()).toMatchSnapshot();
  });
});
describe('Simple Object with number array and string array', () => {
  const a = new JSONParser({ firstName: 'foo', lastName: 'bar', users: ['foo', 'bar'], users1: [1, 2, 3] }, defaultTarget);
  it('default test', () => {
    expect(a.toTable()).toMatchSnapshot();
  });
});
describe('Simple Object with number array, string array, object array', () => {
  const a = new JSONParser(
    {
      firstName: 'foo',
      lastName: 'bar',
      users: ['foo', 'bar'],
      users1: [1, 2, 3],
      users2: [
        {
          koo: 'foo1',
          moo: 'bar1',
        },
        {
          koo: 'foo1',
          moo: 'bar1',
        },
        {
          koo: 'foo1',
          moo: 'bar1',
        },
        {
          koo: 'foo1',
          moo: 'bar1',
        },
      ],
    },
    defaultTarget
  );
  it('default test', () => {
    expect(a.toTable()).toMatchSnapshot();
  });
});
describe('Nested object without array', () => {
  const a = new JSONParser(
    {
      firstName: 'foo',
      lastName: 'bar',
      values: {
        foo: 'foo1',
        bar: 'bar1',
        baz: 'baz1',
        gaz: 'gaz1',
      },
    },
    { ...defaultTarget, root_selector: 'values' }
  );
  it('default test', () => {
    expect(a.toTable()).toMatchSnapshot();
  });
});
