import React, { useState } from 'react';
import { TextArea, Select } from '@grafana/ui';
import { Datasource } from '../datasource';
import { InfinityQueryEditor } from './query/infinityQuery';
import { migrateLegacyQuery } from './../app/variablesQuery';
import { VariableQuery, VariableQueryType, VariableQueryTypes, InfinityQuery } from '../types';

export const VariableEditor = (props: { query: VariableQuery; onChange: (query: VariableQuery, definition: string) => void; datasource: Datasource }) => {
  const [state, setState] = useState<VariableQuery>(migrateLegacyQuery(props.query));
  const saveQuery = () => {
    props.onChange(state, `${props.datasource.name}- (${state.queryType}) ${state.query}`);
  };
  const onInfinityQueryUpdate = (infinityQuery: InfinityQuery) => {
    setState({ queryType: state.queryType, query: state.query, infinityQuery });
    saveQuery();
  };
  const onQueryTypeChange = (queryType: VariableQueryType) => {
    setState({ query: state.query, infinityQuery: state.infinityQuery, queryType });
    saveQuery();
  };
  const onQueryChange = (query: string) => {
    setState({ queryType: state.queryType, infinityQuery: state.infinityQuery, query });
    saveQuery();
  };
  return (
    <>
      <div className="gf-form">
        <label className="gf-form-label query-keyword width-10">Query Type</label>
        <Select
          options={VariableQueryTypes}
          value={VariableQueryTypes.find((v) => v.value === state.queryType)}
          defaultValue={VariableQueryTypes[0]}
          onChange={(e) => onQueryTypeChange(e.value as VariableQueryType)}
        ></Select>
      </div>
      {state.queryType === 'infinity' && state.infinityQuery && (
        <InfinityQueryEditor
          query={{ ...state.infinityQuery }}
          mode={'variable'}
          onChange={onInfinityQueryUpdate}
          onRunQuery={() => {}}
          instanceSettings={props.datasource.instanceSettings}
        ></InfinityQueryEditor>
      )}
      {state.queryType === 'legacy' && (
        <div className="gf-form">
          <span className="gf-form-label width-10">Query</span>
          <TextArea
            css={{}}
            rows={1}
            className="gf-form-input"
            placeholder="Collection(India,in,United Kingdom,uk)"
            value={state.query}
            onBlur={(e) => onQueryChange(e.currentTarget.value)}
            onChange={(e) => onQueryChange(e.currentTarget.value)}
          ></TextArea>
        </div>
      )}
    </>
  );
};
