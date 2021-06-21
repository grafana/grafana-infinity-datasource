import React, { useState } from 'react';
import { InfinityQuery, EditorMode, InfinityQuerySources } from '../../types';
interface URLFieldProps {
  query: InfinityQuery;
  onChange: (e: InfinityQuery) => void;
  mode: EditorMode;
  onRunQuery: () => void;
}
export const URLField = (props: URLFieldProps) => {
  const { query, onChange, onRunQuery } = props;
  const [url, setURL] = useState(query.url);
  const LABEL_WIDTH = props.mode === EditorMode.Variable ? 10 : 8;
  const onURLChange = () => {
    onChange({ ...query, url });
    onRunQuery();
  };
  return (
    <>
      <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>
        {query.source === InfinityQuerySources.URL ? 'URL' : 'File full path'}
      </label>
      <input
        type="text"
        className="gf-form-input min-width-30 width-30"
        value={url}
        placeholder="https://jsonplaceholder.typicode.com/todos"
        onChange={(e) => setURL(e.currentTarget.value)}
        onBlur={onURLChange}
      ></input>
    </>
  );
};
