import React from 'react';
import { DataSourcePluginOptionsEditorProps, onUpdateDatasourceSecureJsonDataOption, SelectableValue } from '@grafana/data';
import { InlineFormLabel, RadioButtonGroup, LegacyForms } from '@grafana/ui';
import { InfinityOptions, InfinitySecureOptions } from '../../types';

type AuthType = 'none' | 'basicAuth' | 'oauthPassThru';

const authTypes: Array<SelectableValue<AuthType>> = [
  { value: 'none', label: 'None' },
  { value: 'basicAuth', label: 'Basic Authentication' },
  // { value: 'oauthPassThru', label: 'Forward OAuth' },
];

export const AuthEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { FormField, SecretFormField } = LegacyForms;
  const { options, onOptionsChange } = props;
  const { secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as InfinitySecureOptions;
  const authType: AuthType = props.options.basicAuth ? 'basicAuth' : props.options.jsonData.oauthPassThru ? 'oauthPassThru' : 'none';
  const onAuthTypeChange = (a: AuthType) => {
    switch (a) {
      case 'none':
        onOptionsChange({ ...options, basicAuth: false, jsonData: { ...options.jsonData, oauthPassThru: false } });
        break;
      case 'basicAuth':
        onOptionsChange({ ...options, basicAuth: true, jsonData: { ...options.jsonData, oauthPassThru: false } });
        break;
      case 'oauthPassThru':
        onOptionsChange({ ...options, basicAuth: false, jsonData: { ...options.jsonData, oauthPassThru: true } });
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
        <InlineFormLabel width={8}>Auth Type</InlineFormLabel>
        <RadioButtonGroup<AuthType> options={authTypes} value={authType} onChange={(e) => onAuthTypeChange(e!)}></RadioButtonGroup>
      </div>
      {authType === 'basicAuth' && (
        <div className="gf-form">
          <FormField label="User Name" placeholder="username" labelWidth={8} value={props.options.basicAuthUser || ''} onChange={(e) => onUserNameChange(e.currentTarget.value)}></FormField>
          <SecretFormField
            labelWidth={12}
            inputWidth={10}
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
      )}
    </>
  );
};
