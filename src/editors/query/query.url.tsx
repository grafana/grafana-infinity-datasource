import React, { useState } from 'react';
import { InlineFormLabel, Icon } from '@grafana/ui';
import { URLOptionsEditor } from './query.url.options';
import { isDataQuery } from './../../app/utils';
import { InfinityQuery, EditorMode } from '../../types';

export const URLEditor = (props: { query: InfinityQuery; mode: EditorMode; onChange: (value: any) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
  const LABEL_WIDTH = props.mode === 'variable' ? 10 : 8;
  const canShowURLField = (isDataQuery(query) || query.type === 'uql' || query.type === 'groq') && query.source === 'url';
  const [data, setData] = useState((isDataQuery(query) || query.type === 'uql' || query.type === 'groq') && query.source === 'inline' ? query.data || '' : '');
  const [url, setURL] = useState((isDataQuery(query) || query.type === 'uql' || query.type === 'groq') && query.source === 'url' ? query.url || '' : '');
  if (!(isDataQuery(query) || query.type === 'uql' || query.type === 'groq')) {
    return <></>;
  }
  const onDataChange = () => {
    onChange({ ...query, data, url });
    onRunQuery();
  };
  const onURLChange = () => {
    onChange({ ...query, url });
    onRunQuery();
  };
  return (
    <>
      {canShowURLField ? (
        <div className="gf-form">
          <InlineFormLabel className={`query-keyword`} width={LABEL_WIDTH}>
            URL
          </InlineFormLabel>
          <input
            type="text"
            className="gf-form-input"
            value={url}
            placeholder="https://jsonplaceholder.typicode.com/todos"
            style={{ width: '594px' }}
            onChange={(e) => setURL(e.currentTarget.value)}
            onBlur={onURLChange}
            data-testid="infinity-query-url-input"
          ></input>
          <div style={{ marginLeft: '5px' }}>
            <URLOptionsEditor {...props} />
          </div>
        </div>
      ) : (
        <div className="gf-form">
          <InlineFormLabel className={`query-keyword`} width={LABEL_WIDTH}>
            Data
          </InlineFormLabel>
          <textarea
            rows={5}
            className="gf-form-input"
            style={{ width: '594px' }}
            value={data}
            placeholder=""
            onBlur={onDataChange}
            onChange={(e) => setData(e.target.value)}
            data-testid="infinity-query-inline-data-selector"
          />
          <Icon name="play" size="lg" style={{ color: 'greenyellow' }} onClick={() => onDataChange()} />
        </div>
      )}
    </>
  );
};
