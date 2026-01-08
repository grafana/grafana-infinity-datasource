import { firstValueFrom } from 'rxjs';
import { PluginType, DataSourceInstanceSettings, DataQueryRequest, DataFrame } from '@grafana/data';
import { Datasource } from '@/datasource';
import { InfinityVariableSupport } from '@/app/variablesQuery';

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
  const support = new InfinityVariableSupport(ds as any);
  const runLegacyQuery = async (query: string) => {
    const request = { targets: [{ queryType: 'legacy', query, refId: 'variables' }], scopedVars: {} } as DataQueryRequest<any>;
    return await firstValueFrom(support.query(request));
  };
  describe('Random Variable', () => {
    it('Random', async () => {
      const result = await runLegacyQuery('Random(A,B,C,D)');
      expect(result.data).toHaveLength(1);
      const frame: DataFrame = result.data[0];
      expect(frame.refId).toBe('variables');
      expect(frame.fields[0].name).toBe('value');
      expect(frame.fields[1].name).toBe('text');
      expect(['A', 'B', 'C', 'D']).toContain(frame.fields.find((f) => f.name === 'value')?.values[0]);
      expect(['A', 'B', 'C', 'D']).toContain(frame.fields.find((f) => f.name === 'text')?.values[0]);
      expect(frame.fields.find((f) => f.name === 'value')?.values[0]).toStrictEqual(frame.fields.find((f) => f.name === 'text')?.values[0]);
    });
  });

  describe('Join', () => {
    it('Join', async () => {
      const result = await runLegacyQuery('Join(A,B,C,D)');
      expect(result.data).toHaveLength(1);
      const frame: DataFrame = result.data[0];
      expect(frame.refId).toBe('variables');
      expect(frame.fields[0].name).toBe('value');
      expect(frame.fields[1].name).toBe('text');
      expect(frame.fields.length).toBe(2);
      expect(frame.fields[0].values[0]).toStrictEqual('ABCD');
      expect(frame.fields[1].values[0]).toStrictEqual('ABCD');
      expect(frame.fields.find((f) => f.name === 'value')?.values[0]).toStrictEqual(frame.fields.find((f) => f.name === 'text')?.values[0]);
    });
  });

  describe('Collection', () => {
    it('Collection', async () => {
      const result = await runLegacyQuery('Collection(A,B,C,D)');
      expect(result.data).toHaveLength(1);
      const frame: DataFrame = result.data[0];
      expect(frame.refId).toBe('variables');
      expect(frame.fields[0].name).toBe('value');
      expect(frame.fields[1].name).toBe('text');
      expect(frame.fields.length).toBe(2);
      expect(frame.fields.find((f) => f.name === 'value')?.values).toStrictEqual(['B', 'D']);
      expect(frame.fields.find((f) => f.name === 'text')?.values).toStrictEqual(['A', 'C']);
    });
  });

  describe('CollectionLookup', () => {
    it('CollectionLookup', async () => {
      const result = await runLegacyQuery('CollectionLookup(pd,prod-server,np,nonprod-server,dev,dev-server,np)');
      expect(result.data).toHaveLength(1);
      const frame: DataFrame = result.data[0];
      expect(frame.refId).toBe('variables');
      expect(frame.fields[0].name).toBe('value');
      expect(frame.fields[1].name).toBe('text');
      expect(frame.fields.length).toBe(2);
      expect(frame.fields.find((f) => f.name === 'value')?.values).toStrictEqual(['nonprod-server']);
      expect(frame.fields.find((f) => f.name === 'text')?.values).toStrictEqual(['nonprod-server']);
    });
  });
});
