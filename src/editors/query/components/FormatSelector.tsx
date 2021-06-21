import React from 'react';
import { Select } from '@grafana/ui';
import { InfinityQuery, SCRAP_QUERY_RESULT_FORMATS, InfinityQueryFormat } from './../../../types';
import { Components } from './../../../selectors';
interface FormatSelectorProps {
  query: InfinityQuery;
  onChange: (e: InfinityQuery) => void;
}
export const FormatSelector = (props: FormatSelectorProps) => {
  const { query, onChange } = props;
  return (
    <>
      <label title={Components.QueryEditor.Format.Label.Title} className={`gf-form-label query-keyword width-4`}>
        {Components.QueryEditor.Format.Label.Text}
      </label>
      <div title={Components.QueryEditor.Format.Dropdown.PlaceHolder.Title}>
        <Select
          className="min-width-8 width-8"
          value={query.format}
          options={SCRAP_QUERY_RESULT_FORMATS}
          onChange={e => onChange({ ...query, format: e.value as InfinityQueryFormat })}
        ></Select>
      </div>
    </>
  );
};
