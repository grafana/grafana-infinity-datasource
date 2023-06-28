import React from 'react';
import { INFINITY_SOURCES } from './../constants';
import { Select } from '@grafana/ui';
import { EditorField } from './extended/EditorField';
import type { InfinityQuery, InfinityQuerySources } from './../types';

export const SourceSelector = (props: { query: InfinityQuery; onChange: (e: InfinityQuery) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
  if (query.type === 'global' || query.type === 'google-sheets' || query.type === 'transformations') {
    return <></>;
  }
  const supportedSources = INFINITY_SOURCES.filter((source) => source.supported_types.includes(query.type));
  const onSourceChange = (source: InfinityQuerySources) => {
    onChange({ ...query, source } as InfinityQuery);
    onRunQuery();
  };
  return (
    <EditorField label={query.type === 'series' ? 'Scenario' : 'Source'} horizontal={true}>
      <Select width={18} options={supportedSources} value={query.source || 'url'} onChange={(e) => onSourceChange(e.value as InfinityQuerySources)} menuShouldPortal={true}></Select>
    </EditorField>
  );
};
