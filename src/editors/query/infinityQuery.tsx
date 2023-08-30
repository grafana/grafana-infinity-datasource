import { defaultsDeep } from 'lodash';
import React, { useState } from 'react';
import { EditorRows, EditorRow } from './../../components/extended/EditorRow';
import { DefaultInfinityQuery } from './../../constants';
import { migrateQuery } from './../../migrate';
import { QueryColumnsEditor } from './query.columns.editor';
import { TableFilter } from './query.filters';
import { GROQEditor } from './query.groq';
import { SeriesEditor } from './query.series';
import { HelpLinks } from './../query.help';
import { BasicOptions } from './query.options';
import { UQLEditor } from './query.uql';
import { URLEditor } from './query.url';
import { ExperimentalFeatures } from './query.experimental';
import { AzureBlobEditor } from './query.azureBlob';
import { isDataQuery } from './../../app/utils';
import type { EditorMode, InfinityQuery } from './../../types';
import { Datasource } from './../../datasource';
import { PaginationEditor } from './query.pagination';
import { TransformationsEditor } from './query.transformations';

export type InfinityEditorProps = {
  query: InfinityQuery;
  onChange: (query: InfinityQuery) => void;
  onRunQuery: () => void;
  instanceSettings: any;
  mode: EditorMode;
  datasource: Datasource;
};

export const InfinityQueryEditor = (props: InfinityEditorProps) => {
  const { onChange, mode, instanceSettings, onRunQuery, datasource } = props;
  const [showUrlOptions, setShowUrlOptions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  let query: InfinityQuery = defaultsDeep(props.query, DefaultInfinityQuery) as InfinityQuery;
  query = migrateQuery(query);
  let canShowColumnsEditor = ['csv', 'tsv', 'html', 'json', 'graphql', 'xml', 'google-sheets'].includes(query.type);
  let canShowFilterEditor =
    query.type !== 'series' &&
    query.type !== 'global' &&
    query.type !== 'google-sheets' &&
    query.type !== 'transformations' &&
    !(query.type === 'json' && query.parser === 'backend') &&
    !(query.type === 'graphql' && query.parser === 'backend') &&
    !(query.type === 'csv' && query.parser === 'backend') &&
    !(query.type === 'tsv' && query.parser === 'backend') &&
    !(query.type === 'xml' && query.parser === 'backend') &&
    !(query.type === 'html' && query.parser === 'backend') &&
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
    <div className="infinity-query-editor" data-testid="infinity-query-editor" style={{ marginBottom: '5px' }}>
      <EditorRows>
        {showHelp && (
          <EditorRow label="Help">
            <div style={{ marginBlock: '10px' }}>
              <HelpLinks />
            </div>
          </EditorRow>
        )}
        <BasicOptions
          {...{ instanceSettings, mode, query, onChange, onRunQuery }}
          onShowUrlOptions={() => setShowUrlOptions(!showUrlOptions)}
          onShowHelp={() => setShowHelp(!showHelp)}
          datasource={datasource}
        />
        {query.type === 'series' && <SeriesEditor {...{ query, onChange }} />}
        {isDataQuery(query) && query.source !== 'inline' && showUrlOptions && <URLEditor {...{ mode, query, onChange, onRunQuery }} />}
        {isDataQuery(query) && query.source === 'azure-blob' && <AzureBlobEditor query={query} onChange={onChange} />}
        {canShowColumnsEditor && <QueryColumnsEditor {...{ mode, query, onChange, onRunQuery }} />}
        {canShowFilterEditor && <TableFilter {...{ query, onChange, onRunQuery }} />}
        {query.type === 'uql' && (
          <>
            <EditorRow label="UQL" collapsible={true} title={() => 'UQL'}>
              <UQLEditor {...{ query, onChange, onRunQuery, mode }} />
            </EditorRow>
          </>
        )}
        {query.type === 'groq' && (
          <EditorRow label="GROQ" collapsible={true} title={() => 'GROQ'}>
            <GROQEditor {...{ query, onChange, onRunQuery, mode }} />
          </EditorRow>
        )}
        {(query.type === 'json' || query.type === 'graphql' || query.type === 'csv' || query.type === 'tsv' || query.type === 'xml') && query.parser === 'backend' && (
          <ExperimentalFeatures query={query} onChange={onChange} onRunQuery={onRunQuery} />
        )}
        {query.type === 'json' && query.parser === 'backend' && query.source === 'url' && <PaginationEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />}
        {query.type === 'transformations' && <TransformationsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />}
      </EditorRows>
    </div>
  );
};
