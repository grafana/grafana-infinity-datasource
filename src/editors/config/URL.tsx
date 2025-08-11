import { InlineLabel, Input, InlineSwitch, Stack, Badge } from '@grafana/ui';
import React, { useState } from 'react';
import { IGNORE_URL } from '@/constants';
import { Components } from '@/selectors';
import type { InfinityOptions } from '@/types';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';

export const URLEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const [url, setUrl] = useState(options.url || '');
  const onURLChange = () => {
    onOptionsChange({ ...options, url: url || IGNORE_URL });
  };
  return (
    <Stack>
      <InlineLabel tooltip="Base URL of the query. Leave blank if you want to handle it in the query editor." width={20}>
        Base URL
      </InlineLabel>
      <Input
        width={28}
        placeholder="Leave blank and you can specify full URL in the query."
        value={url === IGNORE_URL ? '' : url}
        onChange={(e) => setUrl(e.currentTarget.value || '')}
        onBlur={onURLChange}
      />
    </Stack>
  );
};

export const URLSettingsEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const { jsonData = {} } = options;
  const {
    IgnoreStatusCodeCheck: IgnoreStatusCodeCheckSelector,
    AllowDangerousHTTPMethods: AllowDangerousHTTPMethodsSelector,
    PathEncodedUrlsEnabled: PathEncodedUrlsEnabledSelector,
  } = Components.ConfigEditor.URL;
  return (
    <Stack direction={'column'}>
      <Stack>
        <InlineLabel width={36} tooltip={IgnoreStatusCodeCheckSelector.tooltip}>
          {IgnoreStatusCodeCheckSelector.label}
        </InlineLabel>
        <InlineSwitch value={jsonData.ignoreStatusCodeCheck || false} onChange={(e) => onOptionsChange({ ...options, jsonData: { ...jsonData, ignoreStatusCodeCheck: e.currentTarget.checked } })} />
      </Stack>
      <Stack>
        <InlineLabel width={36} tooltip={AllowDangerousHTTPMethodsSelector.tooltip}>
          {AllowDangerousHTTPMethodsSelector.label}
        </InlineLabel>
        <InlineSwitch
          value={jsonData.allowDangerousHTTPMethods || false}
          onChange={(e) => onOptionsChange({ ...options, jsonData: { ...jsonData, allowDangerousHTTPMethods: e.currentTarget.checked } })}
        />
      </Stack>
      <Stack>
        <InlineLabel width={36}>{PathEncodedUrlsEnabledSelector.label}</InlineLabel>
        <InlineSwitch value={jsonData.pathEncodedUrlsEnabled || false} onChange={(e) => onOptionsChange({ ...options, jsonData: { ...jsonData, pathEncodedUrlsEnabled: e.currentTarget.checked } })} />
        <Badge text="Experimental" color="orange" icon={'exclamation-triangle'} />
      </Stack>
    </Stack>
  );
};
