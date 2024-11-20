import { DataSourcePluginOptionsEditorProps, DataSourceSettings } from '@grafana/data';
import { Button, Drawer, InlineFormLabel, Input, Stack } from '@grafana/ui';
import React, { useState } from 'react';
import { InfinityQueryEditor } from './../query/infinityQuery';
import { Datasource } from './../../datasource';
import type { GlobalInfinityQuery, InfinityOptions, InfinityQuery } from './../../types';

const DefaultGlobalQuery: InfinityQuery = {
  refId: '',
  type: 'csv',
  source: 'inline',
  data: '',
  root_selector: '',
  columns: [],
  filters: [],
  format: 'table',
};

export const GlobalQueryEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const { jsonData } = options;

  const onJsonDataChange = <T extends keyof InfinityOptions, V extends InfinityOptions[T]>(key: T, value: V) => {
    onOptionsChange({ ...options, jsonData: { ...jsonData, [key]: value } });
  };

  const addGlobalQuery = () => {
    let global_queries = [
      ...(jsonData.global_queries || []),
      {
        name: 'My Query',
        id: `my-query-${(jsonData.global_queries || []).length + 1}`,
        query: {
          ...DefaultGlobalQuery,
          refId: `my-query-${(jsonData.global_queries || []).length + 1}`,
        },
      },
    ];
    onJsonDataChange('global_queries', global_queries);
  };

  const deleteGlobalQuery = (index: number) => {
    if (jsonData.global_queries && jsonData.global_queries.length > 0) {
      let global_queries = [...(jsonData.global_queries || [])];
      global_queries.splice(index, 1);
      onJsonDataChange('global_queries', global_queries);
    }
  };

  return (
    <>
      <Stack direction="column">
        {options.jsonData.global_queries &&
          options.jsonData.global_queries.map((q: GlobalInfinityQuery, index: number) => (
            <Stack key={index}>
              <InlineFormLabel width={8}>Query Name</InlineFormLabel>
              <Input value={q.name || ''} disabled />
              <InlineFormLabel width={8}>Query ID</InlineFormLabel>
              <Input value={q.id || ''} disabled />
              <GlobalQuery
                options={options}
                query={q}
                onUpdate={(q: GlobalInfinityQuery) => {
                  onJsonDataChange(
                    'global_queries',
                    (jsonData.global_queries || []).map((query, i) => {
                      return i === index ? q : query;
                    })
                  );
                }}
              />
              <Button
                icon="trash-alt"
                variant="destructive"
                size="sm"
                style={{ margin: '5px' }}
                onClick={(e) => {
                  deleteGlobalQuery(index);
                  e.preventDefault();
                }}
              >
                Delete
              </Button>
            </Stack>
          ))}
      </Stack>
      <Button variant="secondary" icon="plus" type="button" onClick={addGlobalQuery} style={{ marginTop: '10px' }}>
        Add Global Query
      </Button>
    </>
  );
};

const GlobalQuery = (props: { query: GlobalInfinityQuery; onUpdate: (query: GlobalInfinityQuery) => void; options: DataSourceSettings<InfinityOptions, {}> }) => {
  const { query, onUpdate, options } = props;
  const [id, setId] = useState(query.id || '');
  const [name, setName] = useState(query.name || '');
  const [popupState, setPopupState] = useState(false);
  return (
    <>
      <Button
        variant="primary"
        size="sm"
        style={{ margin: '5px' }}
        onClick={(e) => {
          setPopupState(true);
          e.preventDefault();
        }}
        icon="edit"
      >
        Edit
      </Button>
      {popupState && (
        <Drawer
          onClose={() => setPopupState(false)}
          title={`Global Query (${id})`}
          size="lg"
          subtitle={
            <>
              <div className="muted">{name}</div>
              <div className="muted">{id}</div>
            </>
          }
        >
          <Stack direction="column">
            <Stack>
              <InlineFormLabel width={8}>Name</InlineFormLabel>
              <Input value={name} onChange={(e) => setName(e.currentTarget.value)} onBlur={() => onUpdate({ ...query, name })}></Input>
            </Stack>
            <Stack>
              <InlineFormLabel width={8}>ID</InlineFormLabel>
              <Input value={id} onChange={(e) => setId(e.currentTarget.value)} onBlur={() => onUpdate({ ...query, id })}></Input>
            </Stack>
            <InfinityQueryEditor
              query={query.query}
              onChange={(newQuery: InfinityQuery) => onUpdate({ ...query, query: newQuery })}
              onRunQuery={() => {}}
              instanceSettings={options}
              mode="global"
              datasource={{} as Datasource}
            />
            <Button variant="primary" onClick={() => setPopupState(false)}>
              Update
            </Button>
          </Stack>
        </Drawer>
      )}
    </>
  );
};
