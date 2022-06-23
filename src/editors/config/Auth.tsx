import React from 'react';
import { DataSourcePluginOptionsEditorProps, onUpdateDatasourceSecureJsonDataOption, SelectableValue } from '@grafana/data';
import { InlineFormLabel, RadioButtonGroup, LegacyForms } from '@grafana/ui';
import { OAuthInputsEditor } from './OAuthInput';
import { AllowedHostsEditor } from './AllowedHosts';
import { InfinityOptions, InfinitySecureOptions, AuthType, APIKeyType } from '../../types';

const authTypes: Array<SelectableValue<AuthType>> = [
  { value: 'none', label: 'No Auth' },
  { value: 'basicAuth', label: 'Basic Authentication' },
  { value: 'apiKey', label: 'API Key' },
  { value: 'bearerToken', label: 'Bearer Token' },
  { value: 'digestAuth', label: 'Digest Auth' },
  { value: 'oauthPassThru', label: 'Forward OAuth' },
  { value: 'oauth2', label: 'OAuth2' },
];

export const AuthEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { FormField, SecretFormField } = LegacyForms;
  const { options, onOptionsChange } = props;
  const { secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as InfinitySecureOptions;
  const authType = props.options.basicAuth ? 'basicAuth' : props.options.jsonData.oauthPassThru ? 'oauthPassThru' : props.options.jsonData.auth_method || 'none';
  const onAuthTypeChange = (authMethod: AuthType) => {
    switch (authMethod) {
      case 'none':
        onOptionsChange({ ...options, basicAuth: false, jsonData: { ...options.jsonData, oauthPassThru: false, auth_method: 'none' } });
        break;
      case 'basicAuth':
        onOptionsChange({ ...options, basicAuth: true, jsonData: { ...options.jsonData, oauthPassThru: false, auth_method: 'basicAuth' } });
        break;
      case 'oauthPassThru':
        onOptionsChange({ ...options, basicAuth: false, jsonData: { ...options.jsonData, oauthPassThru: true, auth_method: 'oauthPassThru' } });
        break;
      case 'apiKey':
      case 'bearerToken':
      case 'digestAuth':
      default:
        onOptionsChange({ ...options, basicAuth: false, jsonData: { ...options.jsonData, oauthPassThru: false, auth_method: authMethod } });
        break;
    }
  };
  const onUserNameChange = (basicAuthUser: string) => {
    onOptionsChange({
      ...options,
      basicAuthUser,
    });
  };
  const onAPIKeyKeyChange = (apiKeyKey: string) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, apiKeyKey } });
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
        <RadioButtonGroup<AuthType> options={authTypes} value={authType} onChange={(e = 'none') => onAuthTypeChange(e!)}></RadioButtonGroup>
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
      {authType === 'oauth2' && <OAuthInputsEditor {...props} />}
      {authType !== 'none' && <AllowedHostsEditor options={options} onOptionsChange={onOptionsChange} />}
    </>
  );
};
