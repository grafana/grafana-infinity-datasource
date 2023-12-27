import React from 'react';
import { InlineLabel, InlineSwitch, Input } from '@grafana/ui';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import type { InfinityOptions } from '../../types';

export const CustomHealthCheckEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const { jsonData = {} } = options;
  return (
    <>
      <div className="gf-form">
        <InlineLabel width={36}>Enable custom health check</InlineLabel>
        <InlineSwitch
          value={jsonData.customHealthCheckEnabled || false}
          onChange={(e) => onOptionsChange({ ...options, jsonData: { ...jsonData, customHealthCheckEnabled: e.currentTarget.checked } })}
        />
      </div>
      {jsonData.customHealthCheckEnabled && (
        <>
          <div className="gf-form">
            <InlineLabel width={36}>Health check URL</InlineLabel>
            <Input
              value={jsonData.customHealthCheckUrl || ''}
              placeholder="https://jsonplaceholder.typicode.com/users"
              onChange={(e) => onOptionsChange({ ...options, jsonData: { ...jsonData, customHealthCheckUrl: e.currentTarget.value || '' } })}
            />
          </div>
        </>
      )}
    </>
  );
};
