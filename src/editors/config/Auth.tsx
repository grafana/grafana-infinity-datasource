import React from 'react';
import { DataSourcePluginOptionsEditorProps, onUpdateDatasourceSecureJsonDataOption, SelectableValue } from '@grafana/data';
import { InlineFormLabel, RadioButtonGroup, LegacyForms } from '@grafana/ui';
import { OAuthInputsEditor } from './OAuthInput';
import { InfinityOptions, InfinitySecureOptions, AuthType } from '../../types';

const authTypes: Array<SelectableValue<AuthType>> = [
  { value: 'none', label: 'None' },
  { value: 'basicAuth', label: 'Basic Authentication' },
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
      case 'oauthPassThru':
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
  const onResetPassword = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        basicAuthPassword: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        basicAuthPassword: '',
      },
    });
  };
  return (
    <>
      <div className="gf-form">
        <InlineFormLabel width={10}>Auth Type</InlineFormLabel>
        <RadioButtonGroup<AuthType> options={authTypes} value={authType} onChange={(e) => onAuthTypeChange(e!)}></RadioButtonGroup>
      </div>
      {authType === 'basicAuth' && (
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
              onReset={onResetPassword}
              onChange={onUpdateDatasourceSecureJsonDataOption(props, 'basicAuthPassword')}
              label="Password"
              aria-label="password"
              placeholder="password"
              tooltip="password"
            />
          </div>
        </>
      )}
      {authType === 'oauth2' && <OAuthInputsEditor {...props} />}
    </>
  );
};
