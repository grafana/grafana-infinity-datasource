import defaults from 'lodash/defaults';
import React, { useState } from 'react';
import { TextArea, Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { Datasource } from './datasource';
import { InfinityQueryEditor } from './query.editor';
import { VariableQuery, VariableQueryType, InfinityQuery } from './types';

interface Props {
  query: VariableQuery;
  onChange: (query: VariableQuery, defenition: string) => void;
  datasource: Datasource;
}

const VariableQueryTypes: Array<SelectableValue<VariableQueryType>> = [
  {
    label: 'Infinity Query',
    value: 'infinity',
  },
  {
    label: 'Legacy',
    value: 'legacy',
  },
];

const DefaultVariableQuery: InfinityQuery = {
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

export const VariableEditor: React.FC<Props> = props => {
  let { query, onChange } = props;

  if (typeof query === 'string' && query === '') {
    onChange(
      {
        queryType: 'infinity',
        query: '',
        infinityQuery: DefaultVariableQuery,
      },
      JSON.stringify(DefaultVariableQuery)
    );
  }
  if (typeof query !== 'string') {
    query = defaults(query || {}, {
      queryType: 'infinity',
      query: '',
      infinityQuery: DefaultVariableQuery,
    });
  } else {
    if (query) {
      query = {
        queryType: 'legacy',
        query: query,
      };
    } else {
      query = {
        queryType: 'infinity',
        query: '',
        infinityQuery: DefaultVariableQuery,
      };
    }
  }

  const [state, setState] = useState(query);

  const getDefenition = (): string => {
    if (state.queryType === 'infinity' && state.infinityQuery) {
      return `(${state.infinityQuery.type} - ${state.infinityQuery.source})` + JSON.stringify(state.infinityQuery);
    }
    return `(${state.queryType}) ${state.query}`;
  };

  const onInfinityQueryChange = (infinityQuery: InfinityQuery) => {
    setState({
      ...state,
      infinityQuery,
    });
  };

  const onInfinityQueryUpdate = (infinityQuery: InfinityQuery) => {
    onInfinityQueryChange(infinityQuery);
    onChange(state, getDefenition());
  };

  const onQueryTypeChange = (queryType: VariableQueryType) => {
    setState({
      ...state,
      query: state.query || '',
      queryType: queryType || 'infinity',
    });
    onChange(state, getDefenition());
  };

  const onQueryChange = (value: string) => {
    setState({
      ...state,
      query: value,
    });
    onChange(state, getDefenition());
  };

  return (
    <>
      <div className="gf-form">
        <span className="gf-form-label width-10">Query Type</span>
        <Select
          options={VariableQueryTypes}
          value={VariableQueryTypes.find(v => v.value === state.queryType || VariableQueryTypes[0])}
          defaultValue={VariableQueryTypes[0]}
          onChange={e => {
            onQueryTypeChange(e.value as VariableQueryType);
          }}
        ></Select>
      </div>
      {state.queryType === 'infinity' && (
        <>
          <InfinityQueryEditor
            query={state.infinityQuery || DefaultVariableQuery}
            mode="variable"
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
