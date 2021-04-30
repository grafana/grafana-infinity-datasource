import React, { useState } from 'react';
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

export const URLEditor: React.FC<ScrapperProps> = props => {
  const { query, onChange, onRunQuery } = props;
  const [state, setState] = useState<InfinityQuery>(props.query);
  const onSave = () => {
    onChange(state);
    onRunQuery();
  };
  const updateState = (value: string, key: keyof InfinityQuery) => {
    let newQuery = { ...query };
    set(newQuery, key, value);
    setState(newQuery);
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
              value={state.url}
              placeholder="https://jsonplaceholder.typicode.com/todos"
              onChange={e => updateState(e.currentTarget.value, `url`)}
              onBlur={onSave}
            ></input>
            <URLOptionsEditor onChange={props.onChange} query={{ ...state }} />
          </div>
        </div>
      ) : (
        <div className="gf-form-inline">
          <div className="gf-form">
            <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>Data</label>
            <textarea
              rows={5}
              className="gf-form-input min-width-30"
              value={state.data}
              placeholder=""
              onBlur={onSave}
              onChange={e => updateState(e.currentTarget.value, 'data')}
            ></textarea>
          </div>
        </div>
      )}
      {['html', 'json', 'xml', 'graphql'].indexOf(state.type) > -1 ? (
        <div className="gf-form-inline">
          <div className="gf-form">
            <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>Rows / Root</label>
            <input
              type="text"
              className="gf-form-input min-width-30"
              value={state.root_selector}
              placeholder=""
              onChange={e => updateState(e.currentTarget.value, `root_selector`)}
              onBlur={onSave}
            ></input>
          </div>
        </div>
      ) : (
        <></>
      )}
      <QueryColumnsEditor onChange={props.onChange} query={{ ...query }} mode={props.mode} />
    </>
  );
};
