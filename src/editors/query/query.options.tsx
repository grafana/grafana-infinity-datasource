import React from 'react';
import { Button, LinkButton, Stack } from '@grafana/ui';
import { EditorRow } from '@/components/extended/EditorRow';
import { FormatSelector } from '@/components/FormatSelector';
import { GlobalQuerySelector } from '@/components/GlobalQuerySelector';
import { InlineDataEntry, ImportData } from '@/editors/query/query.data';
import { SourceSelector } from '@/components/SourceSelector';
import { TypeSelector } from '@/components/TypeSelector';
import { ReferenceNameEditor } from '@/editors/query/components/ReferenceName';
import { ParseTypeEditor } from '@/editors/query/query.parser';
import { GoogleSheetsEditor } from '@/editors/query/components/GoogleSheets';
import { URL, Method } from '@/editors/query/query.url';
import { Datasource } from '@/datasource';
import { isDataQuery, isInfinityQueryWithUrlSource } from '@/app/utils';
import type { EditorMode, InfinityQuery, InfinityQueryType, InfinityQueryWithURLSource } from '@/types';
import { EditorField } from '@/components/extended/EditorField';

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
  const { query, mode, onChange, onRunQuery, onShowHelp, datasource } = props;
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
      {isInfinityQueryWithUrlSource(query) && <BasicURLEditor {...props} />}
      {isDataQuery(query) && query.source === 'inline' && (
        <EditorRow label={'Inline Data'}>
          <InlineDataEntry query={query} onChange={onChange} onRunQuery={onRunQuery} />
          <ImportData query={query} onChange={onChange} onRunQuery={onRunQuery} />
        </EditorRow>
      )}
    </>
  );
};

export const BasicURLEditor = (
  props: {
    mode: EditorMode;
    datasource: Datasource;
    instanceSettings: any;
    query: InfinityQuery;
    onChange: (value: any) => void;
    onRunQuery: () => void;
    onShowUrlOptions: () => void;
    onShowHelp: () => void;
    liteMode?: boolean;
  } & React.PropsWithChildren
) => {
  const { onChange, onRunQuery, onShowUrlOptions, instanceSettings, liteMode, children } = props;
  let query = props.query as InfinityQueryWithURLSource<InfinityQueryType>;
  let urlOptionsLabel = query.url_options?.method === 'GET' ? 'Headers, Request params' : 'Headers, Body, Request params';
  if (liteMode) {
    urlOptionsLabel = `Configure URL`;
  }
  return (
    <EditorRow label={'URL'}>
      {!liteMode && <Method query={query as any} onChange={onChange} onRunQuery={onRunQuery} allowDangerousHTTPMethods={!!instanceSettings.jsonData.allowDangerousHTTPMethods} />}
      <URL query={query as InfinityQueryWithURLSource<InfinityQueryType>} onChange={onChange} onRunQuery={onRunQuery} onShowUrlOptions={onShowUrlOptions} liteMode={liteMode} />
      <EditorField label="" hideLabel>
        <Stack gap={1}>
          <URLOptionsButton liteMode={liteMode} query={query as any} onShowUrlOptions={onShowUrlOptions} />
        </Stack>
      </EditorField>
      {children || <></>}
    </EditorRow>
  );
};

export const URLOptionsButton = (props: { query: InfinityQuery; liteMode?: boolean; onShowUrlOptions: () => void }) => {
  const { liteMode, onShowUrlOptions } = props;
  let query = props.query as InfinityQueryWithURLSource<InfinityQueryType>;
  let urlOptionsLabel = query.url_options?.method === 'GET' ? 'Headers, Request params' : 'Headers, Body, Request params';
  if (liteMode) {
    urlOptionsLabel = ``;
  }
  return (
    <div style={{ marginBlockStart: liteMode ? '' : '' }}>
      <Button
        variant={liteMode ? 'secondary' : 'secondary'}
        fill={liteMode ? 'solid' : 'outline'}
        size={liteMode ? 'md' : 'sm'}
        icon="cog"
        onClick={(e) => {
          onShowUrlOptions();
          e.preventDefault();
        }}
      >
        {urlOptionsLabel}
      </Button>
    </div>
  );
};
