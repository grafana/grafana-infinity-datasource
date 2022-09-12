import { defaultsDeep } from 'lodash';
import React from 'react';
import { EditorRows, EditorRow } from './../../components/extended/EditorRow';
import { DefaultInfinityQuery } from './../../constants';
import { migrateQuery } from './../../migrate';
import { QueryColumnsEditor } from './query.columns.editor';
import { TableFilter } from './query.filters';
import { GROQEditor } from './query.groq';
import { SeriesEditor } from './query.series';
import { TypeChooser } from './query.type';
import { UQLEditor } from './query.uql';
import { URLEditor } from './query.url';
import { Summarize } from './query.summarize';
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
  let canShowURLEditor = ['csv', 'tsv', 'html', 'json', 'graphql', 'xml', 'uql', 'groq'].includes(query.type);
  let canShowColumnsEditor = ['csv', 'tsv', 'html', 'json', 'graphql', 'xml'].includes(query.type);
  let canShowFilterEditor =
    query.type !== 'series' &&
    query.type !== 'global' &&
    !(query.type === 'json' && query.parser === 'backend') &&
    !(query.type === 'json' && query.parser === 'uql') &&
    !(query.type === 'json' && query.parser === 'groq') &&
    !(query.type === 'csv' && query.parser === 'uql') &&
    !(query.type === 'tsv' && query.parser === 'uql') &&
    !(query.type === 'graphql' && query.parser === 'uql') &&
    !(query.type === 'xml' && query.parser === 'uql') &&
    query.type !== 'uql' &&
    query.type !== 'groq' &&
    query.columns &&
    query.columns.length > 0;
  return (
    <div className="infinity-query-editor" data-testid="infinity-query-editor">
      <EditorRows>
        <TypeChooser {...{ instanceSettings, mode, query, onChange, onRunQuery }} />
        {query.type === 'series' && <SeriesEditor {...{ query, onChange }} />}
        {canShowURLEditor && <URLEditor {...{ mode, query, onChange, onRunQuery }} />}
        {canShowColumnsEditor && <QueryColumnsEditor {...{ mode, query, onChange, onRunQuery }} />}
        {canShowFilterEditor && <TableFilter {...{ query, onChange, onRunQuery }} />}
        {query.type === 'uql' && (
          <EditorRow>
            <UQLEditor {...{ query, onChange, onRunQuery, mode }} />
          </EditorRow>
        )}
        {query.type === 'groq' && (
          <EditorRow>
            <GROQEditor {...{ query, onChange, onRunQuery, mode }} />
          </EditorRow>
        )}
        {query.type === 'json' && query.parser === 'backend' && <Summarize {...{ query, onChange, onRunQuery }} />}
      </EditorRows>
    </div>
  );
};
