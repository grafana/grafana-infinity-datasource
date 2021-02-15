import React, { useState } from 'react';
import { TextArea, Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { Datasource } from '../datasource';
import { InfinityQueryEditor } from './query/infinityQuery';
import { migrateLegacyQuery, DefaultInfinityQuery } from './../app/variablesQuery';
import { VariableQuery, VariableQueryType, InfinityQuery, EditorMode } from '../types';

interface Props {
  query: VariableQuery;
  onChange: (query: VariableQuery, defenition: string) => void;
  datasource: Datasource;
}

const VariableQueryTypes: Array<SelectableValue<VariableQueryType>> = [
  {
    label: 'Legacy',
    value: VariableQueryType.Legacy,
  },
  {
    label: 'Infinity Query',
    value: VariableQueryType.Infinity,
  },
];

export const VariableEditor: React.FC<Props> = props => {
  let query = migrateLegacyQuery(props.query);

  const [state, setState] = useState(query);

  const getDefenition = (): string => {
    if (state.queryType === VariableQueryType.Infinity && state.infinityQuery) {
      return `(${state.infinityQuery.type} - ${state.infinityQuery.source})` + JSON.stringify(state.infinityQuery);
    }
    return `(${state.queryType}) ${state.query}`;
  };

  const onInfinityQueryUpdate = (infinityQuery: InfinityQuery) => {
    setState({
      ...state,
      infinityQuery,
    });
    props.onChange(state, getDefenition());
  };

  const onQueryTypeChange = (queryType: VariableQueryType) => {
    setState({
      ...state,
      queryType: queryType || VariableQueryType.Legacy,
    });
    props.onChange(state, getDefenition());
  };

  const onQueryChange = (value: string) => {
    setState({
      ...state,
      query: value,
    });
    props.onChange(state, getDefenition());
  };

  return (
    <>
      <div className="gf-form">
        <span className="gf-form-label width-10">Query Type</span>
        <Select
          options={VariableQueryTypes}
          value={VariableQueryTypes.find(v => v.value === state.queryType)}
          defaultValue={VariableQueryTypes[0]}
          onChange={e => {
            onQueryTypeChange(e.value as VariableQueryType);
          }}
        ></Select>
      </div>
      {state.queryType === 'infinity' && (
        <>
          <InfinityQueryEditor
            query={state.infinityQuery || DefaultInfinityQuery}
            mode={EditorMode.Variable}
            onChange={onInfinityQueryUpdate}
            onRunQuery={onInfinityQueryUpdate}
            instanceSettings={{}}
          ></InfinityQueryEditor>
        </>
      )}
      {state.queryType === 'legacy' && (
        <div className="gf-form">
          <span className="gf-form-label width-10">Query</span>
          <TextArea
            css={{}}
            rows={1}
            className="gf-form-input"
            placeholder="Collection(India,in,United Kingom,uk)"
            required={true}
            value={typeof query === 'string' ? query : state.query}
            onBlur={e => onQueryChange(e.target.value)}
            onChange={e => onQueryChange(e.currentTarget.value)}
          ></TextArea>
        </div>
      )}
    </>
  );
};
