import React, { useState } from 'react';
import { defaultsDeep, set } from 'lodash';
import { DataSourcePluginOptionsEditorProps, updateDatasourcePluginJsonDataOption } from '@grafana/data';
import { Button, LegacyForms, Drawer } from '@grafana/ui';
import { InfinityQueryEditor } from '../query/infinityQuery';
import {
  EditorMode,
  GlobalInfinityQuery,
  InfinityQuery,
  InfinityQueryFormat,
  InfinityQuerySources,
  InfinityQueryType,
  InfinityDataSourceJSONOptions,
} from '../../types';

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

export const GlobalQueryEditor = (props: Props) => {
  const { options } = props;
  const { FormField } = LegacyForms;

  options.jsonData = defaultsDeep(options.jsonData, {
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
    updateDatasourcePluginJsonDataOption(props, 'global_queries', options.jsonData.global_queries);
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
          <Button variant="secondary" icon="plus" type="button" onClick={addGlobalQuery}>
            Add Global Query
          </Button>
        </>
      ) : (
        <>
          {options.jsonData.global_queries &&
            options.jsonData.global_queries.map((q: GlobalInfinityQuery, index: number) => (
              <>
                <div className="gf-form-inline">
                  <div className="gf-form">
                    <FormField
                      label="Query Name"
                      name="name"
                      labelWidth={8}
                      disabled
                      value={q.name || ''}
                      onChange={(e) => {
                        set(options, `jsonData.global_queries[${index}].name`, e.target.value);
                        updateDatasourcePluginJsonDataOption(props, 'global_queries', options.jsonData.global_queries);
                      }}
                    ></FormField>
                    <FormField
                      label="Query ID"
                      name="id"
                      labelWidth={5}
                      disabled
                      value={q.id || ''}
                      onChange={(e) => {
                        set(options, `jsonData.global_queries[${index}].id`, e.target.value);
                        updateDatasourcePluginJsonDataOption(props, 'global_queries', options.jsonData.global_queries);
                      }}
                    ></FormField>
                    <GlobalQuery
                      q={q}
                      updateDatasourcePluginJsonDataOption={updateDatasourcePluginJsonDataOption}
                      deleteGlobalQuery={deleteGlobalQuery}
                      props={props}
                      options={options}
                      index={index}
                    />
                  </div>
                </div>
              </>
            ))}
          <Button variant="secondary" icon="plus" type="button" onClick={addGlobalQuery}>
            Add Global Query
          </Button>
          <br />
          <br />
        </>
      )}
    </>
  );
};

interface GlobalQueryProps {
  q: GlobalInfinityQuery;
  updateDatasourcePluginJsonDataOption: any;
  deleteGlobalQuery: (index: number) => void;
  props: Props;
  options: any;
  index: number;
}

const GlobalQuery = ({
  q,
  updateDatasourcePluginJsonDataOption,
  props,
  options,
  index,
  deleteGlobalQuery,
}: GlobalQueryProps) => {
  const [popupState, setPopupState] = useState(false);
  const { FormField } = LegacyForms;
  return (
    <>
      <span
        className="btn btn-primary"
        style={{ margin: '0px 10px' }}
        onClick={() => {
          setPopupState(true);
        }}
      >
        Edit
      </span>
      {popupState && (
        <Drawer
          onClose={() => setPopupState(false)}
          title={`Global Query (${q.id})`}
          expandable
          width="50%"
          subtitle={
            <>
              <div className="muted">{q.name}</div>
              <div className="muted">{q.id}</div>
            </>
          }
        >
          <FormField
            label="Query Name"
            name="name"
            labelWidth={8}
            value={q.name || ''}
            onChange={(e) => {
              set(options, `jsonData.global_queries[${index}].name`, e.target.value);
              updateDatasourcePluginJsonDataOption(props, 'global_queries', options.jsonData.global_queries);
            }}
          ></FormField>
          <FormField
            label="Query ID"
            name="id"
            labelWidth={8}
            value={q.id || ''}
            onChange={(e) => {
              set(options, `jsonData.global_queries[${index}].id`, e.target.value);
              updateDatasourcePluginJsonDataOption(props, 'global_queries', options.jsonData.global_queries);
            }}
          ></FormField>
          <InfinityQueryEditor
            query={q.query}
            mode={EditorMode.Global}
            onChange={() =>
              updateDatasourcePluginJsonDataOption(props, 'global_queries', options.jsonData.global_queries)
            }
            onRunQuery={() => {}}
            instanceSettings={options}
          />
          <br />
          <span
            className="btn btn-primary"
            onClick={() => setPopupState(false)}
            style={{
              margin: '0px 10px',
            }}
          >
            OK
          </span>
          <span
            className="btn btn-danger"
            onClick={() => {
              deleteGlobalQuery(index);
              setPopupState(false);
            }}
          >
            Delete
          </span>
        </Drawer>
      )}
    </>
  );
};
