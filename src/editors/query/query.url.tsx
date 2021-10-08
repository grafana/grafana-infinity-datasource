import React from 'react';
import { URLOptionsEditor } from './query.url.options';
import { URLField } from './../../components/URLField';
import { DataField } from './../../components/DataField';
import { RootSelector } from './../../components/RootSelector';
import { InfinityQuery, EditorMode } from '../../types';

interface ScrapperProps {
  query: InfinityQuery;
  mode: EditorMode;
  onChange: (value: any) => void;
  onRunQuery: () => void;
}

export const URLEditor = (props: ScrapperProps) => {
  const canShowURLField = ['url', 'local-fs'].includes(props.query.source);
  const canShowRootSelector = ['html', 'json', 'xml', 'graphql'].indexOf(props.query.type) > -1;
  return (
    <>
      {canShowURLField ? (
        <div className="gf-form">
          <URLField {...props} />
          {props.query.source === 'url' && <URLOptionsEditor {...props} />}
        </div>
      ) : (
        <div className="gf-form">
          <DataField {...props} />
        </div>
      )}
      {canShowRootSelector && (
        <div className="gf-form">
          <RootSelector {...props} />
        </div>
      )}
    </>
  );
};
