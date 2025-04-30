import { InlineLabel, Input, InlineSwitch, Stack, Badge } from '@grafana/ui';
import React, { useState } from 'react';
import { IGNORE_URL } from '@/constants';
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
  return (
    <Stack direction={'column'}>
      <Stack>
        <InlineLabel
          width={36}
          tooltip={`By default Infinity only allows GET and POST HTTP methods to reduce the risk of accidental and potentially destructive payloads. If you need PUT, PATCH or DELETE methods, make use of this setting with caution. Note: Infinity does not evaluate any permissions against the underlying API`}
        >
          Allow dangerous HTTP methods
        </InlineLabel>
        <InlineSwitch
          value={jsonData.allowDangerousHTTPMethods || false}
          onChange={(e) =>
            onOptionsChange({
              ...options,
              jsonData: { ...jsonData, allowDangerousHTTPMethods: e.currentTarget.checked },
            })
          }
        />
      </Stack>
      <Stack>
        <InlineLabel width={36}>Encode query parameters with %20</InlineLabel>
        <InlineSwitch value={jsonData.pathEncodedUrlsEnabled || false} onChange={(e) => onOptionsChange({ ...options, jsonData: { ...jsonData, pathEncodedUrlsEnabled: e.currentTarget.checked } })} />
        <Badge text="Experimental" color="orange" icon={'exclamation-triangle'} />
      </Stack>
    </Stack>
  );
};
