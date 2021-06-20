import React from 'react';
import { defaultsDeep } from 'lodash';
import { QueryEditorProps } from '@grafana/data';
import { Datasource } from '../datasource';
import { InfinityQueryEditor } from './query/infinityQuery';
import { getDefaultGlobalQueryID } from '../app/queryUtils';
import { InfinityQuery, EditorMode, DefaultInfinityQuery } from '../types';

type EditorProps = QueryEditorProps<Datasource, InfinityQuery>;

export const QueryEditor: React.FC<EditorProps> = ({ datasource, query, onChange, onRunQuery }) => {
  query = defaultsDeep(query, {
    ...DefaultInfinityQuery,
    global_query_id: getDefaultGlobalQueryID(datasource.instanceSettings),
  });
  return (
    <InfinityQueryEditor
      onChange={onChange}
      onRunQuery={onRunQuery}
      query={query}
      mode={EditorMode.Standard}
      instanceSettings={datasource.instanceSettings}
    />
  );
};
