import { defaultsDeep } from 'lodash';
import React from 'react';
import { EditorRows } from './../../components/extended/EditorRow';
import { DefaultInfinityQuery } from './../../constants';
import { migrateQuery } from './../../migrate';
import { QueryColumnsEditor } from './query.columns.editor';
import { TableFilter } from './query.filters';
import { GROQEditor } from './query.groq';
import { JSONBackendEditor } from './query.json-backend';
import { SeriesEditor } from './query.series';
import { TypeChooser } from './query.type';
import { UQLEditor } from './query.uql';
import { URLEditor } from './query.url';
import type { EditorMode, InfinityQuery } from './../../types';

export type InfinityEditorProps = {
  query: InfinityQuery;
  onChange: (query: InfinityQuery) => void;
  onRunQuery: () => void;
  instanceSettings: any;
  mode: EditorMode;
};

export const InfinityQueryEditor = (props: InfinityEditorProps) => {
  const { onChange, mode, instanceSettings, onRunQuery } = props;
  let query: InfinityQuery = defaultsDeep(props.query, DefaultInfinityQuery) as InfinityQuery;
  query = migrateQuery(query);
  let canShowURLEditor = ['csv', 'tsv', 'html', 'json', 'json-backend', 'graphql', 'xml', 'uql', 'groq'].includes(query.type);
  let canShowColumnsEditor = ['csv', 'tsv', 'html', 'json', 'json-backend', 'graphql', 'xml'].includes(query.type);
  let canShowFilterEditor =
    query.type !== 'series' && query.type !== 'global' && query.type !== 'json-backend' && query.type !== 'uql' && query.type !== 'groq' && query.columns && query.columns.length > 0;
  return (
    <div className="infinity-query-editor" data-testid="infinity-query-editor">
      <EditorRows>
        <TypeChooser {...{ instanceSettings, mode, query, onChange, onRunQuery }} />
        {query.type === 'series' && <SeriesEditor {...{ query, onChange }} />}
        {canShowURLEditor && <URLEditor {...{ mode, query, onChange, onRunQuery }} />}
        {canShowColumnsEditor && <QueryColumnsEditor {...{ mode, query, onChange, onRunQuery }} />}
        {canShowFilterEditor && <TableFilter {...{ query, onChange, onRunQuery }} />}
        {query.type === 'json-backend' && <JSONBackendEditor {...{ query, onChange, onRunQuery, mode }} />}
        {query.type === 'uql' && <UQLEditor {...{ query, onChange, onRunQuery, mode }} />}
        {query.type === 'groq' && <GROQEditor {...{ query, onChange, onRunQuery, mode }} />}
      </EditorRows>
    </div>
  );
};
