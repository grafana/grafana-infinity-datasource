import React from 'react';
import { defaultsDeep } from 'lodash';
import { QueryEditorProps } from '@grafana/data';
import { Datasource } from '../datasource';
import { InfinityQueryEditor } from './query/infinityQuery';
import { InfinityQuery, EditorMode } from '../types';

type EditorProps = QueryEditorProps<Datasource, InfinityQuery>;

export const QueryEditor: React.FC<EditorProps> = props => {
  let { query, onChange } = props;
  let default_global_query_id =
    props.datasource.instanceSettings.jsonData.global_queries &&
    props.datasource.instanceSettings.jsonData.global_queries.length > 0
      ? props.datasource.instanceSettings.jsonData.global_queries[0].id
      : '';
  query = defaultsDeep(query, {
    query_mode: 'standard',
    global_query_id: default_global_query_id,
  });
  return (
    <>
      <InfinityQueryEditor
        onChange={onChange}
        onRunQuery={props.onRunQuery}
        query={query}
        mode={EditorMode.Standard}
        instanceSettings={props.datasource.instanceSettings}
      />
    </>
  );
};
