import React from 'react';
import { Button, LinkButton } from '@grafana/ui';
import { EditorRow } from '../../components/extended/EditorRow';
import { EditorField } from '../../components/extended/EditorField';
import { FormatSelector } from '../../components/FormatSelector';
import { GlobalQuerySelector } from '../../components/GlobalQuerySelector';
import { ReferenceNameEditor } from './components/ReferenceName';
import { InlineDataEntry } from './query.data';
import { SourceSelector } from '../../components/SourceSelector';
import { TypeSelector } from '../../components/TypeSelector';
import { ParseTypeEditor } from './components/ParserType';
import { GoogleSheetsEditor } from './components/GoogleSheets';
import { URL } from './query.url';
import { Datasource } from './../../datasource';
import { isDataQuery } from './../../app/utils';
import type { EditorMode, InfinityQuery } from '../../types';

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
    <EditorRow label="Query options">
      <TypeSelector {...props} />
      <ParseTypeEditor {...props} />
      {query.type !== 'global' ? <SourceSelector {...props} /> : <GlobalQuerySelector {...props} />}
      {isDataQuery(query) && query.source === 'reference' && <ReferenceNameEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={datasource} />}
      {isDataQuery(query) && query.source === 'url' && <URL query={query} onChange={onChange} onRunQuery={onRunQuery} onShowUrlOptions={onShowUrlOptions} />}
      {query.type !== 'series' && mode !== 'variable' && query.type !== 'google-sheets' && query.type !== 'global' && <FormatSelector {...props} />}
      {isDataQuery(query) && query.source === 'inline' && <InlineDataEntry query={query} onChange={onChange} onRunQuery={onRunQuery} />}
      {query.type === 'google-sheets' && <GoogleSheetsEditor query={query} onChange={props.onChange} onRunQuery={props.onRunQuery} />}
      <EditorField label="">
        <>
          <Button
            variant="secondary"
            fill="outline"
            size="sm"
            icon="document-info"
            style={{ marginTop: '18px', padding: '10px', marginRight: '10px' }}
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
            style={{ marginTop: '18px', padding: '6px 10px', marginRight: '10px' }}
            href="https://github.com/yesoreyeram/grafana-infinity-datasource"
            target="_blank"
            rel="noreferrer"
          >
            Github
          </LinkButton>
        </>
      </EditorField>
    </EditorRow>
  );
};
