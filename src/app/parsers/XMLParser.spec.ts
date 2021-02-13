import { XMLParser } from './XMLParser';
import { InfinityQuerySources, InfinityQueryFormat, InfinityQueryType, ScrapColumnFormat } from './../../types';

const XMLResults1 = new XMLParser('', {
  refId: '',
  type: InfinityQueryType.XML,
  source: InfinityQuerySources.Inline,
  data: '',
  format: InfinityQueryFormat.Table,
  url: '',
  url_options: {
    method: 'GET',
  },
  root_selector: '',
  columns: [],
});
describe('XMLParser', () => {
  it('Basic', () => {
    expect(XMLResults1.toTable().rows.length).toBe(0);
    expect(XMLResults1.toTable().columns.length).toBe(0);
  });
});

const XMLResults2 = new XMLParser(
  `<users>
    <user age="20">
        <name>User A</name>
    </user>
    <user age="21">
        <name>User B</name>
    </user>
    <user age="18">
        <name>User C1</name>
        <name>User C2</name>
    </user>
</users>`,
  {
    refId: '',
    type: InfinityQueryType.XML,
    source: InfinityQuerySources.Inline,
    data: '',
    format: InfinityQueryFormat.Table,
    url: '',
    url_options: {
      method: 'GET',
    },
    root_selector: 'users.user',
    columns: [
      {
        selector: 'name',
        text: 'Name',
        type: ScrapColumnFormat.String,
      },
      {
        selector: '$.age',
        text: 'Name',
        type: ScrapColumnFormat.String,
      },
    ],
  }
);
describe('XMLParser', () => {
  it('Basic XML', () => {
    expect(XMLResults2.toTable().rows.length).toBe(3);
    expect(XMLResults2.toTable().rows[0].length).toBe(2);
    expect(XMLResults2.toTable().rows[1][0]?.toString()).toBe('User B');
    expect(XMLResults2.toTable().rows[2][0]?.toString()).toBe('User C1,User C2');
    expect(XMLResults2.toTable().columns.length).toBe(2);
  });
});

const XMLResults3 = new XMLParser(
  `<users>
    <user>User A</user>
    <user>User B</user>
    <user>User C</user>
  </users>`,
  {
    refId: '',
    type: InfinityQueryType.XML,
    source: InfinityQuerySources.Inline,
    data: '',
    format: InfinityQueryFormat.Table,
    url: '',
    url_options: {
      method: 'GET',
    },
    root_selector: 'users.user',
    columns: [
      {
        selector: '_',
        text: 'Name',
        type: ScrapColumnFormat.String,
      },
    ],
  }
);
describe('XMLParser', () => {
  it('Basic XML', () => {
    expect(XMLResults3.toTable().rows.length).toBe(3);
    expect(XMLResults3.toTable().rows[0].length).toBe(1);
    expect(XMLResults3.toTable().rows[1][0]?.toString()).toBe('User B');
    expect(XMLResults3.toTable().columns.length).toBe(1);
  });
});
