import { onUpdateDatasourceSecureJsonDataOption, DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import {InlineFormLabel, Input, LegacyForms, RadioButtonGroup, Select} from '@grafana/ui';
import React from 'react';
import type {
    InfinityOptions,
    InfinitySecureOptions,
    MicrosoftAuthType, MicrosoftCloudType,
    MicrosoftProps,
    OAuth2Props
} from './../../types';

const microsoftCloudTypes: Array<SelectableValue<MicrosoftCloudType>> = [
  { value: 'AzureCloud', label: 'Azure' },
    { value: 'AzureUSGovernment', label: 'Azure US Government' },
  { value: 'AzureChinaCloud', label: 'Azure China Cloud' },
];

const microsoftAuthTypes: Array<SelectableValue<MicrosoftAuthType>> = [
  { value: 'clientsecret', label: 'Client Secret' },
  { value: 'msi', label: 'Managed Identity' },
  { value: 'workloadidentity', label: 'Workload Identity' },
];

export const MicrosoftInputsEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const { secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as InfinitySecureOptions;
  let oauth2: OAuth2Props = options?.jsonData?.oauth2 || {};
  let microsoft: MicrosoftProps = options?.jsonData?.microsoft || {};

  const onMicrosoftPropsChange = <T extends keyof MicrosoftProps, V extends MicrosoftProps[T]>(key: T, value: V) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, microsoft: { ...microsoft, [key]: value } } });
  };

  const onOAuth2PropsChange = <T extends keyof OAuth2Props, V extends OAuth2Props[T]>(key: T, value: V) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, oauth2: { ...oauth2, [key]: value } } });
  };
  const onResetClientSecret = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: { ...options.secureJsonFields, oauth2ClientSecret: false },
      secureJsonData: { ...options.secureJsonData, oauth2ClientSecret: '' },
    });
  };
  return (
    <>
      <div className="gf-form">
        <InlineFormLabel width={10}>
            Cloud
        </InlineFormLabel>
        <Select value={microsoft.cloud || 'AzureCloud'}
                width={60}
                options={microsoftCloudTypes}
                onChange={(e) => onMicrosoftPropsChange('cloud', e?.value!)}
                isClearable={false} menuShouldPortal={true}></Select>
      </div>
      <div className="gf-form">
        <InlineFormLabel width={10} tooltip="If empty, the AZURE_TENANT_ID environemnt variables will be used">Tenant ID</InlineFormLabel>
        <Input onChange={(v) => onMicrosoftPropsChange('tenant_id', v.currentTarget.value)} value={microsoft.tenant_id} width={60} placeholder={'Tenant ID'} />
      </div>
      <div className="gf-form">
        <InlineFormLabel width={10} tooltip="Authentication Type">
          Authentication Type
        </InlineFormLabel>
        <RadioButtonGroup<MicrosoftAuthType>
            options={microsoftAuthTypes}
            onChange={(v) => onMicrosoftPropsChange('auth_type', v)}
            value={microsoft.auth_type || 'clientsecret'}></RadioButtonGroup>
      </div>
      <div className="gf-form">
        <InlineFormLabel width={10} tooltip="If empty, the AZURE_CLIENT_ID environemnt variables will be used">Client ID</InlineFormLabel>
        <Input onChange={(v) => onOAuth2PropsChange('client_id', v.currentTarget.value)} value={oauth2.client_id} width={60} placeholder={'Client ID'} />
      </div>
      {(microsoft.auth_type === 'clientsecret' || !microsoft?.auth_type) && (
        <>
          <div className="gf-form">
            <LegacyForms.SecretFormField
              labelWidth={10}
              inputWidth={60}
              required
              value={secureJsonData.oauth2ClientSecret || ''}
              isConfigured={(secureJsonFields && secureJsonFields.oauth2ClientSecret) as boolean}
              onReset={onResetClientSecret}
              onChange={onUpdateDatasourceSecureJsonDataOption(props, 'oauth2ClientSecret')}
              label="Client Secret"
              tooltip="If empty, the AZURE_CLIENT_SECRET environemnt variables will be used"
              aria-label="client secret"
              placeholder="Client secret"
            />
          </div>
        </>
      )}
      <div className="gf-form">
        <InlineFormLabel
            width={10}
            tooltip={
                <>
                    {`For accessing the Microsoft Azure Resource Manager, use https://management.azure.com/.default`}
                    <br/>
                    <br/>
                    {`For accessing the Microsoft Graph API, use: https://graph.microsoft.com/.default`}
                    <br/>
                    <br/>
                    {`For accessing other API, use: https://[hostname]/.default`}
                </>
            }
            {...{interactive: true }}
        >Scopes</InlineFormLabel>
        <Input
          onChange={(v) => onOAuth2PropsChange('scopes', (v.currentTarget.value || '').split(','))}
          value={(oauth2.scopes || []).join(',')}
          width={60}
          placeholder={'Comma separated values of scopes'}
        />
      </div>
    </>
  );
};
