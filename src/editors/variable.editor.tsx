import { TagsInput, TextArea, RadioButtonGroup, Field } from '@grafana/ui';
import React from 'react';
import { migrateLegacyQuery } from '@/app/variablesQuery';
import { variableQueryTypes } from '@/constants';
import { Datasource } from '@/datasource';
import { InfinityQueryEditor } from '@/editors/query/infinityQuery';
import type { InfinityQuery, VariableQuery, VariableQueryInfinity, VariableQueryLegacy, VariableQueryRandom, VariableQueryType } from '@/types';

export const VariableEditor = (props: { query: VariableQuery; onChange: (query: VariableQuery, definition: string) => void; datasource: Datasource }) => {
  const query = migrateLegacyQuery(props.query);
  const onQueryTypeChange = (queryType: VariableQueryType) => {
    const newQuery: VariableQuery = { ...query, queryType } as VariableQuery;
    props.onChange(newQuery, `${props.datasource.name}- (${newQuery.queryType}) ${newQuery.queryType === 'legacy' ? newQuery.query : ''}`);
  };
  return (
    <>
      <Field label="QueryType">
        <RadioButtonGroup<VariableQueryType> options={variableQueryTypes} value={query.queryType} onChange={(v) => onQueryTypeChange(v)}></RadioButtonGroup>
      </Field>
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
    <Field label="Query">
      <TextArea
        rows={5}
        placeholder="Collection(India,in,United Kingdom,uk)"
        value={query.query}
        onBlur={(e) => onQueryChange(e.currentTarget.value)}
        onChange={(e) => onQueryChange(e.currentTarget.value)}
      ></TextArea>
    </Field>
  );
};

const VariableEditorInfinity = (props: { query: VariableQueryInfinity; onChange: (query: VariableQueryInfinity, definition: string) => void; datasource: Datasource }) => {
  const { query, onChange, datasource } = props;
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
      instanceSettings={datasource.instanceSettings}
      datasource={datasource}
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
    <Field label="Values">
      <TagsInput tags={query.values || []} onChange={onQueryChange} placeholder="Enter values (enter key to add)" />
    </Field>
  );
};
