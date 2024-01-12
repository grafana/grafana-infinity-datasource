import React from 'react';
import { InlineFormLabel, InlineSwitch, RadioButtonGroup, Input, Alert } from '@grafana/ui';
import type { InfinityOptions } from './../../types';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';

export const OpenAPIEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const { jsonData = {} } = options;
  return (
    <>
      <div className="gf-form">
        <InlineFormLabel>Enable Open API</InlineFormLabel>
        <InlineSwitch value={jsonData.enableOpenApi || false} onChange={(e) => onOptionsChange({ ...options, jsonData: { ...jsonData, enableOpenApi: e.currentTarget.checked } })} />
      </div>
      {jsonData.enableOpenApi && (
        <>
          <div className="gf-form">
            <Alert title="Usage warning" severity="info">
              This feature is under development.
            </Alert>
          </div>
          <div className="gf-form">
            <InlineFormLabel>Open API Version</InlineFormLabel>
            <RadioButtonGroup value={jsonData?.openApiVersion || 'open-api-2.0'} options={[{ value: 'open-api-2.0', label: 'Open API 2.0' }]} />
          </div>
          <div className="gf-form">
            <InlineFormLabel>Open API URL</InlineFormLabel>
            <Input value={jsonData.openApiUrl} onChange={(e) => onOptionsChange({ ...options, jsonData: { ...jsonData, openApiUrl: e.currentTarget.value } })} />
          </div>
          <div className="gf-form">
            <InlineFormLabel>Base URL</InlineFormLabel>
            <Input value={jsonData.openAPIBaseURL} onChange={(e) => onOptionsChange({ ...options, jsonData: { ...jsonData, openAPIBaseURL: e.currentTarget.value } })} />
          </div>
        </>
      )}
    </>
  );
};
