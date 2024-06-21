import React from 'react';
import { Button, LinkButton } from '@grafana/ui';
import { EditorRow } from '../../components/extended/EditorRow';
import { FormatSelector } from '../../components/FormatSelector';
import { GlobalQuerySelector } from '../../components/GlobalQuerySelector';
import { ReferenceNameEditor } from './components/ReferenceName';
import { InlineDataEntry, ImportData } from './query.data';
import { SourceSelector } from '../../components/SourceSelector';
import { TypeSelector } from '../../components/TypeSelector';
import { ParseTypeEditor } from './components/ParserType';
import { GoogleSheetsEditor } from './components/GoogleSheets';
import { URL, Method } from './query.url';
import { Datasource } from './../../datasource';
import { isDataQuery, isInfinityQueryWithUrlSource } from './../../app/utils';
import type { EditorMode, InfinityQuery, InfinityQueryType, InfinityQueryWithURLSource } from '../../types';

export const BasicOptions = (props: {
  mode: EditorMode;
  datasource: Datasource;
  instanceSettings: any;
  query: InfinityQuery;
  onChange: (value: any) => void;
  onRunQuery: () => void;
  onShowUrlOptions: () => void;
  onShowHelp: () => void;
}) => {
  const { query, mode, onChange, onRunQuery, onShowUrlOptions, onShowHelp, datasource } = props;
  return (
    <>
      <EditorRow label="Query options">
        <TypeSelector {...props} />
        <ParseTypeEditor {...props} />
        {query.type === 'transformations' ? <></> : query.type !== 'global' ? <SourceSelector {...props} /> : <GlobalQuerySelector {...props} />}
        {isDataQuery(query) && query.source === 'reference' && <ReferenceNameEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={datasource} />}
        {query.type !== 'series' && mode !== 'variable' && query.type !== 'google-sheets' && query.type !== 'global' && <FormatSelector {...props} />}
        {query.type === 'google-sheets' && <GoogleSheetsEditor query={query} onChange={props.onChange} onRunQuery={props.onRunQuery} />}
        <Button
          variant="secondary"
          fill="outline"
          size="sm"
          icon="document-info"
          style={{ marginTop: '10px', marginRight: '5px' }}
          onClick={(e) => {
            onShowHelp();
            e.preventDefault();
          }}
        >
          Help
        </Button>
        <LinkButton
          variant="primary"
          fill="outline"
          size="sm"
          style={{ marginTop: '10px', marginRight: '5px' }}
          href="https://github.com/grafana/grafana-infinity-datasource"
          target="_blank"
          rel="noreferrer"
        >
          Github
        </LinkButton>
      </EditorRow>
      {isInfinityQueryWithUrlSource(query) && (
        <EditorRow label={'URL'}>
          <Method query={query} onChange={onChange} onRunQuery={onRunQuery} />
          <URL query={query as InfinityQueryWithURLSource<InfinityQueryType>} onChange={onChange} onRunQuery={onRunQuery} onShowUrlOptions={onShowUrlOptions} />
          <Button
            variant="secondary"
            fill="outline"
            size="sm"
            icon="cog"
            style={{ marginTop: '10px', marginRight: '5px' }}
            onClick={(e) => {
              onShowUrlOptions();
              e.preventDefault();
            }}
          >
            {query.url_options?.method === 'GET' ? 'Headers, Request params' : 'Headers, Body, Request params'}
          </Button>
        </EditorRow>
      )}
      {isDataQuery(query) && query.source === 'inline' && (
        <EditorRow label={'Inline Data'}>
          <InlineDataEntry query={query} onChange={onChange} onRunQuery={onRunQuery} />
          <ImportData query={query} onChange={onChange} onRunQuery={onRunQuery} />
        </EditorRow>
      )}
    </>
  );
};
