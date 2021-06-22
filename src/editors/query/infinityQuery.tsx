import React from 'react';
import { defaultsDeep } from 'lodash';
import { TypeChooser } from './query.type';
import { TableFilter } from './query.filters';
import { URLEditor } from './query.url';
import { SeriesEditor } from './query.series';
import { QueryColumnsEditor } from './query.columns.editor';
import { InfinityQuery, EditorMode, DefaultInfinityQuery } from '../../types';

export interface InfinityEditorProps {
  instanceSettings: any;
  mode: EditorMode;
  onChange: any;
  onRunQuery: () => void;
  query: InfinityQuery;
}

export const InfinityQueryEditor = (props: InfinityEditorProps) => {
  const { onChange, mode, instanceSettings, onRunQuery } = props;
  const query = defaultsDeep(props.query, DefaultInfinityQuery);
  let canShowType = true;
  let canShowSeriesEditor = query.type === 'series';
  let canShowURLEditor = ['csv', 'html', 'json', 'graphql', 'xml'].includes(query.type);
  let canShowFilterEditor = !['global', 'series'].includes(query.type) && query.columns && query.columns.length > 0;
  return (
    <div className="infinity-query-editor">
      {canShowType && <TypeChooser {...{ instanceSettings, mode, query, onChange, onRunQuery }} />}
      {canShowSeriesEditor && <SeriesEditor {...{ query, onChange }} />}
      {canShowURLEditor && <URLEditor {...{ mode, query, onChange, onRunQuery }} />}
      {canShowURLEditor && <QueryColumnsEditor {...{ mode, query, onChange, onRunQuery }} />}
      {canShowFilterEditor && <TableFilter {...{ query, onChange, onRunQuery }} />}
    </div>
  );
};
