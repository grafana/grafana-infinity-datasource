import { InlineFormLabel, TagsInput } from '@grafana/ui';
import React from 'react';
import type { InfinityOptions } from './../../types';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';

type AllowedHostsEditorProps = {} & DataSourcePluginOptionsEditorProps<InfinityOptions>;

export const AllowedHostsEditor = ({ options, onOptionsChange }: AllowedHostsEditorProps) => {
  if (options?.jsonData?.auth_method === 'azureBlob') {
    return <></>;
  }
  return (
    <>
      <p>For the enhanced security, enter list of allowed hosts in this section. The host URLs can include path and the URLs are case sensitive</p>
      <div className="gf-form">
        <InlineFormLabel width={10} tooltip="List of allowed host names. Enter the base URL names. ex: https://foo.com">
          Allowed hosts
        </InlineFormLabel>
        <TagsInput
          placeholder="Enter the host names with domain prefix (enter key to add)"
          tags={options.jsonData.allowedHosts || []}
          onChange={(allowedHosts = []) => onOptionsChange({ ...options, jsonData: { ...options.jsonData, allowedHosts } })}
        />
      </div>
    </>
  );
};
