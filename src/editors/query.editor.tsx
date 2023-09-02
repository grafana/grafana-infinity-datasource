import { defaultsDeep } from 'lodash';
import React from 'react';
import { getDefaultGlobalQueryID } from './../app/queryUtils';
import { DefaultInfinityQuery } from './../constants';
import { Datasource } from './../datasource';
import { InfinityQueryEditor } from './query/infinityQuery';
import type { InfinityQuery } from './../types';
import type { QueryEditorProps } from '@grafana/data';

export const QueryEditor = (props: QueryEditorProps<Datasource, InfinityQuery>) => {
  const { datasource, onChange, onRunQuery } = props;
  const query = defaultsDeep(props.query, {
    ...DefaultInfinityQuery,
    global_query_id: getDefaultGlobalQueryID(datasource.instanceSettings),
  });
  return <InfinityQueryEditor onChange={onChange} onRunQuery={onRunQuery} query={query} mode={'standard'} instanceSettings={datasource.instanceSettings} datasource={datasource} />;
};
