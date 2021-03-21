import React, { useState } from 'react';
import { QueryColumnsEditor } from './query.columns.editor';
import { URLOptionsEditor } from './query.url.options';
import { InfinityQuery, EditorMode } from '../../types';

interface ScrapperProps {
  query: InfinityQuery;
  mode: EditorMode;
  onChange: (value: any) => void;
  onRunQuery: any;
}

export const URLEditor: React.FC<ScrapperProps> = props => {
  const [data, setData] = useState(props.query.data);
  const onInputTextChange = (value: string, field: keyof InfinityQuery, props: any) => {
    const { query, onChange } = props;
    onChange({ ...query, [field]: value });
  };
  const LABEL_WIDTH = props.mode === EditorMode.Variable ? 10 : 8;
  return (
    <>
      {props.query.source === 'url' ? (
        <div className="gf-form-inline">
          <div className="gf-form">
            <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>URL</label>
            <input
              type="text"
              className="gf-form-input min-width-30"
              value={props.query.url}
              placeholder="https://jsonplaceholder.typicode.com/todos"
              onChange={e => onInputTextChange(e.currentTarget.value, `url`, props)}
              onBlur={props.onRunQuery}
            ></input>
            <URLOptionsEditor onChange={props.onChange} query={props.query} />
          </div>
        </div>
      ) : (
        <div className="gf-form-inline">
          <div className="gf-form">
            <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>Data</label>
            <textarea
              rows={5}
              className="gf-form-input min-width-30"
              value={data}
              placeholder=""
              onBlur={e => onInputTextChange(e.currentTarget.value, `data`, props)}
              onChange={e => setData(e.target.value)}
            ></textarea>
          </div>
        </div>
      )}
      {['html', 'json', 'xml', 'graphql'].indexOf(props.query.type) > -1 ? (
        <div className="gf-form-inline">
          <div className="gf-form">
            <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>Rows / Root</label>
            <input
              type="text"
              className="gf-form-input min-width-30"
              value={props.query.root_selector}
              placeholder=""
              onChange={e => onInputTextChange(e.currentTarget.value, `root_selector`, props)}
            ></input>
          </div>
        </div>
      ) : (
        <></>
      )}
      <QueryColumnsEditor onChange={props.onChange} query={props.query} mode={props.mode} />
    </>
  );
};
