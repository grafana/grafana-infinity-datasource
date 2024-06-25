import { PluginType, DataSourceInstanceSettings } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { Datasource } from './datasource';

jest.mock('@grafana/runtime', () => ({
  ...(jest.requireActual('@grafana/runtime') as unknown as object),
  reportInteraction: () => {},
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
  readOnly: true,
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
  beforeEach(() => jest.spyOn(DataSourceWithBackend.prototype, 'testDatasource').mockResolvedValue({ message: 'OK', status: 'success' }));
  it('should pass with the default settings', async () => {
    const ds = new Datasource({ ...DummyDatasource });
    const result = await ds.testDatasource();
    expect(result).toStrictEqual({
      status: 'success',
      message: 'OK. Settings saved',
    });
  });
  it('should warn when no health check configured', async () => {
    const ds = new Datasource({ ...DummyDatasource, jsonData: { auth_method: 'apiKey', allowedHosts: ['foo'] } });
    const result = await ds.testDatasource();
    expect(result).toStrictEqual({
      status: 'warning',
      message: 'Success. Settings saved but no health checks performed. To validate the connection/credentials, you have to provide a sample URL in Health Check section',
    });
  });
  it('should pass when health check and allowed hosts configured', async () => {
    const ds = new Datasource({ ...DummyDatasource, jsonData: { auth_method: 'apiKey', allowedHosts: ['foo'], customHealthCheckEnabled: true, customHealthCheckUrl: 'https://foo.com' } });
    const result = await ds.testDatasource();
    expect(result).toStrictEqual({
      status: 'success',
      message: 'OK. Settings saved',
    });
  });
});
