import React from 'react';
import { render, screen } from '@testing-library/react';
import { AzureBlobAuthEditor } from './Auth.AzureBlob';
import { Components } from './../../selectors';
import { AzureBlobCloudTypeDefault } from './../../constants';
import type { DataSourceSettings, KeyValue } from '@grafana/data';
import type { InfinityOptions } from './../../types';

const { Region: RegionSelector, StorageAccountName: StorageAccountNameSelector, StorageAccountKey: StorageAccountKeySelector } = Components.ConfigEditor.Auth.AzureBlob;

describe('Config Auth Azure blob', () => {
  it(`shouldn't render editor when azureBlob authentication method not selected`, () => {
    const options = { jsonData: { auth_method: 'oauth2' } } as DataSourceSettings<InfinityOptions, {}>;
    render(<AzureBlobAuthEditor options={options} onOptionsChange={jest.fn} onResetSecret={jest.fn} />);
    expect(screen.queryByText(RegionSelector.label)).not.toBeInTheDocument();
  });
  it(`should render default config when azureBlob authentication method selected`, () => {
    const options = {
      jsonData: { auth_method: 'azureBlob' },
      secureJsonFields: { azureBlobAccountKey: false } as KeyValue,
    } as DataSourceSettings<InfinityOptions, {}>;
    render(<AzureBlobAuthEditor options={options} onOptionsChange={jest.fn} onResetSecret={jest.fn} />);
    expect(screen.queryByText(RegionSelector.label)).toBeInTheDocument();
    expect(screen.queryByText(StorageAccountNameSelector.label)).toBeInTheDocument();
    expect(screen.getByRole('input', { name: StorageAccountNameSelector.ariaLabel })).toHaveValue('');
    expect(screen.queryByText(StorageAccountKeySelector.label)).toBeInTheDocument();
    expect(screen.getByRole('input', { name: StorageAccountKeySelector.ariaLabel })).toHaveValue('');
    expect(screen.queryByText('Reset')).not.toBeInTheDocument();
  });
  it(`should render config with values when present`, () => {
    const options = {
      jsonData: { auth_method: 'azureBlob', azureBlobCloudType: AzureBlobCloudTypeDefault, azureBlobAccountName: 'foo' },
      secureJsonFields: { azureBlobAccountKey: true } as KeyValue,
    } as DataSourceSettings<InfinityOptions, {}>;
    render(<AzureBlobAuthEditor options={options} onOptionsChange={jest.fn} onResetSecret={jest.fn} />);
    expect(screen.queryByText(RegionSelector.label)).toBeInTheDocument();
    expect(screen.queryByText(StorageAccountNameSelector.label)).toBeInTheDocument();
    expect(screen.getByRole('input', { name: StorageAccountNameSelector.ariaLabel })).toHaveValue('foo');
    expect(screen.queryByText(StorageAccountKeySelector.label)).toBeInTheDocument();
    expect(screen.getByRole('input', { name: StorageAccountKeySelector.ariaLabel })).toHaveValue('configured');
    expect(screen.queryByText('Reset')).toBeInTheDocument();
  });
});
