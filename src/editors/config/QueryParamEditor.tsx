import React from 'react';
import { InlineLabel, InlineSwitch } from '@grafana/ui';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import type { InfinityOptions } from '../../types';

export const QueryParamEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const { jsonData = {} } = options;
  return (
    <>
      <div className="gf-form">
        <InlineLabel width={36}>Encode query parameters with %20</InlineLabel>
        <InlineSwitch value={jsonData.pathEncodedUrlsEnabled || false} onChange={(e) => onOptionsChange({ ...options, jsonData: { ...jsonData, pathEncodedUrlsEnabled: e.currentTarget.checked } })} />
      </div>
    </>
  );
};
