import React from 'react';
import { Select, InlineFormLabel } from '@grafana/ui';
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
      <div className="select-wrapper">
        <Select width={16} options={supportedSources} value={query.source || 'url'} onChange={(e) => onSourceChange(e.value as InfinityQuerySources)}></Select>
      </div>
    </>
  );
};
