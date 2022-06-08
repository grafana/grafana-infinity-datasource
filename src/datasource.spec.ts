import { vi } from 'vitest';
import { DataSourceInstanceSettings, PluginType } from '@grafana/data';
import { Datasource } from './datasource';

vi.mock('@grafana/runtime', () => {
  return {
    ...require('@grafana/runtime'),
    getTemplateSrv: () => {
      return {
        replace: (s: string) => s,
      };
    },
  };
});

const DummyDatasource: DataSourceInstanceSettings = {
  id: 1,
  uid: '',
  name: '',
  access: 'proxy',
  type: 'yesoreyeram-infinity-datasource',
  meta: {
    id: '',
    name: '',
    module: '',
    type: PluginType.datasource,
    baseUrl: '',
    info: {
      description: '',
      screenshots: [],
      updated: '',
      version: '',
      links: [],
      logos: {
        small: '',
        large: '',
      },
      author: {
        name: '',
      },
    },
  },
  jsonData: {},
};

const ds = new Datasource(DummyDatasource);

describe('metricFindQuery - Random Variable', () => {
  it('Random', async () => {
    const result = await ds.metricFindQuery({ query: 'Random(A,B,C,D)', queryType: 'legacy' });
    expect(['A', 'B', 'C', 'D']).toContain(result[0].text);
  });
});

describe('metricFindQuery - Join', () => {
  it('Join', async () => {
    expect(await ds.metricFindQuery({ query: 'Join(A,B,C,D)', queryType: 'legacy' })).toStrictEqual([{ text: 'ABCD', value: 'ABCD' }]);
  });
});

describe('metricFindQuery - Collection', () => {
  it('Collection', async () => {
    expect(await ds.metricFindQuery({ query: 'Collection(A,B,C,D)', queryType: 'legacy' })).toMatchSnapshot();
  });
});

describe('metricFindQuery - CollectionLookup', () => {
  it('CollectionLookup', async () => {
    expect(await ds.metricFindQuery({ query: 'CollectionLookup(pd,prod-server,np,nonprod-server,dev,dev-server,np)', queryType: 'legacy' })).toMatchSnapshot();
    expect(await ds.metricFindQuery({ query: 'CollectionLookup(A,a,B,b,C,c,D,d,C)', queryType: 'legacy' })).toMatchSnapshot();
    expect(await ds.metricFindQuery({ query: 'CollectionLookup(A,a,B,b,C,c,D,d,E)', queryType: 'legacy' })).toMatchSnapshot();
  });
});
