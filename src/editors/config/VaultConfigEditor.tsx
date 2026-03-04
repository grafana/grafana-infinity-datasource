import React from 'react';
import { Stack, InlineFormLabel, Input, SecretInput, RadioButtonGroup, Alert } from '@grafana/ui';
import { onUpdateDatasourceSecureJsonDataOption, DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import type { InfinityOptions, InfinitySecureOptions, VaultProviderType, VaultConfig } from '@/types';

const vaultProviderOptions: Array<SelectableValue<VaultProviderType>> = [
  { value: 'none', label: 'None (use local secrets)' },
  { value: 'azure-keyvault', label: 'Azure Key Vault' },
  // Future providers:
  // { value: 'hashicorp-vault', label: 'HashiCorp Vault' },
  // { value: 'aws-secrets-manager', label: 'AWS Secrets Manager' },
  // { value: 'gcp-secret-manager', label: 'GCP Secret Manager' },
];

const cacheTTLOptions: Array<SelectableValue<string>> = [
  { value: '', label: 'Disabled (fetch every time)' },
  { value: '1m', label: '1 minute' },
  { value: '5m', label: '5 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: '1h', label: '1 hour' },
];

export const VaultConfigEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const { secureJsonFields } = options;
  const vaultConfig: VaultConfig = options.jsonData.vaultConfig || { provider: 'none' };
  const provider = vaultConfig.provider || 'none';
  const azure = vaultConfig.azure || {};

  const updateVaultConfig = (partial: Partial<VaultConfig>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...options.jsonData,
        vaultConfig: { ...vaultConfig, ...partial },
      },
    });
  };

  const onResetSecret = (key: keyof InfinitySecureOptions) => {
    onOptionsChange({
      ...options,
      secureJsonFields: { ...options.secureJsonFields, [key]: false },
      secureJsonData: { ...options.secureJsonData, [key]: '' },
    });
  };

  const onProviderChange = (newProvider: VaultProviderType) => {
    updateVaultConfig({ provider: newProvider });
  };

  const onAzureFieldChange = (field: string, value: string) => {
    updateVaultConfig({
      azure: { ...azure, [field]: value },
    });
  };

  return (
    <div>
      <Alert title="Secrets Vault (Experimental)" severity="info">
        Configure an external secrets vault to retrieve plugin secrets instead of storing them locally in Grafana. When enabled, the plugin will fetch secrets exclusively from the vault at runtime.
        Datasource initialization will fail if the vault is unavailable or a required secret is missing.
      </Alert>

      <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Vault Provider</h4>
      <Stack direction="row" gap={0.25}>
        <InlineFormLabel width={12}>Provider</InlineFormLabel>
        <RadioButtonGroup<VaultProviderType> options={vaultProviderOptions} value={provider} onChange={onProviderChange} />
      </Stack>

      {provider !== 'none' && (
        <>
          <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Cache TTL</h4>
          <Stack direction="row" gap={0.25}>
            <InlineFormLabel width={12} tooltip="How long to cache secrets fetched from the vault before re-fetching. Reduces vault API calls but delays propagation of secret changes.">
              TTL
            </InlineFormLabel>
            <RadioButtonGroup<string> options={cacheTTLOptions} value={vaultConfig.cacheTTL || ''} onChange={(v) => updateVaultConfig({ cacheTTL: v })} />
          </Stack>
          {vaultConfig.cacheTTL && vaultConfig.cacheTTL !== '' && (
            <Alert title="" severity="info">
              Secrets will be cached for {vaultConfig.cacheTTL} after being fetched from the vault. Changes to secrets in the vault will take up to {vaultConfig.cacheTTL} to take effect.
            </Alert>
          )}
        </>
      )}

      {provider === 'azure-keyvault' && (
        <>
          <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Azure Key Vault Configuration</h4>

          <Stack direction="column" gap={1}>
            <Stack direction="row" gap={0.25}>
              <InlineFormLabel width={12} tooltip="The full URL of your Azure Key Vault, e.g. https://myvault.vault.azure.net/">
                Vault URL
              </InlineFormLabel>
              <Input width={40} placeholder="https://myvault.vault.azure.net/" value={azure.vaultUrl || ''} onChange={(e) => onAzureFieldChange('vaultUrl', e.currentTarget.value)} />
            </Stack>

            <Stack direction="row" gap={0.25}>
              <InlineFormLabel width={12} tooltip="Azure AD Tenant ID">
                Tenant ID
              </InlineFormLabel>
              <Input width={40} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={azure.tenantId || ''} onChange={(e) => onAzureFieldChange('tenantId', e.currentTarget.value)} />
            </Stack>

            <Stack direction="row" gap={0.25}>
              <InlineFormLabel width={12} tooltip="Azure AD Application (Client) ID">
                Client ID
              </InlineFormLabel>
              <Input width={40} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={azure.clientId || ''} onChange={(e) => onAzureFieldChange('clientId', e.currentTarget.value)} />
            </Stack>

            <Stack direction="row" gap={0.25}>
              <InlineFormLabel width={12} tooltip="Azure AD Application Client Secret">
                Client Secret
              </InlineFormLabel>
              <SecretInput
                width={40}
                placeholder="Client Secret"
                isConfigured={(secureJsonFields && secureJsonFields.vaultAzureClientSecret) as boolean}
                onChange={onUpdateDatasourceSecureJsonDataOption(props, 'vaultAzureClientSecret')}
                onReset={() => onResetSecret('vaultAzureClientSecret')}
              />
            </Stack>
          </Stack>
        </>
      )}
    </div>
  );
};
