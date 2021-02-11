import React from 'react';
import { defaultsDeep, set } from 'lodash';
import {
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

const DEFAULT_DATASOURCE_MODE = DATASOURCE_MODES.find(d => d.value === DatasourceMode.Basic);

export interface InfinityDataSourceJSONOptions extends DataSourceJsonData {
  datasource_mode?: DatasourceMode;
  global_queries?: GlobalInfinityQuery[];
}

export type Props = DataSourcePluginOptionsEditorProps<InfinityDataSourceJSONOptions>;

const DefaultGlobalQuery: InfinityQuery = {
  refId: '',
  type: 'csv',
  source: 'inline',
  data: '',
  url: '',
  url_options: { method: 'GET' },
  root_selector: '',
  columns: [],
  filters: [],
  format: 'table',
};

export const InfinityConfigEditor: React.FC<Props> = (props: Props) => {
  const { options, onOptionsChange } = props;

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
      <div className="gf-form-inline">
        <div className="gf-form">
          <label className="gf-form-label width-10">Mode</label>
          <Select
            className="min-width-12 width-12"
            value={
              DATASOURCE_MODES.find((field: SelectableValue) => field.value === options.jsonData.datasource_mode) ||
              DEFAULT_DATASOURCE_MODE
            }
            options={DATASOURCE_MODES}
            defaultValue={DEFAULT_DATASOURCE_MODE}
            onChange={e => updateDatasourcePluginJsonDataOption(props, 'datasource_mode', e.value)}
          ></Select>
        </div>
      </div>
      <br />
      <br />
      {options.jsonData.datasource_mode === DatasourceMode.Advanced ? (
        <div className="gf-form-inline">
          <div className="gf-form">
            <DataSourceHttpSettings
              defaultUrl=""
              dataSourceConfig={options}
              onChange={onOptionsChange}
            ></DataSourceHttpSettings>
          </div>
        </div>
      ) : (
        <></>
      )}
      {options.jsonData.global_queries && options.jsonData.global_queries.length === 0 ? (
        <>
          <button className="btn btn-primary" onClick={addGlobalQuery}>
            Add Global Query
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
                      Delete Query
                    </span>
                  </div>
                  <div className="gf-form">
                    <InfinityQueryEditor
                      query={q.query}
                      mode="global"
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
            Add Global Query
          </button>
          <br />
          <br />
        </>
      )}
    </>
  );
};
