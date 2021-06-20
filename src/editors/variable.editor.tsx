import React, { useState } from 'react';
import { TextArea, Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { Datasource } from '../datasource';
import { InfinityQueryEditor } from './query/infinityQuery';
import { migrateLegacyQuery } from './../app/variablesQuery';
import { VariableQuery, VariableQueryType, InfinityQuery, EditorMode } from '../types';

interface Props {
  query: VariableQuery;
  onChange: (query: VariableQuery, definition: string) => void;
  datasource: Datasource;
}

const VariableQueryTypes: Array<SelectableValue<VariableQueryType>> = [
  {
    label: 'Infinity',
    value: VariableQueryType.Infinity,
  },
  {
    label: 'Legacy',
    value: VariableQueryType.Legacy,
  },
];

export const VariableEditor: React.FC<Props> = (props) => {
  const [state, setState] = useState<VariableQuery>(migrateLegacyQuery(props.query));
  const saveQuery = () => {
    props.onChange(state, `${props.datasource.name}- (${state.queryType}) ${state.query}`);
  };
  const onInfinityQueryUpdate = (infinityQuery: InfinityQuery) => {
    setState({ ...state, infinityQuery });
    saveQuery();
  };
  const onQueryTypeChange = (queryType: VariableQueryType) => {
    setState({ ...state, queryType });
    saveQuery();
  };
  const onQueryChange = (query: string) => {
    setState({ ...state, query });
    saveQuery();
  };
  return (
    <>
      <div className="gf-form">
        <span className="gf-form-label width-10">Query Type</span>
        <Select
          options={VariableQueryTypes}
          value={VariableQueryTypes.find((v) => v.value === state.queryType)}
          defaultValue={VariableQueryTypes[0]}
          onChange={(e) => {
            onQueryTypeChange(e.value as VariableQueryType);
          }}
        ></Select>
      </div>
      {state.queryType === 'infinity' && state.infinityQuery && (
        <InfinityQueryEditor
          query={{ ...state.infinityQuery }}
          mode={EditorMode.Variable}
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
            required={true}
            value={state.query}
            onBlur={(e) => onQueryChange(e.currentTarget.value)}
            onChange={(e) => onQueryChange(e.currentTarget.value)}
          ></TextArea>
        </div>
      )}
    </>
  );
};
