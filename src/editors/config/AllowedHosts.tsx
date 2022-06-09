import React from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { InlineFormLabel, TagsInput } from '@grafana/ui';
import { InfinityOptions } from '../../types';

type AllowedHostsEditorProps = {} & DataSourcePluginOptionsEditorProps<InfinityOptions>;

export const AllowedHostsEditor = ({ options, onOptionsChange }: AllowedHostsEditorProps) => {
  return (
    <div className="gf-form">
      <InlineFormLabel width={10} tooltip="List of allowed host names. Enter the base URL names. ex: https://foo.com">
        Allowed hosts
      </InlineFormLabel>
      <TagsInput tags={options.jsonData.allowedHosts || []} onChange={(allowedHosts = []) => onOptionsChange({ ...options, jsonData: { ...options.jsonData, allowedHosts } })}></TagsInput>
    </div>
  );
};
