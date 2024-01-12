import { InlineFormLabel, LegacyForms, Switch, useTheme } from '@grafana/ui';
import React from 'react';
import { SecureTextArea } from './../../components/config/SecureTextArea';
import type { InfinityOptions, InfinitySecureOptions } from './../../types';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';

interface TLSConfigEditorProps extends DataSourcePluginOptionsEditorProps<InfinityOptions> {
  hideTile?: boolean;
}

export const TLSConfigEditor = (props: TLSConfigEditorProps) => {
  const theme = useTheme();
  const { FormField } = LegacyForms;
  const { options, onOptionsChange } = props;
  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as InfinitySecureOptions;
  const onTLSSettingsChange = (key: keyof Pick<InfinityOptions, 'tlsSkipVerify' | 'tlsAuth' | 'tlsAuthWithCACert'>, value: boolean) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...options.jsonData,
        [key]: value,
      },
    });
  };
  const onServerNameChange = (serverName: string) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...options.jsonData,
        serverName,
      },
    });
  };
  const onCertificateChange = (key: keyof Omit<InfinitySecureOptions, 'password'>, value: string) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        ...secureJsonData,
        [key]: value,
      },
    });
  };
  const onCertificateReset = (key: keyof Omit<InfinitySecureOptions, 'password'>) => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...secureJsonFields,
        [key]: false,
      },
      secureJsonData: {
        ...secureJsonData,
        [key]: '',
      },
    });
  };
  const switchContainerStyle: React.CSSProperties = {
    padding: `0 ${theme.spacing.sm}`,
    height: `${theme.spacing.formInputHeight}px`,
    display: 'flex',
    alignItems: 'center',
  };
  return (
    <>
      {!props.hideTile && <h3>TLS / SSL Settings</h3>}
      <div className="gf-form-group">
        <div className="gf-form">
          <InlineFormLabel width={10} tooltip="Skip TLS Verify">
            Skip TLS Verify
          </InlineFormLabel>
          <div style={switchContainerStyle}>
            <Switch className="gf-form" value={jsonData.tlsSkipVerify || false} onChange={(e) => onTLSSettingsChange('tlsSkipVerify', e.currentTarget.checked)} />
          </div>
        </div>
        <div className="gf-form">
          <InlineFormLabel width={10} tooltip="Needed for verifying self-signed TLS Certs">
            With CA Cert
          </InlineFormLabel>
          <div style={switchContainerStyle}>
            <Switch className="gf-form" value={jsonData.tlsAuthWithCACert || false} onChange={(e) => onTLSSettingsChange('tlsAuthWithCACert', e.currentTarget.checked)} />
          </div>
        </div>
        <div className="gf-form">
          <InlineFormLabel width={10} tooltip="TLS Client Auth">
            TLS Client Auth
          </InlineFormLabel>
          <div style={switchContainerStyle}>
            <Switch className="gf-form" value={jsonData.tlsAuth || false} onChange={(e) => onTLSSettingsChange('tlsAuth', e.currentTarget.checked)} />
          </div>
        </div>
        {jsonData.tlsAuthWithCACert && (
          <SecureTextArea
            configured={!!secureJsonFields?.tlsCACert}
            placeholder="Begins with -----BEGIN CERTIFICATE-----"
            label="CA Cert"
            labelWidth={10}
            rows={5}
            onChange={(e) => onCertificateChange('tlsCACert', e.currentTarget.value)}
            onReset={() => onCertificateReset('tlsCACert')}
          />
        )}
        {jsonData.tlsAuth && (
          <>
            <div className="gf-form gf-form--grow">
              <FormField label="ServerName" labelWidth={10} inputWidth={50} placeholder="domain.example.com" value={jsonData.serverName} onChange={(e) => onServerNameChange(e.currentTarget.value)} />
            </div>
            <SecureTextArea
              configured={!!secureJsonFields?.tlsClientCert}
              placeholder="Begins with -----BEGIN CERTIFICATE-----"
              label="Client Cert"
              labelWidth={10}
              rows={5}
              onChange={(e) => onCertificateChange('tlsClientCert', e.currentTarget.value)}
              onReset={() => onCertificateReset('tlsClientCert')}
            />
            <SecureTextArea
              configured={!!secureJsonFields?.tlsClientKey}
              placeholder="Begins with -----BEGIN RSA PRIVATE KEY-----"
              label="Client Key"
              labelWidth={10}
              rows={5}
              onChange={(e) => onCertificateChange('tlsClientKey', e.currentTarget.value)}
              onReset={() => onCertificateReset('tlsClientKey')}
            />
          </>
        )}
      </div>
    </>
  );
};
