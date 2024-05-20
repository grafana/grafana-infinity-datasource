import { onUpdateDatasourceSecureJsonDataOption, DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import {InlineFormLabel, Input, LegacyForms, RadioButtonGroup, Select} from '@grafana/ui';
import React from 'react';
import type {
    InfinityOptions,
    InfinitySecureOptions,
    AzureAuthType, AzureCloudType,
    AzureProps
} from './../../types';

const azureCloudTypes: Array<SelectableValue<AzureCloudType>> = [
  { value: 'AzureCloud', label: 'Azure' },
  { value: 'AzureUSGovernment', label: 'Azure US Government' },
  { value: 'AzureChinaCloud', label: 'Azure China Cloud' },
];

const azureAuthTypes: Array<SelectableValue<AzureAuthType>> = [
  { value: 'clientsecret', label: 'Client Secret' },
  { value: 'msi', label: 'Managed Identity' },
  { value: 'workloadidentity', label: 'Workload Identity' },
];

export const AzureInputsEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const { secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as InfinitySecureOptions;
  let azure: AzureProps = options?.jsonData?.azureCredentials || {};

  const onAzurePropsChange = <T extends keyof AzureProps, V extends AzureProps[T]>(key: T, value: V) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, azureCredentials: { ...azure, [key]: value } } });
  };

  const onResetClientSecret = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: { ...options.secureJsonFields, azureClientSecret: false },
      secureJsonData: { ...options.secureJsonData, azureClientSecret: '' },
    });
  };
  return (
    <>
      <div className="gf-form">
        <InlineFormLabel width={10}>
            Cloud
        </InlineFormLabel>
        <Select value={azure.azureCloud || 'AzureCloud'}
                width={60}
                options={azureCloudTypes}
                onChange={(e) => onAzurePropsChange('azureCloud', e?.value!)}
                isClearable={false} menuShouldPortal={true}></Select>
      </div>
      <div className="gf-form">
        <InlineFormLabel width={10}
            tooltip={
                <>
                    {`Managed Identity, Workload Identity requires ambient credentials. `}
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
        <RadioButtonGroup<AzureAuthType>
            options={azureAuthTypes}
            onChange={(v) => onAzurePropsChange('authType', v)}
            value={azure.authType || 'clientsecret'}></RadioButtonGroup>
      </div>
      {(azure.authType !== 'msi' || !azure?.authType) && (
        <>
          <div className="gf-form">
            <InlineFormLabel width={10}>Tenant ID</InlineFormLabel>
            <Input onChange={(v) => onAzurePropsChange('tenantId', v.currentTarget.value)} value={azure.tenantId} width={60} placeholder={'Tenant ID'} />
          </div>
        </>
      )}
      {(azure.authType !== 'msi' || !azure?.authType) && (
          <div className="gf-form">
            <InlineFormLabel width={10}>Client ID</InlineFormLabel>
            <Input onChange={(v) => onAzurePropsChange('clientId', v.currentTarget.value)} value={azure.clientId} width={60} placeholder={'Client ID'} />
          </div>
      )}
      {(azure.authType === 'clientsecret' || !azure?.authType) && (
        <>
          <div className="gf-form">
            <LegacyForms.SecretFormField
              labelWidth={10}
              inputWidth={60}
              required
              value={secureJsonData.azureClientSecret || ''}
              isConfigured={(secureJsonFields && secureJsonFields.azureClientSecret) as boolean}
              onReset={onResetClientSecret}
              onChange={onUpdateDatasourceSecureJsonDataOption(props, 'azureClientSecret')}
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
          onChange={(v) => onAzurePropsChange('scopes', (v.currentTarget.value || '').split(','))}
          value={(azure.scopes || []).join(',')}
          width={60}
          placeholder={'Comma separated values of scopes'}
        />
      </div>
    </>
  );
};
