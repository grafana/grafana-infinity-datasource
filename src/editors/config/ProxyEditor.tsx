import React from 'react';
import { InlineLabel, Input, RadioButtonGroup, useTheme2, InlineField, Switch } from '@grafana/ui';
import { FeatureToggles, DataSourcePluginOptionsEditorProps } from '@grafana/data';
import type { InfinityOptions, ProxyType } from './../../types';
import { config } from '@grafana/runtime';
import { gte } from 'semver';
import { css } from '@emotion/css';

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
  const { jsonData } = options;
  const onProxyTypeChange = (proxy_type: ProxyType = 'env') => {
    onOptionsChange({ ...options, jsonData: { ...jsonData, proxy_type } });
  };
  const onProxyUrlChange = (proxy_url: string) => {
    onOptionsChange({ ...options, jsonData: { ...jsonData, proxy_url } });
  };
  return (
    <>
      <div className="gf-form">
        <InlineLabel width={20}>Proxy</InlineLabel>
        <RadioButtonGroup<ProxyType>
          value={jsonData?.proxy_type || 'env'}
          options={[
            { value: 'env', label: 'From environment variable / Default' },
            { value: 'url', label: 'URL' },
            { value: 'none', label: 'None' },
          ]}
          onChange={(e) => onProxyTypeChange(e || 'env')}
        />
      </div>
      {jsonData?.proxy_type === 'url' && (
        <div className="gf-form">
          <InlineLabel width={20}>Proxy URL</InlineLabel>
          <Input value={jsonData?.proxy_url || ''} onChange={(e) => onProxyUrlChange(e.currentTarget.value)} />
        </div>
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
    </>
  );
};
