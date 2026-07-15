import React from 'react';
import { InlineFormLabel } from '@grafana/ui';
import { StringArrayInput } from '@/components/extended/StringArrayInput';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import type { InfinityOptions } from '@/types';

type AllowedHostsEditorProps = DataSourcePluginOptionsEditorProps<InfinityOptions> & {
  labelWidth?: number;
};

export const AllowedHostsEditor = ({ options, onOptionsChange, labelWidth = 10 }: AllowedHostsEditorProps) => {
  if (options?.jsonData?.auth_method === 'azureBlob') {
    return <></>;
  }
  return (
    <div className="gf-form">
      <InlineFormLabel width={labelWidth} tooltip="List of allowed host names. Enter the base URL names. ex: https://example.com">
        Allowed hosts
      </InlineFormLabel>
      <StringArrayInput
        placeholder="https://example.com"
        value={options.jsonData.allowedHosts || ['']}
        onChange={(allowedHosts) => onOptionsChange({ ...options, jsonData: { ...options.jsonData, allowedHosts } })}
        addButtonText="Add"
      />
    </div>
  );
};
