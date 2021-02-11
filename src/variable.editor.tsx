import React, { useState } from 'react';
import { TextArea, Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { Datasource } from './datasource';
import { VariableQuery, VariableQueryType } from './types';

interface Props {
  query: VariableQuery;
  onChange: (query: VariableQuery, defenition: string) => void;
  datasource: Datasource;
}

const VariableQueryTypes: Array<SelectableValue<VariableQueryType>> = [
  {
    label: 'Legacy',
    value: 'legacy',
  },
];

const migrateVariableQuery = (query: VariableQuery | string): VariableQuery => {
  if (typeof query === 'string') {
    return {
      queryType: 'legacy',
      query,
    };
  } else {
    return query;
  }
};

export const VariableEditor: React.FC<Props> = props => {
  let { query, onChange } = props;

  query = migrateVariableQuery(query);

  const [state, setState] = useState(query);

  const onQueryChange = (value: string) => {
    setState({
      ...state,
      query: value,
    });
    onChange(state, `(${state.queryType}) ${state.query}`);
  };

  const onQueryTypeChange = (queryType: VariableQueryType = 'legacy') => {
    setState({
      ...state,
      queryType,
    });
    onChange(state, `(${state.queryType}) ${state.query}`);
  };

  return (
    <>
      <div className="gf-form">
        <span className="gf-form-label width-10">Query Type</span>
        <Select
          options={VariableQueryTypes}
          value={VariableQueryTypes.find(v => v.value === state.queryType)}
          defaultValue={{ label: 'Legacy', value: 'legacy' }}
          onChange={e => {
            onQueryTypeChange(e.value);
          }}
        ></Select>
      </div>
      {(query.queryType === 'legacy' || query.queryType === undefined) && (
        <div className="gf-form">
          <span className="gf-form-label width-10">Query</span>
          <TextArea
            css={{}}
            rows={1}
            className="gf-form-input"
            placeholder="metric name or tags query"
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
