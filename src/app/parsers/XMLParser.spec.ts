import { XMLParser } from './XMLParser';

const XMLResults1 = new XMLParser('', {
  refId: '',
  type: 'xml',
  source: 'inline',
  data: '',
  format: 'table',
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
    type: 'xml',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: 'users.user',
    columns: [
      {
        selector: 'name',
        text: 'Name',
        type: 'string',
      },
      {
        selector: '$.age',
        text: 'Name',
        type: 'string',
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
    type: 'xml',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: 'users.user',
    columns: [
      {
        selector: '_',
        text: 'Name',
        type: 'string',
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

const XMLResults4 = new XMLParser(
  `<xml><meters>
		<meter><e1>2553517.5573549946</e1><e2>hello</e2><e3>2021-Nov-12</e3></meter>
		<meter><e1>2552517.5573549846</e1><e2>world</e2><e3>2021-Nov-11</e3></meter>
	</meters></xml>`,
  {
    refId: '',
    type: 'xml',
    source: 'inline',
    data: '',
    format: 'table',
    root_selector: 'xml.meters[0].meter',
    columns: [
      {
        selector: 'e1',
        text: 'value',
        type: 'number',
      },
      {
        selector: 'e2',
        text: 'foo',
        type: 'string',
      },
      {
        selector: 'e3',
        text: 'date',
        type: 'timestamp',
      },
    ],
  }
);
describe('XMLParser', () => {
  it('Basic XML', () => {
    expect(XMLResults4.toTable().rows.length).toBe(2);
    expect(XMLResults4.toTable().rows[0].length).toBe(3);
    expect(XMLResults4.toTable().rows[1][0]).toStrictEqual(2552517.5573549846);
    expect(XMLResults4.toTable().rows[1][1]).toStrictEqual('world');
    expect(XMLResults4.toTable().rows[1][2]).toStrictEqual(new Date('2021-Nov-11'));
    expect(XMLResults4.toTable().columns.length).toBe(3);
  });
});
