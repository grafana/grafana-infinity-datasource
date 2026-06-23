import React from 'react';
import { DataSourcePluginOptionsEditorProps, onUpdateDatasourceSecureJsonDataOption } from '@grafana/data';
import { InlineFormLabel, Input, LegacyForms, RadioButtonGroup } from '@grafana/ui';
import type { GitHubAuthType, InfinityOptions, InfinitySecureOptions } from '@/types';

const githubAuthTypes = [
  { value: 'token' as const, label: 'Token auth' },
  { value: 'app' as const, label: 'GitHub App auth' },
];

const defaultGitHubAPIURL = 'https://api.github.com';

export const GitHubAuthEditor = (
  props: DataSourcePluginOptionsEditorProps<InfinityOptions> & {
    onResetSecret: (key: keyof InfinitySecureOptions) => void;
  }
) => {
  const { options, onOptionsChange, onResetSecret } = props;
  const { SecretFormField } = LegacyForms;
  const github = options.jsonData.github || {};
  const githubAuthType = github.authType || 'token';
  const { secureJsonFields } = options;

  const onGitHubOptionsChange = (patch: Partial<NonNullable<InfinityOptions['github']>>) => {
    onOptionsChange({
      ...options,
      jsonData: { ...options.jsonData, github: { ...github, ...patch } },
    });
  };

  const onGitHubAuthTypeChange = (authType: GitHubAuthType = 'token') => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...options.jsonData,
        github: { ...github, authType },
      },
    });
  };

  return (
    <>
      <div className="gf-form">
        <InlineFormLabel tooltip="Choose the GitHub authentication mode">Auth mode</InlineFormLabel>
        <RadioButtonGroup<GitHubAuthType> options={githubAuthTypes} value={githubAuthType} onChange={(v) => onGitHubAuthTypeChange(v || 'token')} />
      </div>
      {githubAuthType === 'token' && (
        <div className="gf-form">
          <SecretFormField
            labelWidth={10}
            inputWidth={12}
            required
            value={(options.secureJsonData as InfinitySecureOptions)?.githubToken || ''}
            isConfigured={(secureJsonFields && secureJsonFields.githubToken) as boolean}
            onReset={() => onResetSecret('githubToken')}
            onChange={onUpdateDatasourceSecureJsonDataOption(props, 'githubToken')}
            label="GitHub token"
            aria-label="github token"
            placeholder="GitHub personal access token"
            tooltip="GitHub personal access token"
          />
        </div>
      )}
      {githubAuthType === 'app' && (
        <>
          <div className="gf-form">
            <InlineFormLabel tooltip="GitHub App ID">App ID</InlineFormLabel>
            <Input value={github.appId || ''} onChange={(e) => onGitHubOptionsChange({ appId: e.currentTarget.value })} placeholder="GitHub App ID" width={24} />
          </div>
          <div className="gf-form">
            <InlineFormLabel tooltip="GitHub App installation ID">Installation ID</InlineFormLabel>
            <Input
              value={github.installationId || ''}
              onChange={(e) => onGitHubOptionsChange({ installationId: e.currentTarget.value })}
              placeholder="GitHub App installation ID"
              width={24}
            />
          </div>
          <div className="gf-form">
            <InlineFormLabel tooltip="GitHub API base URL">GitHub API URL</InlineFormLabel>
            <Input value={github.apiUrl || defaultGitHubAPIURL} onChange={(e) => onGitHubOptionsChange({ apiUrl: e.currentTarget.value })} placeholder={defaultGitHubAPIURL} width={24} />
          </div>
          <div className="gf-form">
            <SecretFormField
              labelWidth={10}
              inputWidth={12}
              required
              value={(options.secureJsonData as InfinitySecureOptions)?.githubAppPrivateKey || ''}
              isConfigured={(secureJsonFields && secureJsonFields.githubAppPrivateKey) as boolean}
              onReset={() => onResetSecret('githubAppPrivateKey')}
              onChange={onUpdateDatasourceSecureJsonDataOption(props, 'githubAppPrivateKey')}
              label="Private key"
              aria-label="github app private key"
              placeholder="GitHub App private key PEM"
              tooltip="GitHub App private key PEM"
            />
          </div>
        </>
      )}
    </>
  );
};
