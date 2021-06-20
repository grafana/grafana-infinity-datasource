import React from 'react';
import { Select } from '@grafana/ui';
import { InfinityQuery, SCRAP_QUERY_SOURCES, InfinityQuerySources } from './../../../types';
interface SourceSelectorProps {
  query: InfinityQuery;
  onChange: (e: InfinityQuery) => void;
}
export const SourceSelector = (props: SourceSelectorProps) => {
  const { query, onChange } = props;
  const supportedSources = SCRAP_QUERY_SOURCES.filter(source => source.supported_types.includes(query.type));
  return (
    <>
      <label className={`gf-form-label query-keyword width-4`}>{query.type === 'series' ? 'Scenario' : 'Source'}</label>
      <Select
        className="width-8"
        options={supportedSources}
        value={query.source || InfinityQuerySources.URL}
        onChange={e => onChange({ ...query, source: e.value as InfinityQuerySources })}
      ></Select>
    </>
  );
};
