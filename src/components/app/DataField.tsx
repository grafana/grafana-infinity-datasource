import React, { useState } from 'react';
import { InfinityQuery, EditorMode } from '../../types';
interface DataFieldProps {
  query: InfinityQuery;
  onChange: (e: InfinityQuery) => void;
  mode: EditorMode;
  onRunQuery: () => void;
}
export const DataField = (props: DataFieldProps) => {
  const { query, onChange, onRunQuery } = props;
  const [data, setData] = useState(query.data);
  const LABEL_WIDTH = props.mode === EditorMode.Variable ? 10 : 8;
  const onDataChange = () => {
    onChange({ ...query, data });
    onRunQuery();
  };
  return (
    <>
      <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>Data</label>
      <textarea
        rows={5}
        className="gf-form-input min-width-30"
        value={data}
        placeholder=""
        onBlur={onDataChange}
        onChange={(e) => setData(e.target.value)}
      ></textarea>
    </>
  );
};
