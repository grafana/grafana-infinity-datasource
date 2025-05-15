import React from 'react';
import { config } from '@grafana/runtime';
import { gte } from 'semver';
import { css } from '@emotion/css';
import { useTheme2, InlineLabel, Input, RadioButtonGroup, InlineField, Switch, Stack, SecretInput } from '@grafana/ui';
import { FeatureToggles, onUpdateDatasourceSecureJsonDataOption, type DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { Components } from './../../selectors';
import type { InfinityOptions, InfinitySecureOptions, ProxyType } from '@/types';

const styles = {
  toggle: css`
    margin-top: 7px;
    margin-left: 5px;
  `,
};

type ProxyEditorProps = DataSourcePluginOptionsEditorProps<InfinityOptions>;

export const ProxyEditor = (props: ProxyEditorProps) => {
  const theme = useTheme2();
  const { options, onOptionsChange } = props;
  const { jsonData, secureJsonFields } = options;
  const { URL: URLSelector, UserName: UserNameSelector, Password: PasswordSelector } = Components.ConfigEditor.Network.Proxy.ProxyCustomURL;
  const onProxyTypeChange = (proxy_type: ProxyType = 'env') => {
    onOptionsChange({ ...options, jsonData: { ...jsonData, proxy_type } });
  };
  const onProxyUrlChange = (proxy_url: string) => {
    onOptionsChange({ ...options, jsonData: { ...jsonData, proxy_url } });
  };
  const onProxyUserNameChange = (proxy_username: string) => {
    onOptionsChange({ ...options, jsonData: { ...jsonData, proxy_username } });
  };
  const onResetSecret = (key: keyof InfinitySecureOptions) => {
    onOptionsChange({
      ...options,
      secureJsonFields: { ...options.secureJsonFields, [key]: false },
      secureJsonData: { ...options.secureJsonData, [key]: '' },
    });
  };
  return (
    <Stack gap={0.5} direction={'column'}>
      <Stack gap={0}>
        <InlineLabel width={20}>Proxy Mode</InlineLabel>
        <RadioButtonGroup<ProxyType>
          value={jsonData?.proxy_type || 'env'}
          options={[
            { value: 'env', label: 'From environment variable / Default' },
            { value: 'none', label: 'None' },
            { value: 'url', label: 'URL' },
          ]}
          onChange={(e) => onProxyTypeChange(e || 'env')}
        />
      </Stack>
      {jsonData?.proxy_type === 'url' && (
        <>
          <Stack gap={0}>
            <InlineLabel width={20} tooltip={URLSelector.tooltip}>
              {URLSelector.label}
            </InlineLabel>
            <Input
              role="input"
              width={40}
              aria-label={URLSelector.ariaLabel}
              placeholder={URLSelector.placeholder}
              value={jsonData?.proxy_url || ''}
              onChange={(e) => onProxyUrlChange(e.currentTarget.value)}
            />
          </Stack>
          <Stack gap={0}>
            <InlineLabel width={20} tooltip={UserNameSelector.tooltip}>
              {URLSelector.label}
            </InlineLabel>
            <Input
              role="input"
              width={40}
              aria-label={UserNameSelector.ariaLabel}
              placeholder={UserNameSelector.placeholder}
              value={jsonData?.proxy_username || ''}
              onChange={(e) => onProxyUserNameChange(e.currentTarget.value)}
            />
          </Stack>
          <Stack gap={0}>
            <InlineLabel width={20} tooltip={PasswordSelector.tooltip}>
              {PasswordSelector.label}
            </InlineLabel>
            <SecretInput
              role="input"
              width={40}
              aria-label={PasswordSelector.ariaLabel}
              placeholder={PasswordSelector.placeholder}
              isConfigured={(secureJsonFields && secureJsonFields.azureBlobAccountKey) as boolean}
              onChange={onUpdateDatasourceSecureJsonDataOption(props, 'proxyUserPassword')}
              onReset={() => onResetSecret('proxyUserPassword')}
            />
          </Stack>
        </>
      )}
      {(jsonData?.proxy_type === 'env' || !jsonData?.proxy_type) && (
        <>
          <div className="gf-form">
            <p style={{ marginLeft: theme.spacing(20), padding: theme.spacing(1) }}>
              Proxy settings from environment variables will be used. Use <kbd>HTTP_PROXY</kbd> &amp; <kbd>HTTPS_PROXY</kbd> environment variables. This will be skipped if no environment variables
              found.
            </p>
          </div>
        </>
      )}

      {config.featureToggles['secureSocksDSProxyEnabled' as keyof FeatureToggles] && gte(config.buildInfo.version, '10.0.0') && (
        <>
          <InlineField
            label="Secure Socks Proxy"
            tooltip={
              <>
                Enable proxying the datasource connection through the secure socks proxy to a different network. See{' '}
                <a href="https://grafana.com/docs/grafana/next/setup-grafana/configure-grafana/proxy/" target="_blank" rel="noopener noreferrer">
                  Configure a datasource connection proxy.
                </a>
              </>
            }
          >
            <div className={styles.toggle}>
              <Switch
                value={options.jsonData.enableSecureSocksProxy}
                onChange={(e) => {
                  onOptionsChange({
                    ...options,
                    jsonData: {
                      ...options.jsonData,
                      enableSecureSocksProxy: e.currentTarget.checked,
                    },
                  });
                }}
              />
            </div>
          </InlineField>
        </>
      )}
    </Stack>
  );
};
