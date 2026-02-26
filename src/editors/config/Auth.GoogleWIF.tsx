import React from 'react';
import { Stack, InlineLabel, SecretTextArea } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import type { InfinityOptions, InfinitySecureOptions } from '@/types';

export const GoogleWIFAuthEditor = (
  props: DataSourcePluginOptionsEditorProps<InfinityOptions> & {
    onResetSecret: (key: keyof InfinitySecureOptions) => void;
  }
) => {
  const { options, onOptionsChange, onResetSecret } = props;
  const { secureJsonFields } = options;
  if (options.jsonData.auth_method !== 'googleWIF') {
    return <></>;
  }
  const onScopesChange = (scopes: string) => {
    const scopeList = scopes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, googleWIF: { ...options.jsonData?.googleWIF, scopes: scopeList } } });
  };
  const onCredentialsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: { ...options.secureJsonData, googleWIFCredentials: e.currentTarget.value },
    });
  };
  return (
    <Stack direction={'column'}>
      <Stack>
        <InlineLabel
          width={24}
          tooltip="Paste the Google Workload Identity Federation external_account credentials JSON here. This is the credentials file downloaded from Google Cloud Console for your Workload Identity Pool provider."
        >
          Credentials JSON
        </InlineLabel>
        <SecretTextArea
          rows={6}
          cols={50}
          aria-label="google wif credentials json"
          placeholder={`{\n  "type": "external_account",\n  "audience": "//iam.googleapis.com/...",\n  ...\n}`}
          isConfigured={(secureJsonFields && secureJsonFields.googleWIFCredentials) as boolean}
          onChange={onCredentialsChange}
          onReset={() => onResetSecret('googleWIFCredentials')}
        />
      </Stack>
      <Stack>
        <InlineLabel width={24} tooltip="Comma-separated list of OAuth2 scopes to request, e.g. https://www.googleapis.com/auth/cloud-platform">
          Scopes
        </InlineLabel>
        <textarea
          rows={2}
          cols={50}
          aria-label="google wif scopes"
          placeholder="https://www.googleapis.com/auth/cloud-platform"
          value={(options.jsonData?.googleWIF?.scopes || []).join(', ')}
          onChange={(e) => onScopesChange(e.currentTarget.value)}
        />
      </Stack>
    </Stack>
  );
};
