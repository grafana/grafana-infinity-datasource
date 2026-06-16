import { InlineFormLabel, TagsInput } from '@grafana/ui';
import React from 'react';
import type { InfinityOptions } from '@/types';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';

type KeepCookiesEditorProps = {} & DataSourcePluginOptionsEditorProps<InfinityOptions>;

export const KeepCookiesEditor = ({ options, onOptionsChange }: KeepCookiesEditorProps) => {
  return (
    <>
      <p>Select browser cookie keys to forward to the endpoint. If empty, no cookies will be forwarded. Only the specified cookies will be forwarded.</p>
      <div className="gf-form">
        <InlineFormLabel width={10} tooltip="List of cookies to forward. Enter the cookie keys. ex: access_token or grafana_session_expiry">
          Include cookies
        </InlineFormLabel>
        <TagsInput
          placeholder="Enter the cookie names (enter key to add)"
          tags={options.jsonData.keepCookies || []}
          onChange={(keepCookies = []) => onOptionsChange({ ...options, jsonData: { ...options.jsonData, keepCookies } })}
        />
      </div>
    </>
  );
};
