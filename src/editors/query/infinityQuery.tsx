import React from 'react';
import { defaultsDeep } from 'lodash';
import { TypeChooser } from './query.type';
import { URLEditor } from './query.url';
import { QueryColumnsEditor } from './query.columns.editor';
import { SeriesEditor } from './query.series';
import { TableFilter } from './query.filters';
import { UQLEditor } from './query.uql';
import { InfinityQuery, EditorMode, DefaultInfinityQuery } from '../../types';

export type InfinityEditorProps = {
  query: InfinityQuery;
  onChange: (query: InfinityQuery) => void;
  onRunQuery: () => void;
  instanceSettings: any;
  mode: EditorMode;
};

export const InfinityQueryEditor = (props: InfinityEditorProps) => {
  const { onChange, mode, instanceSettings, onRunQuery } = props;
  const query: InfinityQuery = defaultsDeep(props.query, DefaultInfinityQuery) as InfinityQuery;
  let canShowURLEditor = ['csv', 'tsv', 'html', 'json', 'graphql', 'xml', 'uql'].includes(query.type);
  let canShowColumnsEditor = ['csv', 'tsv', 'html', 'json', 'graphql', 'xml'].includes(query.type);
  let canShowFilterEditor = query.type !== 'series' && query.type !== 'global' && query.type !== 'uql' && query.columns && query.columns.length > 0;
  return (
    <div className="infinity-query-editor">
      <TypeChooser {...{ instanceSettings, mode, query, onChange, onRunQuery }} />
      {query.type === 'series' && <SeriesEditor {...{ query, onChange }} />}
      {canShowURLEditor && <URLEditor {...{ mode, query, onChange, onRunQuery }} />}
      {canShowColumnsEditor && <QueryColumnsEditor {...{ mode, query, onChange, onRunQuery }} />}
      {canShowFilterEditor && <TableFilter {...{ query, onChange, onRunQuery }} />}
      {query.type === 'uql' && <UQLEditor {...{ query, onChange, onRunQuery, mode }} />}
    </div>
  );
};
