import React, { useState } from 'react';
import { cloneDeep } from 'lodash';
import { Select } from '@grafana/ui';
import { SCRAP_QUERY_RESULT_COLUMN_FORMATS, InfinityQuery, ScrapColumnFormat, EditorMode } from '../../types';

interface QueryColumnItemProps {
  query: InfinityQuery;
  mode: EditorMode;
  onChange: (value: any) => void;
  onRunQuery: () => void;
  index: number;
}
export const QueryColumnItem = (props: QueryColumnItemProps) => {
  const { query, index, onChange, onRunQuery, mode } = props;
  const LABEL_WIDTH = mode === EditorMode.Variable ? 10 : 8;
  const column = query.columns[index];
  const [selector, setSelector] = useState(column.selector || '');
  const [text, setText] = useState(column.text || '');
  const onSelectorChange = () => {
    const columns = cloneDeep(query.columns || []);
    columns[index].selector = selector;
    onChange({ ...query, columns });
    onRunQuery();
  };
  const onTextChange = () => {
    const columns = cloneDeep(query.columns || []);
    columns[index].text = text;
    onChange({ ...query, columns });
    onRunQuery();
  };
  const onFormatChange = (type: ScrapColumnFormat) => {
    const columns = cloneDeep(query.columns || []);
    columns[index].type = type;
    onChange({ ...query, columns });
    onRunQuery();
  };
  return (
    <>
      <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`} title="Column">
        Column {index + 1}
      </label>
      <label className="gf-form-label width-8">{query.type === 'csv' ? 'Column Name' : 'Selector'}</label>
      <input
        type="text"
        className="gf-form-input min-width-8"
        value={selector}
        placeholder={query.type === 'csv' ? 'Column Name' : 'Selector'}
        onChange={(e) => setSelector(e.currentTarget.value)}
        onBlur={onSelectorChange}
      ></input>
      <label className="gf-form-label width-2">as</label>
      <input
        type="text"
        className="gf-form-input min-width-8"
        value={text}
        placeholder="Title"
        onChange={(e) => setText(e.currentTarget.value)}
        onBlur={onTextChange}
      ></input>
      <Select
        className="min-width-12 width-12"
        value={column.type}
        options={SCRAP_QUERY_RESULT_COLUMN_FORMATS}
        onChange={(e) => onFormatChange(e.value as ScrapColumnFormat)}
      ></Select>
    </>
  );
};
