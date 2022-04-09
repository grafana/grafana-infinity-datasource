import React from 'react';
import { Select } from '@grafana/ui';
import { InfinityQuery, INFINITY_RESULT_FORMATS, InfinityQueryFormat } from '../types';
import { Components } from '../selectors';
import { isDataQuery } from 'app/utils';
interface FormatSelectorProps {
  query: InfinityQuery;
  onChange: (e: InfinityQuery) => void;
  onRunQuery: () => void;
}
export const FormatSelector = (props: FormatSelectorProps) => {
  const { query, onChange, onRunQuery } = props;
  if (!(isDataQuery(query) || query.type === 'uql')) {
    return <></>;
  }
  const onFormatChange = (format: InfinityQueryFormat) => {
    onChange({ ...query, format });
    onRunQuery();
  };
  const getFormats = () => {
    if (query.type === 'json' && query.source === 'inline') {
      return INFINITY_RESULT_FORMATS;
    } else if (query.type === 'uql') {
      return INFINITY_RESULT_FORMATS.filter((f) => f.value === 'table' || f.value === 'timeseries' || f.value === 'dataframe');
    } else {
      return INFINITY_RESULT_FORMATS.filter((f) => f.value !== 'as-is');
    }
  };
  return (
    <>
      <label title={Components.QueryEditor.Format.Label.Title} className={`gf-form-label query-keyword width-4`}>
        {Components.QueryEditor.Format.Label.Text}
      </label>
      <div title={Components.QueryEditor.Format.Dropdown.PlaceHolder.Title} style={{ marginRight: '5px' }}>
        <Select className="min-width-12 width-12" value={query.format} options={getFormats()} onChange={(e) => onFormatChange(e.value as InfinityQueryFormat)}></Select>
      </div>
    </>
  );
};
