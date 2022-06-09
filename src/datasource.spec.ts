import { DataSourceWithBackend } from '@grafana/runtime';
import { DataSourceInstanceSettings, PluginType } from '@grafana/data';
import { Datasource } from './datasource';

jest.mock('@grafana/runtime', () => ({
  ...(jest.requireActual('@grafana/runtime') as unknown as object),
  getTemplateSrv: () => {
    return {
      replace: (s: string) => s,
    };
  },
}));

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

describe('metricFindQuery', () => {
  const ds = new Datasource(DummyDatasource);
  describe('Random Variable', () => {
    it('Random', async () => {
      const result = await ds.metricFindQuery({ query: 'Random(A,B,C,D)', queryType: 'legacy' });
      expect(['A', 'B', 'C', 'D']).toContain(result[0].text);
    });
  });

  describe('Join', () => {
    it('Join', async () => {
      expect(await ds.metricFindQuery({ query: 'Join(A,B,C,D)', queryType: 'legacy' })).toStrictEqual([{ text: 'ABCD', value: 'ABCD' }]);
    });
  });

  describe('Collection', () => {
    it('Collection', async () => {
      expect(await ds.metricFindQuery({ query: 'Collection(A,B,C,D)', queryType: 'legacy' })).toMatchSnapshot();
    });
  });

  describe('CollectionLookup', () => {
    it('CollectionLookup', async () => {
      expect(await ds.metricFindQuery({ query: 'CollectionLookup(pd,prod-server,np,nonprod-server,dev,dev-server,np)', queryType: 'legacy' })).toMatchSnapshot();
      expect(await ds.metricFindQuery({ query: 'CollectionLookup(A,a,B,b,C,c,D,d,C)', queryType: 'legacy' })).toMatchSnapshot();
      expect(await ds.metricFindQuery({ query: 'CollectionLookup(A,a,B,b,C,c,D,d,E)', queryType: 'legacy' })).toMatchSnapshot();
    });
  });
});

describe('testDatasource', () => {
  beforeEach(() => jest.spyOn(DataSourceWithBackend.prototype, 'testDatasource').mockResolvedValue({ a: 'b' }));
  it('should throw error when allowed hosts not configured', async () => {
    const ds = new Datasource({ ...DummyDatasource, jsonData: { auth_method: 'basicAuth' } });
    const result = await ds.testDatasource();
    expect(result).toStrictEqual({ status: 'error', message: 'Configure allowed hosts in the authentication section' });
  });
  it('should throw error when allowed hosts does not have any values', async () => {
    const ds = new Datasource({ ...DummyDatasource, jsonData: { auth_method: 'apiKey', allowedHosts: [] } });
    const result = await ds.testDatasource();
    expect(result).toStrictEqual({ status: 'error', message: 'Configure allowed hosts in the authentication section' });
  });
  it('should not throw error when allowed hosts configured', async () => {
    const ds = new Datasource({ ...DummyDatasource, jsonData: { auth_method: 'apiKey', allowedHosts: ['foo'] } });
    const result = await ds.testDatasource();
    expect(result).toStrictEqual({ a: 'b' });
  });
  it('should throw error when allowed hosts configured with oauth passthrough', async () => {
    const ds = new Datasource({ ...DummyDatasource, jsonData: { oauthPassThru: true } });
    const result = await ds.testDatasource();
    expect(result).toStrictEqual({ status: 'error', message: 'Configure allowed hosts in the authentication section' });
  });
});
