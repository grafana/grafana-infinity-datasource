import { Checkbox } from '@grafana/ui';
import React from 'react';
import { EditorField } from './extended/EditorField';
import type { InfinityJSONQueryOptions, InfinityQuery } from './../types';

export const JSONOptionsEditor = (props: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const { query, onChange } = props;
  if (query.type !== 'json') {
    return <></>;
  }
  if (query.parser === 'backend' || query.parser === 'uql' || query.parser === 'groq') {
    return <></>;
  }
  const { json_options = {} } = query;
  const onJsonOptionsChange = <T extends keyof InfinityJSONQueryOptions, V extends InfinityJSONQueryOptions[T]>(key: T, value: V) => {
    onChange({ ...query, json_options: { ...json_options, [key]: value } });
  };
  return (
    <>
      <EditorField label="Advanced Options" optional={true}>
        <div style={{ paddingBlockStart: '4px' }}>
          <div className="gf-form">
            <label className="gf-form-label  width-14">Root returns object instead array?</label>
            <div style={{ margin: '5px' }}>
              <Checkbox value={json_options.root_is_not_array} onChange={(e) => onJsonOptionsChange('root_is_not_array', e.currentTarget.checked)}></Checkbox>
            </div>
          </div>
          <div className="gf-form">
            <label className="gf-form-label width-14">Is data in columnar format?</label>
            <div style={{ margin: '5px' }}>
              <Checkbox value={json_options.columnar} onChange={(e) => onJsonOptionsChange('columnar', e.currentTarget.checked)}></Checkbox>
            </div>
          </div>
        </div>
      </EditorField>
    </>
  );
};
