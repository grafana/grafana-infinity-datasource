import React from 'react';
import { TextArea, Select, TagsInput } from '@grafana/ui';
import { Datasource } from '../datasource';
import { InfinityQueryEditor } from './query/infinityQuery';
import { migrateLegacyQuery } from './../app/variablesQuery';
import { VariableQuery, VariableQueryType, variableQueryTypes, InfinityQuery, VariableQueryInfinity, VariableQueryLegacy, VariableQueryRandom } from '../types';

export const VariableEditor = (props: { query: VariableQuery; onChange: (query: VariableQuery, definition: string) => void; datasource: Datasource }) => {
  const query = migrateLegacyQuery(props.query);
  const onQueryTypeChange = (queryType: VariableQueryType) => {
    const newQuery: VariableQuery = { ...query, queryType } as VariableQuery;
    props.onChange(newQuery, `${props.datasource.name}- (${newQuery.queryType}) ${newQuery.queryType === 'legacy' ? newQuery.query : ''}`);
  };
  return (
    <>
      <div className="gf-form">
        <label className="gf-form-label query-keyword width-10">Query Type</label>
        <Select
          options={variableQueryTypes}
          value={variableQueryTypes.find((v) => v.value === query.queryType)}
          defaultValue={variableQueryTypes[0]}
          onChange={(e) => onQueryTypeChange(e.value as VariableQueryType)}
        ></Select>
      </div>
      {query.queryType === 'infinity' && query.infinityQuery && <VariableEditorInfinity {...props} query={query} />}
      {query.queryType === 'legacy' && <VariableEditorLegacy {...props} query={query} />}
      {query.queryType === 'random' && <VariableEditorRandom {...props} query={query} />}
    </>
  );
};

const VariableEditorLegacy = (props: { query: VariableQueryLegacy; onChange: (query: VariableQueryLegacy, definition: string) => void; datasource: Datasource }) => {
  const { query, onChange } = props;
  const onQueryChange = (queryString: string) => {
    const newQuery = { ...query, query: queryString };
    onChange(newQuery, `${props.datasource.name}- (${newQuery.queryType}) ${newQuery.query}`);
  };
  return (
    <div className="gf-form">
      <span className="gf-form-label width-10">Query</span>
      <TextArea
        css={{}}
        rows={1}
        className="gf-form-input"
        placeholder="Collection(India,in,United Kingdom,uk)"
        value={query.query}
        onBlur={(e) => onQueryChange(e.currentTarget.value)}
        onChange={(e) => onQueryChange(e.currentTarget.value)}
      ></TextArea>
    </div>
  );
};

const VariableEditorInfinity = (props: { query: VariableQueryInfinity; onChange: (query: VariableQueryInfinity, definition: string) => void; datasource: Datasource }) => {
  const { query, onChange } = props;
  const onInfinityQueryUpdate = (infinityQuery: InfinityQuery) => {
    const newQuery: VariableQueryInfinity = { ...query, infinityQuery } as VariableQueryInfinity;
    onChange(newQuery, `${props.datasource.name}- (${newQuery.queryType}) ${newQuery.infinityQuery?.type || newQuery.query}`);
  };
  return (
    <InfinityQueryEditor
      query={{ ...query.infinityQuery }}
      mode={'variable'}
      onChange={onInfinityQueryUpdate}
      onRunQuery={() => {}}
      instanceSettings={props.datasource.instanceSettings}
    ></InfinityQueryEditor>
  );
};

const VariableEditorRandom = (props: { query: VariableQueryRandom; onChange: (query: VariableQueryRandom, definition: string) => void; datasource: Datasource }) => {
  const { query, onChange } = props;
  const onQueryChange = (values: string[]) => {
    const newQuery = { ...query, values };
    onChange(newQuery, `${props.datasource.name}- (${newQuery.queryType}) ${(newQuery.values || []).join(',')}`);
  };
  return (
    <div className="gf-form">
      <label className="gf-form-label query-keyword width-10">Values</label>
      <TagsInput tags={query.values || []} onChange={onQueryChange}></TagsInput>
    </div>
  );
};
