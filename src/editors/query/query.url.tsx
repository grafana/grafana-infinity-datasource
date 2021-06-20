import React, { ChangeEvent, useState } from 'react';
import { set } from 'lodash';
import { QueryColumnsEditor } from './query.columns.editor';
import { URLOptionsEditor } from './query.url.options';
import { InfinityQuery, EditorMode } from '../../types';

interface ScrapperProps {
  query: InfinityQuery;
  mode: EditorMode;
  onChange: (value: any) => void;
  onRunQuery: any;
}

export const URLEditor: React.FC<ScrapperProps> = (props) => {
  const [data, setData] = useState(props.query.data);
  const onInputTextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof InfinityQuery,
    props: any,
    splitIntoArray = false
  ) => {
    const { query, onChange } = props;
    const value = splitIntoArray ? event.target.value.split(',') : event.target.value;
    set(query, field, value);
    onChange(query);
  };
  const LABEL_WIDTH = props.mode === EditorMode.Variable ? 10 : 8;
  return (
    <>
      {['url', 'local-fs'].includes(props.query.source) ? (
        <div className="gf-form-inline">
          <div className="gf-form">
            <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>
              {props.query.source === 'url' ? 'URL' : 'File full path'}
            </label>
            <input
              type="text"
              className="gf-form-input min-width-30"
              value={props.query.url}
              placeholder="https://jsonplaceholder.typicode.com/todos"
              onChange={(e) => onInputTextChange(e, `url`, props)}
              onBlur={props.onRunQuery}
            ></input>
            {props.query.source === 'url' && (
              <URLOptionsEditor onChange={props.onChange} query={props.query} onRunQuery={props.onRunQuery} />
            )}
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
              onBlur={(e) => {
                onInputTextChange(e, `data`, props);
                props.onRunQuery();
              }}
              onChange={(e) => setData(e.target.value)}
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
              onChange={(e) => {
                onInputTextChange(e, `root_selector`, props);
                props.onRunQuery();
              }}
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
