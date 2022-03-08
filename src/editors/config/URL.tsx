import React, { useState } from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { InlineFormLabel, LegacyForms, TagsInput } from '@grafana/ui';
import { InfinityOptions, IGNORE_URL } from '../../types';

export const URLEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { FormField } = LegacyForms;
  const { options, onOptionsChange } = props;
  const [url, setUrl] = useState(options.url || '');
  const onURLChange = () => {
    onOptionsChange({ ...options, url: url || IGNORE_URL });
  };
  return (
    <>
      <div className="gf-form">
        <FormField
          label="Base URL"
          labelWidth={11}
          tooltip="Base URL of the query. Leave blank if you want to handle it in the query editor."
          placeholder="Leave blank and you can specify full URL in the query."
          value={url === IGNORE_URL ? '' : url}
          onChange={(e) => setUrl(e.currentTarget.value || '')}
          onBlur={onURLChange}
        />
        <div className="gf-form-label text-info">&lt;--- Deprecated field. Use full URL in the query editor instead.</div>
      </div>
      <div className="gf-form">
        <InlineFormLabel width={11} tooltip="List of allowed host names. Leaving empty will allow all hosts. Enter the full url. ex: https://foo.com">
          Allowed hosts
        </InlineFormLabel>
        <TagsInput tags={options.jsonData.allowedHosts || []} onChange={(allowedHosts = []) => onOptionsChange({ ...options, jsonData: { ...options.jsonData, allowedHosts } })}></TagsInput>
      </div>
    </>
  );
};
