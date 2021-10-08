import React from 'react';
import { Select } from '@grafana/ui';
import { InfinityQuery, SCRAP_QUERY_RESULT_FORMATS, InfinityQueryFormat } from '../types';
import { Components } from '../selectors';
interface FormatSelectorProps {
  query: InfinityQuery;
  onChange: (e: InfinityQuery) => void;
  onRunQuery: () => void;
}
export const FormatSelector = (props: FormatSelectorProps) => {
  const { query, onChange, onRunQuery } = props;
  const onFormatChange = (format: InfinityQueryFormat) => {
    onChange({ ...query, format });
    onRunQuery();
  };
  return (
    <>
      <label title={Components.QueryEditor.Format.Label.Title} className={`gf-form-label query-keyword width-4`}>
        {Components.QueryEditor.Format.Label.Text}
      </label>
      <div title={Components.QueryEditor.Format.Dropdown.PlaceHolder.Title} className="select-wrapper">
        <Select
          className="min-width-8 width-8"
          value={query.format}
          options={SCRAP_QUERY_RESULT_FORMATS}
          onChange={(e) => onFormatChange(e.value as InfinityQueryFormat)}
        ></Select>
      </div>
    </>
  );
};
