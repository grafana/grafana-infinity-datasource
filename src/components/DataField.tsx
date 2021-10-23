import React, { useState } from 'react';
import { InlineFormLabel, Icon } from '@grafana/ui';
import { isDataQuery } from './../app/utils';
import { InfinityQuery, EditorMode } from '../types';

interface DataFieldProps {
  query: InfinityQuery;
  onChange: (e: InfinityQuery) => void;
  mode: EditorMode;
  onRunQuery: () => void;
}
export const DataField = (props: DataFieldProps) => {
  const { query, onChange, onRunQuery } = props;
  const [data, setData] = useState(isDataQuery(query) && query.source === 'inline' ? query.data || '' : '');
  if (!(isDataQuery(query) && query.source === 'inline')) {
    return <></>;
  }
  const LABEL_WIDTH = props.mode === 'variable' ? 10 : 8;
  const onDataChange = () => {
    onChange({ ...query, data });
    onRunQuery();
  };
  return (
    <>
      <InlineFormLabel className={`query-keyword`} width={LABEL_WIDTH}>
        Data
      </InlineFormLabel>
      <textarea rows={5} className="gf-form-input" style={{ width: '600px' }} value={data} placeholder="" onBlur={onDataChange} onChange={(e) => setData(e.target.value)}></textarea>
      <Icon name="play" size="lg" style={{ color: 'greenyellow' }} />
    </>
  );
};
