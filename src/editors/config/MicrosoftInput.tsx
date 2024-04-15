import { onUpdateDatasourceSecureJsonDataOption, DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import {InlineFormLabel, Input, LegacyForms, RadioButtonGroup, Select} from '@grafana/ui';
import React from 'react';
import type {
    InfinityOptions,
    InfinitySecureOptions,
    MicrosoftAuthType, MicrosoftCloudType,
    MicrosoftProps
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
  { value: 'currentuser', label: 'User Identity' },
];

export const MicrosoftInputsEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const { secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as InfinitySecureOptions;
  let microsoft: MicrosoftProps = options?.jsonData?.microsoft || {};

  const onMicrosoftPropsChange = <T extends keyof MicrosoftProps, V extends MicrosoftProps[T]>(key: T, value: V) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, microsoft: { ...microsoft, [key]: value } } });
  };

  const onResetClientSecret = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: { ...options.secureJsonFields, microsoftClientSecret: false },
      secureJsonData: { ...options.secureJsonData, microsoftClientSecret: '' },
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
        <InlineFormLabel width={10}
            tooltip={
                <>
                    {`Managed Identity, Workload Identity and User Identity requires ambient credentials. `}
                    {`An Grafana admin has to explicit opt-in via `}
                    <b>grafana.ini</b>
                    {` to allow the authentication methods.`}
                    <br/>
                    <br/>
                    {`For more information, please refer to the `}
                    <a href="https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#azure" target="_blank" rel="noreferrer">Grafana documentation</a>.
                    <br/>
                    <br/>
                    {`Additionally, this plugin needs to be added to the grafana.ini setting `}
                    <a href="https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#forward_settings_to_plugins" target="_blank" rel="noreferrer">azure.forward_settings_to_plugins</a>.
                    <pre>
                    [azure]
                    {`\nforward_settings_to_plugins = grafana-azure-monitor-datasource, prometheus, grafana-azure-data-explorer-datasource, mssql, yesoreyeram-infinity-datasource`}
                    </pre>
                </>
            }
            {...{interactive: true }}>
          Authentication Type
        </InlineFormLabel>
        <RadioButtonGroup<MicrosoftAuthType>
            options={microsoftAuthTypes}
            onChange={(v) => onMicrosoftPropsChange('auth_type', v)}
            value={microsoft.auth_type || 'clientsecret'}></RadioButtonGroup>
      </div>
      {(microsoft.auth_type === 'clientsecret' || !microsoft?.auth_type) && (
        <>
          <div className="gf-form">
            <InlineFormLabel width={10}>Tenant ID</InlineFormLabel>
            <Input onChange={(v) => onMicrosoftPropsChange('tenant_id', v.currentTarget.value)} value={microsoft.tenant_id} width={60} placeholder={'Tenant ID'} />
          </div>
        </>
      )}
      {(microsoft.auth_type === 'clientsecret' || microsoft.auth_type === 'msi' || !microsoft?.auth_type) && (
          <div className="gf-form">
            <InlineFormLabel width={10}>Client ID</InlineFormLabel>
            <Input onChange={(v) => onMicrosoftPropsChange('client_id', v.currentTarget.value)} value={microsoft.client_id} width={60} placeholder={'Client ID'} />
          </div>
      )}
      {(microsoft.auth_type === 'clientsecret' || !microsoft?.auth_type) && (
        <>
          <div className="gf-form">
            <LegacyForms.SecretFormField
              labelWidth={10}
              inputWidth={60}
              required
              value={secureJsonData.microsoftClientSecret || ''}
              isConfigured={(secureJsonFields && secureJsonFields.microsoftClientSecret) as boolean}
              onReset={onResetClientSecret}
              onChange={onUpdateDatasourceSecureJsonDataOption(props, 'microsoftClientSecret')}
              label="Client Secret"
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
          onChange={(v) => onMicrosoftPropsChange('scopes', (v.currentTarget.value || '').split(','))}
          value={(microsoft.scopes || []).join(',')}
          width={60}
          placeholder={'Comma separated values of scopes'}
        />
      </div>
    </>
  );
};
