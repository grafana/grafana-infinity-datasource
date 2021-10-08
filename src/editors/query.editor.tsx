import React from 'react';
import { defaultsDeep } from 'lodash';
import { QueryEditorProps } from '@grafana/data';
import { Datasource } from '../datasource';
import { InfinityQueryEditor } from './query/infinityQuery';
import { getDefaultGlobalQueryID } from '../app/queryUtils';
import { InfinityQuery, DefaultInfinityQuery } from '../types';
import './../styles/app.scss';

type EditorProps = QueryEditorProps<Datasource, InfinityQuery>;

export const QueryEditor = (props: EditorProps) => {
  const { datasource, onChange, onRunQuery } = props;
  const query = defaultsDeep(props.query, {
    ...DefaultInfinityQuery,
    global_query_id: getDefaultGlobalQueryID(datasource.instanceSettings),
  });
  return <InfinityQueryEditor onChange={onChange} onRunQuery={onRunQuery} query={query} mode={'standard'} instanceSettings={datasource.instanceSettings} />;
};
