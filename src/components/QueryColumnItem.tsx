import { isDataQuery } from 'app/utils';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import { INFINITY_COLUMN_FORMATS } from './../constants';
import { Select } from '@grafana/ui';
import type { InfinityColumn, InfinityColumnFormat, InfinityQuery } from './../types';

interface QueryColumnItemProps {
  query: InfinityQuery;
  onChange: (value: any) => void;
  onRunQuery: () => void;
  index: number;
}
export const QueryColumnItem = (props: QueryColumnItemProps) => {
  const { query, index, onChange, onRunQuery } = props;

  const column = isDataQuery(query) ? query.columns[index] : ({ selector: '', text: '', type: 'string' } as InfinityColumn);
  const [selector, setSelector] = useState(column.selector || '');
  const [text, setText] = useState(column.text || '');
  if (!isDataQuery(query)) {
    return <></>;
  }
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
  const onFormatChange = (type: InfinityColumnFormat) => {
    const columns = cloneDeep(query.columns || []);
    columns[index].type = type;
    onChange({ ...query, columns });
    onRunQuery();
  };
  return (
    <>
      <label className="gf-form-label width-6">{query.type === 'csv' ? 'Column Name' : 'Selector'}</label>
      <input
        type="text"
        className="gf-form-input min-width-8"
        value={selector}
        placeholder={query.type === 'csv' ? 'Column Name' : 'Selector'}
        onChange={(e) => setSelector(e.currentTarget.value)}
        onBlur={onSelectorChange}
      ></input>
      <label className="gf-form-label width-2">as</label>
      <input type="text" className="gf-form-input min-width-8" value={text} placeholder="Title" onChange={(e) => setText(e.currentTarget.value)} onBlur={onTextChange}></input>
      <label className="gf-form-label width-5">format as</label>
      <Select
        className="min-width-12 width-12"
        value={column.type}
        options={INFINITY_COLUMN_FORMATS}
        onChange={(e) => onFormatChange(e.value as InfinityColumnFormat)}
        menuShouldPortal={true}
      ></Select>
    </>
  );
};
