import React from 'react';
import { URLOptionsEditor } from './query.url.options';
import { URLField } from './../../components/URLField';
import { DataField } from './../../components/DataField';
import { RootSelector } from './../../components/RootSelector';
import { InfinityQuery, EditorMode } from '../../types';
import { isDataQuery } from 'app/utils';

interface ScrapperProps {
  query: InfinityQuery;
  mode: EditorMode;
  onChange: (value: any) => void;
  onRunQuery: () => void;
}

export const URLEditor = (props: ScrapperProps) => {
  const { query } = props;
  const canShowURLField = isDataQuery(query) && query.source === 'url';
  const canShowRootSelector = ['html', 'json', 'xml', 'graphql'].indexOf(props.query.type) > -1;
  return (
    <>
      {canShowURLField ? (
        <div className="gf-form">
          <URLField {...props} />
          <div style={{ marginLeft: '5px' }}>{isDataQuery(query) && query.source === 'url' && <URLOptionsEditor {...props} />}</div>
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
