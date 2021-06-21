import React from 'react';
import { QueryColumnsEditor } from './query.columns.editor';
import { URLOptionsEditor } from './query.url.options';
import { URLField } from './../../components/app/URLField';
import { DataField } from './../../components/app/DataField';
import { RootSelector } from './../../components/app/RootSelector';
import { InfinityQuery, EditorMode } from '../../types';

interface ScrapperProps {
  query: InfinityQuery;
  mode: EditorMode;
  onChange: (value: any) => void;
  onRunQuery: () => void;
}

export const URLEditor = (props: ScrapperProps) => {
  return (
    <>
      {['url', 'local-fs'].includes(props.query.source) ? (
        <div className="gf-form">
          <URLField {...props} />
          {props.query.source === 'url' && <URLOptionsEditor {...props} />}
        </div>
      ) : (
        <div className="gf-form">
          <DataField {...props} />
        </div>
      )}
      {['html', 'json', 'xml', 'graphql'].indexOf(props.query.type) > -1 && (
        <div className="gf-form">
          <RootSelector {...props} />
        </div>
      )}
      <QueryColumnsEditor {...props} />
    </>
  );
};
