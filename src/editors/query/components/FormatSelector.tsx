import React from 'react';
import { Select } from '@grafana/ui';
import { InfinityQuery, SCRAP_QUERY_RESULT_FORMATS, InfinityQueryFormat } from './../../../types';
interface FormatSelectorProps {
  query: InfinityQuery;
  onChange: (e: InfinityQuery) => void;
}
export const FormatSelector = (props: FormatSelectorProps) => {
  const { query, onChange } = props;
  return (
    <>
      <label title="Format of the query" className={`gf-form-label query-keyword width-4`}>
        Format
      </label>
      <Select
        className="min-width-8 width-8"
        value={query.format}
        options={SCRAP_QUERY_RESULT_FORMATS}
        onChange={(e) => onChange({ ...query, format: e.value as InfinityQueryFormat })}
      ></Select>
    </>
  );
};
