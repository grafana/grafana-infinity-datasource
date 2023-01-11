import { onUpdateDatasourceSecureJsonDataOption } from '@grafana/data';
import { InlineFormLabel, LegacyForms, RadioButtonGroup, Select } from '@grafana/ui';
import React, { useState } from 'react';
import { AllowedHostsEditor } from './AllowedHosts';
import { OAuthInputsEditor } from './OAuthInput';
import { OthersAuthentication } from './OtherAuthProviders';
import { AWSRegions } from './../../constants';
import type { APIKeyType, AuthType, InfinityOptions, InfinitySecureOptions } from './../../types';
import type { DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data/types';

const authTypes: Array<SelectableValue<AuthType | 'others'>> = [
  { value: 'none', label: 'No Auth' },
  { value: 'basicAuth', label: 'Basic Authentication' },
  { value: 'apiKey', label: 'API Key' },
  { value: 'bearerToken', label: 'Bearer Token' },
  { value: 'digestAuth', label: 'Digest Auth' },
  { value: 'oauthPassThru', label: 'Forward OAuth' },
  { value: 'oauth2', label: 'OAuth2' },
  { value: 'aws', label: 'AWS' },
  { value: 'others', label: 'Other Auth Providers' },
];

export const AuthEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { FormField, SecretFormField } = LegacyForms;
  const { options, onOptionsChange } = props;
  const { secureJsonFields } = options;
  const [othersOpen, setOthersOpen] = useState(false);
  const secureJsonData = (options.secureJsonData || {}) as InfinitySecureOptions;
  const authType = props.options.basicAuth ? 'basicAuth' : props.options.jsonData.oauthPassThru ? 'oauthPassThru' : props.options.jsonData.auth_method || 'none';
  const onAuthTypeChange = (authMethod: AuthType = 'none') => {
    switch (authMethod) {
      case 'basicAuth':
        onOptionsChange({ ...options, basicAuth: true, jsonData: { ...options.jsonData, oauthPassThru: false, auth_method: 'basicAuth' } });
        break;
      case 'oauthPassThru':
        onOptionsChange({ ...options, basicAuth: false, jsonData: { ...options.jsonData, oauthPassThru: true, auth_method: 'oauthPassThru' } });
        break;
      case 'digestAuth':
      case 'apiKey':
      case 'bearerToken':
      case 'aws':
      case 'oauth2':
      case 'none':
      default:
        onOptionsChange({ ...options, basicAuth: false, jsonData: { ...options.jsonData, oauthPassThru: false, auth_method: authMethod } });
    }
  };
  const onUserNameChange = (basicAuthUser: string) => {
    onOptionsChange({ ...options, basicAuthUser });
  };
  const onAPIKeyKeyChange = (apiKeyKey: string) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, apiKeyKey } });
  };
  const onAwsRegionChange = (region: string) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, aws: { ...options.jsonData?.aws, region } } });
  };
  const onAwsServiceChange = (service: string) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, aws: { ...options.jsonData?.aws, service } } });
  };
  const onResetSecret = (key: keyof InfinitySecureOptions) => {
    onOptionsChange({
      ...options,
      secureJsonFields: { ...options.secureJsonFields, [key]: false },
      secureJsonData: { ...options.secureJsonData, [key]: '' },
    });
  };
  return (
    <>
      <div className="gf-form">
        <InlineFormLabel width={10}>Auth Type</InlineFormLabel>
        <RadioButtonGroup<AuthType | 'others'>
          options={authTypes}
          value={authType}
          onChange={(e = 'none') => {
            if (e !== 'others') {
              onAuthTypeChange(e!);
            }
            if (e === 'others') {
              setOthersOpen(true);
            }
          }}
        ></RadioButtonGroup>
        <OthersAuthentication options={options} isOpen={othersOpen} onClose={() => setOthersOpen(false)} onOptionsChange={onOptionsChange} />
      </div>
      {(authType === 'basicAuth' || authType === 'digestAuth') && (
        <>
          <div className="gf-form">
            <FormField label="User Name" placeholder="username" labelWidth={10} value={props.options.basicAuthUser || ''} onChange={(e) => onUserNameChange(e.currentTarget.value)}></FormField>
          </div>
          <div className="gf-form">
            <SecretFormField
              labelWidth={10}
              inputWidth={12}
              required
              value={secureJsonData.basicAuthPassword || ''}
              isConfigured={(secureJsonFields && secureJsonFields.basicAuthPassword) as boolean}
              onReset={() => onResetSecret('basicAuthPassword')}
              onChange={onUpdateDatasourceSecureJsonDataOption(props, 'basicAuthPassword')}
              label="Password"
              aria-label="password"
              placeholder="password"
              tooltip="password"
            />
          </div>
        </>
      )}
      {authType === 'bearerToken' && (
        <>
          <div className="gf-form">
            <SecretFormField
              labelWidth={10}
              inputWidth={12}
              required
              value={secureJsonData.bearerToken || ''}
              isConfigured={(secureJsonFields && secureJsonFields.bearerToken) as boolean}
              onReset={() => onResetSecret('bearerToken')}
              onChange={onUpdateDatasourceSecureJsonDataOption(props, 'bearerToken')}
              label="Bearer token"
              aria-label="bearer token"
              placeholder="bearer token"
              tooltip="bearer token"
            />
          </div>
        </>
      )}
      {authType === 'apiKey' && (
        <>
          <div className="gf-form">
            <FormField
              label="Key"
              placeholder="api key key"
              tooltip="api key key"
              labelWidth={10}
              value={props.options.jsonData.apiKeyKey || ''}
              onChange={(e) => onAPIKeyKeyChange(e.currentTarget.value)}
            ></FormField>
          </div>
          <div className="gf-form">
            <SecretFormField
              labelWidth={10}
              inputWidth={12}
              required
              value={secureJsonData.apiKeyValue || ''}
              isConfigured={(secureJsonFields && secureJsonFields.apiKeyValue) as boolean}
              onReset={() => onResetSecret('apiKeyValue')}
              onChange={onUpdateDatasourceSecureJsonDataOption(props, 'apiKeyValue')}
              label="Value"
              aria-label="api key value"
              placeholder="api key value"
              tooltip="api key value"
            />
          </div>
          <div className="gf-form">
            <InlineFormLabel tooltip="Add api key to header/query params.">Add to</InlineFormLabel>
            <RadioButtonGroup<APIKeyType>
              options={[
                { value: 'header', label: 'Header' },
                { value: 'query', label: 'Query Param' },
              ]}
              value={options.jsonData.apiKeyType || 'header'}
              onChange={(apiKeyType = 'header') => onOptionsChange({ ...options, jsonData: { ...options.jsonData, apiKeyType } })}
            />
          </div>
        </>
      )}
      {authType === 'aws' && (
        <>
          <div className="gf-form">
            <InlineFormLabel>Region</InlineFormLabel>
            <Select width={24} options={AWSRegions} placeholder="us-east-2" onChange={(e) => onAwsRegionChange(e.value!)} value={props.options.jsonData?.aws?.region || ''} />
          </div>
          <div className="gf-form">
            <FormField
              label="Service"
              placeholder="monitoring"
              labelWidth={10}
              value={props.options.jsonData?.aws?.service || ''}
              onChange={(e) => onAwsServiceChange(e.currentTarget.value)}
            ></FormField>
          </div>
          <div className="gf-form">
            <SecretFormField
              labelWidth={10}
              inputWidth={12}
              required
              value={secureJsonData.awsAccessKey || ''}
              isConfigured={(secureJsonFields && secureJsonFields.awsAccessKey) as boolean}
              onReset={() => onResetSecret('awsAccessKey')}
              onChange={onUpdateDatasourceSecureJsonDataOption(props, 'awsAccessKey')}
              label="Access Key"
              aria-label="aws access key"
              placeholder="aws access key"
              tooltip="aws access key"
            />
          </div>
          <div className="gf-form">
            <SecretFormField
              labelWidth={10}
              inputWidth={12}
              required
              value={secureJsonData.awsSecretKey || ''}
              isConfigured={(secureJsonFields && secureJsonFields.awsSecretKey) as boolean}
              onReset={() => onResetSecret('awsSecretKey')}
              onChange={onUpdateDatasourceSecureJsonDataOption(props, 'awsSecretKey')}
              label="Secret Key"
              aria-label="aws secret key"
              placeholder="aws secret key"
              tooltip="aws secret key"
            />
          </div>
        </>
      )}
      {authType === 'oauth2' && <OAuthInputsEditor {...props} />}
      {authType !== 'none' && <AllowedHostsEditor options={options} onOptionsChange={onOptionsChange} />}
    </>
  );
};
