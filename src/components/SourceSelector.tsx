import React from 'react';
import { InlineFormLabel } from '@grafana/ui';
import { Select } from './extended/ui';
import { InfinityQuery, INFINITY_SOURCES, InfinityQuerySources } from '../types';

export const SourceSelector = (props: { query: InfinityQuery; onChange: (e: InfinityQuery) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
  if (query.type === 'global') {
    return <></>;
  }
  const supportedSources = INFINITY_SOURCES.filter((source) => source.supported_types.includes(query.type));
  const onSourceChange = (source: InfinityQuerySources) => {
    onChange({ ...query, source } as InfinityQuery);
    onRunQuery();
  };
  return (
    <>
      <InlineFormLabel className={`query-keyword`} width={4}>
        {query.type === 'series' ? 'Scenario' : 'Source'}
      </InlineFormLabel>
      <div style={{ marginRight: '5px' }} data-testid="infinity-query-source-selector">
        <Select width={16} options={supportedSources} value={query.source || 'url'} onChange={(e) => onSourceChange(e.value as InfinityQuerySources)} menuShouldPortal={true}></Select>
      </div>
    </>
  );
};
