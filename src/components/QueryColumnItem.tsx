import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import { isDataQuery } from './../app/utils';
import { INFINITY_COLUMN_FORMATS } from './../constants';
import { Select, InlineFormLabel } from '@grafana/ui';
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
  const onTimeFormatChange = (timestampFormat: string) => {
    const columns = cloneDeep(query.columns || []);
    columns[index].timestampFormat = timestampFormat;
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
      {(query.type === 'json' || query.type === 'graphql' || query.type === 'csv' || query.type === 'tsv') && query.parser === 'backend' && column.type === 'timestamp' && (
        <>
          <InlineFormLabel width={11} tooltip={'Timestamp format in golang layout. Example: 2006-01-02T15:04:05Z07:00'}>
            Time Format (optional)
          </InlineFormLabel>
          <Select
            value={column.timestampFormat}
            placeholder="Auto"
            options={[
              { value: '', label: 'Auto' },
              { value: '2006-01-02T15:04:05Z07:00', label: 'Default ISO' },
              { value: '2006-01-02', label: 'YYYY-MM-DD' },
              { value: '2006/01/02', label: 'YYYY/MM/DD' },
              { value: '2006-01', label: 'YYYY-MM' },
              { value: '2006/01', label: 'YYYY/MM' },
              { value: '2006', label: 'YYYY' },
              { value: '2006/01/02 15:04', label: 'YYYY/MM/DD HH:mm' },
              { value: '2006/01/02 15:04:05', label: 'YYYY/MM/DD HH:mm:ss' },
              { value: 'Mon Jan _2 15:04:05 2006', label: 'ANSIC' },
              { value: 'Mon Jan _2 15:04:05 MST 2006', label: 'UnixDate' },
              { value: 'Mon Jan 02 15:04:05 -0700 2006', label: 'RubyDate' },
              { value: '02 Jan 06 15:04 MST', label: 'RFC822' },
              { value: '02 Jan 06 15:04 -0700', label: 'RFC822Z' },
              { value: 'Monday, 02-Jan-06 15:04:05 MST', label: 'RFC850' },
              { value: 'Mon, 02 Jan 2006 15:04:05 MST', label: 'RFC1123' },
              { value: 'Mon, 02 Jan 2006 15:04:05 -0700', label: 'RFC1123Z' },
              { value: '2006-01-02T15:04:05Z07:00', label: 'RFC3339' },
              { value: '2006-01-02T15:04:05.999999999Z07:00', label: 'RFC3339Nano' },
              { value: '3:04PM', label: 'Kitchen' },
              { value: 'Jan _2 15:04:05', label: 'Stamp' },
              { value: 'Jan _2 15:04:05.000', label: 'StampMilli' },
              { value: 'Jan _2 15:04:05.000000', label: 'StampMicro' },
              { value: 'Jan _2 15:04:05.000000000', label: 'StampNano' },
            ].map((o) => ({ ...o, description: o.value }))}
            onChange={(e) => onTimeFormatChange(e?.value || '')}
          />
        </>
      )}
    </>
  );
};
