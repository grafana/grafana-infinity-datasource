import React from 'react';
import { defaultsDeep, set } from 'lodash';
import { DataSourcePluginOptionsEditorProps, updateDatasourcePluginJsonDataOption } from '@grafana/data';
import { InfinityQueryEditor } from '../query/infinityQuery';
import {
<<<<<<< HEAD:src/editors/config/GlobalQueryEditor.tsx
  EditorMode,
  GlobalInfinityQuery,
  InfinityQuery,
  InfinityQueryFormat,
  InfinityQuerySources,
  InfinityQueryType,
  DatasourceMode,
  InfinityDataSourceJSONOptions,
} from '../../types';
=======
  DataSourcePluginOptionsEditorProps,
  DataSourceJsonData,
  updateDatasourcePluginJsonDataOption,
  SelectableValue,
} from '@grafana/data';
import { DataSourceHttpSettings, Select } from '@grafana/ui';
import { InfinityQueryEditor } from './query.editor';
import { GlobalInfinityQuery, InfinityQuery } from './types';

export enum DatasourceMode {
  Basic = 'basic',
  Advanced = 'advanced',
}

const DATASOURCE_MODES = [
  { value: DatasourceMode.Basic, label: 'Basic' },
  { value: DatasourceMode.Advanced, label: 'Advanced' },
];

const DEFAULT_DATASOURCE_MODE = DATASOURCE_MODES.find(d => d.value === DatasourceMode.Advanced);

export interface InfinityDataSourceJSONOptions extends DataSourceJsonData {
  datasource_mode?: DatasourceMode;
  global_queries?: GlobalInfinityQuery[];
}
>>>>>>> name check:src/config.editor.tsx

export type Props = DataSourcePluginOptionsEditorProps<InfinityDataSourceJSONOptions>;

const DefaultGlobalQuery: InfinityQuery = {
  refId: '',
  type: InfinityQueryType.CSV,
  source: InfinityQuerySources.Inline,
  data: '',
  url: '',
  url_options: { method: 'GET' },
  root_selector: '',
  columns: [],
  filters: [],
  format: InfinityQueryFormat.Table,
};

export const GlobalQueryEditor: React.FC<Props> = (props: Props) => {
  const { options } = props;

  options.jsonData = defaultsDeep(options.jsonData, {
    datasource_mode: DatasourceMode.Basic,
    global_queries: [],
  });

  const addGlobalQuery = () => {
    options.jsonData.global_queries = options.jsonData.global_queries || [];
    options.jsonData.global_queries.push({
      name: 'My Query',
      id: `my-query-${options.jsonData.global_queries.length + 1}`,
      query: {
        ...DefaultGlobalQuery,
        refId: `my-query-${options.jsonData.global_queries.length + 1}`,
      },
    });
  };
  const deleteGlobalQuery = (index: number) => {
    if (options.jsonData.global_queries && options.jsonData.global_queries.length > 0) {
      options.jsonData.global_queries.splice(index, 1);
      updateDatasourcePluginJsonDataOption(props, 'global_queries', options.jsonData.global_queries);
    }
  };
  return (
    <>
      {options.jsonData.global_queries && options.jsonData.global_queries.length === 0 ? (
        <>
          <button className="btn btn-primary" onClick={addGlobalQuery}>
            Adds Globals Query
          </button>
        </>
      ) : (
        <>
          <h3>Registered / Global Queries</h3>
          {options.jsonData.global_queries &&
            options.jsonData.global_queries.map((q: GlobalInfinityQuery, index: number) => (
              <>
                <hr />
                <div className="gf-form-inline">
                  <div className="gf-form">
                    <label className="gf-form-label query-keyword width-8">Query Name</label>
                    <input
                      type="text"
                      value={q.name}
                      className="gf-form-label width-12"
                      onChange={e => {
                        set(options, `jsonData.global_queries[${index}].name`, e.target.value);
                        updateDatasourcePluginJsonDataOption(props, 'global_queries', options.jsonData.global_queries);
                      }}
                    ></input>
                    <label className="gf-form-label query-keyword width-8">Query ID</label>
                    <input
                      type="text"
                      value={q.id}
                      className="gf-form-label width-12"
                      onChange={e => {
                        set(options, `jsonData.global_queries[${index}].id`, e.target.value);
                        updateDatasourcePluginJsonDataOption(props, 'global_queries', options.jsonData.global_queries);
                      }}
                    ></input>
                    <span className="btn btn-danger" onClick={() => deleteGlobalQuery(index)}>
                      Deletes Query
                    </span>
                  </div>
                  <div className="gf-form">
                    <InfinityQueryEditor
                      query={q.query}
                      mode={EditorMode.Global}
                      onChange={() =>
                        updateDatasourcePluginJsonDataOption(props, 'global_queries', options.jsonData.global_queries)
                      }
                      onRunQuery={() => {}}
                      instanceSettings={options}
                    />
                  </div>
                </div>
              </>
            ))}
          <button className="btn btn-primary" onClick={addGlobalQuery}>
            Adds Globals Query
          </button>
          <br />
          <br />
        </>
      )}
    </>
  );
};
