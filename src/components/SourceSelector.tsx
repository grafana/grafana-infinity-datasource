import React from 'react';
import { Select } from '@grafana/ui';
import { InfinityQuery, SCRAP_QUERY_SOURCES, InfinityQuerySources } from '../types';
interface SourceSelectorProps {
  query: InfinityQuery;
  onChange: (e: InfinityQuery) => void;
  onRunQuery: () => void;
}
export const SourceSelector = (props: SourceSelectorProps) => {
  const { query, onChange, onRunQuery } = props;
  const supportedSources = SCRAP_QUERY_SOURCES.filter((source) => source.supported_types.includes(query.type));
  const onSourceChange = (source: InfinityQuerySources) => {
    onChange({ ...query, source });
    onRunQuery();
  };
  return (
    <>
      <label className={`gf-form-label query-keyword width-4`}>{query.type === 'series' ? 'Scenario' : 'Source'}</label>
      <div className="select-wrapper">
        <Select className="width-8" options={supportedSources} value={query.source || 'url'} onChange={(e) => onSourceChange(e.value as InfinityQuerySources)}></Select>
      </div>
    </>
  );
};
