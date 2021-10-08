import React, { useState } from 'react';
import { InfinityQuery, EditorMode } from '../types';
interface RootSelectorProps {
  query: InfinityQuery;
  mode: EditorMode;
  onChange: (e: InfinityQuery) => void;
  onRunQuery: () => void;
}
export const RootSelector = (props: RootSelectorProps) => {
  const { query, onChange, onRunQuery } = props;
  const [root_selector, setRootSelector] = useState(query.root_selector);
  const LABEL_WIDTH = props.mode === EditorMode.Variable ? 10 : 8;
  const onRootSelectorChange = () => {
    onChange({ ...query, root_selector });
    onRunQuery();
  };
  return (
    <>
      <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>Rows / Root</label>
      <input
        type="text"
        className="gf-form-input min-width-30 width-30"
        value={root_selector}
        placeholder=""
        onChange={(e) => setRootSelector(e.currentTarget.value)}
        onBlur={onRootSelectorChange}
      ></input>
    </>
  );
};
