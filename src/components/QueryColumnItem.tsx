import React, { useState } from 'react';
import { isDataQuery, isBackendQuery } from './../app/utils';
import { INFINITY_COLUMN_FORMATS } from './../constants';
import { Select, InlineFormLabel, Input } from '@grafana/ui';
import type { InfinityColumn, InfinityColumnFormat, InfinityQuery } from './../types';

interface QueryColumnItemProps {
  query: InfinityQuery;
  onChange: (value: any) => void;
  onRunQuery: () => void;
  index: number;
}
export const QueryColumnItem = (props: QueryColumnItemProps) => {
  const { query, index, onChange } = props;
  const column = isDataQuery(query) || query.type === 'google-sheets' ? query.columns[index] : ({ selector: '', text: '', type: 'string' } as InfinityColumn);
  const [selector, setSelector] = useState(column.selector || '');
  const [text, setText] = useState(column.text || '');
  if (!isDataQuery(query) && query.type !== 'google-sheets') {
    return <></>;
  }
  const onSelectorChange = () => {
    const columns = [...query.columns];
    columns[index] = { ...columns[index], selector };
    onChange({ ...query, columns });
  };
  const onTextChange = () => {
    const columns = [...query.columns];
    columns[index] = { ...columns[index], text };
    onChange({ ...query, columns });
  };
  const onTimeFormatChange = (timestampFormat: string) => {
    const columns = [...query.columns];
    columns[index] = { ...columns[index], timestampFormat };
    onChange({ ...query, columns });
  };
  const onFormatChange = (type: InfinityColumnFormat) => {
    const columns = [...query.columns];
    columns[index] = { ...columns[index], type };
    onChange({ ...query, columns });
  };
  return (
    <div style={{ display: 'flex' }}>
      <InlineFormLabel width={8}>{query.type === 'csv' ? 'Column Name' : 'Selector'}</InlineFormLabel>
      <Input width={20} value={selector} placeholder={query.type === 'csv' ? 'Column Name' : 'Selector'} onChange={(e) => setSelector(e.currentTarget.value)} onBlur={onSelectorChange} />
      <InlineFormLabel width={2}>as</InlineFormLabel>
      <Input value={text} width={20} placeholder="Title" onChange={(e) => setText(e.currentTarget.value)} onBlur={onTextChange}></Input>
      <InlineFormLabel width={5}>format as</InlineFormLabel>
      <Select width={24} value={column.type} options={INFINITY_COLUMN_FORMATS} onChange={(e) => onFormatChange(e.value as InfinityColumnFormat)} menuShouldPortal={true}></Select>
      {(isBackendQuery(query) || query.type === 'google-sheets') && column.type === 'timestamp' && (
        <>
          <div style={{ marginLeft: '5px' }}>
            <InlineFormLabel width={11} tooltip={'Timestamp format in golang layout. Example: 2006-01-02T15:04:05Z07:00'}>
              Time Format (optional)
            </InlineFormLabel>
          </div>
          <Select
            width={30}
            value={column.timestampFormat}
            placeholder="Auto"
            allowCustomValue={true}
            options={[
              { value: '', label: 'Auto' },
              { value: '2006-01-02T15:04:05Z07:00', label: 'Default ISO' },
              { value: '2006-01-02', label: 'YYYY-MM-DD' },
              { value: '2006/01/02', label: 'YYYY/MM/DD' },
              { value: '2006 / 01 / 02', label: 'YYYY / MM / DD' },
              { value: '20060102', label: 'YYYYMMDD' },
              { value: '2006-01', label: 'YYYY-MM' },
              { value: '2006/01', label: 'YYYY/MM' },
              { value: '200601', label: 'YYYYMM' },
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
    </div>
  );
};
