import React from 'react';
import { Stack, InlineLabel, Input, SecretInput, Combobox, type ComboboxOption } from '@grafana/ui';
import { onUpdateDatasourceSecureJsonDataOption, DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { Components } from '@/selectors';
import { AzureBlobRegions, AzureBlobCloudTypeDefault } from '@/constants';
import type { InfinityOptions, InfinitySecureOptions, AzureBlobCloudType } from '@/types';

export const AzureBlobAuthEditor = (
  props: DataSourcePluginOptionsEditorProps<InfinityOptions> & {
    onResetSecret: (key: keyof InfinitySecureOptions) => void;
  }
) => {
  const { options, onOptionsChange, onResetSecret } = props;
  const { secureJsonFields } = options;
  const { Region: RegionSelector, StorageAccountName: StorageAccountNameSelector, StorageAccountKey: StorageAccountKeySelector } = Components.ConfigEditor.Auth.AzureBlob;
  const onAzureBlobUrlChange = (azureBlobCloudType = AzureBlobCloudTypeDefault) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, azureBlobCloudType } });
  };
  const onAzureBlobAccountChange = (azureBlobAccountName: string) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, azureBlobAccountName } });
  };
  if (options.jsonData.auth_method !== 'azureBlob') {
    return <></>;
  }
  return (
    <Stack direction={'column'}>
      <Stack>
        <InlineLabel width={24} tooltip={RegionSelector.tooltip}>
          {RegionSelector.label}
        </InlineLabel>
        <Combobox
          width={24}
          aria-label={RegionSelector.ariaLabel}
          options={AzureBlobRegions as Array<ComboboxOption<string>>}
          onChange={(e) => onAzureBlobUrlChange(e.value as AzureBlobCloudType)}
          value={props.options.jsonData?.azureBlobCloudType || AzureBlobCloudTypeDefault}
        />
      </Stack>
      <Stack>
        <InlineLabel width={24} tooltip={StorageAccountNameSelector.tooltip}>
          {StorageAccountNameSelector.label}
        </InlineLabel>
        <Input
          required
          role="input"
          aria-label={StorageAccountNameSelector.ariaLabel}
          placeholder={StorageAccountNameSelector.placeholder}
          width={24}
          value={props.options.jsonData?.azureBlobAccountName || ''}
          onChange={(e) => onAzureBlobAccountChange(e.currentTarget.value)}
        ></Input>
      </Stack>
      <Stack>
        <InlineLabel width={24} tooltip={StorageAccountKeySelector.tooltip}>
          {StorageAccountKeySelector.label}
        </InlineLabel>
        <SecretInput
          required
          role="input"
          aria-label={StorageAccountKeySelector.ariaLabel}
          placeholder={StorageAccountKeySelector.placeholder}
          width={24}
          isConfigured={(secureJsonFields && secureJsonFields.azureBlobAccountKey) as boolean}
          onChange={onUpdateDatasourceSecureJsonDataOption(props, 'azureBlobAccountKey')}
          onReset={() => onResetSecret('azureBlobAccountKey')}
        />
      </Stack>
    </Stack>
  );
};
