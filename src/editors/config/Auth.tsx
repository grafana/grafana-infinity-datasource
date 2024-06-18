import { css } from '@emotion/css';
import { onUpdateDatasourceSecureJsonDataOption, DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { Icon, InlineFormLabel, LegacyForms, RadioButtonGroup, Select, useTheme2 } from '@grafana/ui';
import React, { useState } from 'react';
import { AllowedHostsEditor } from './AllowedHosts';
import { OAuthInputsEditor } from './OAuthInput';
import { OthersAuthentication } from './OtherAuthProviders';
import { AWSRegions } from './../../constants';
import type { APIKeyType, AuthType, InfinityOptions, InfinitySecureOptions } from './../../types';

const authTypes: Array<SelectableValue<AuthType | 'others'> & { logo?: string }> = [
  { value: 'none', label: 'No Auth' },
  { value: 'basicAuth', label: 'Basic Authentication' },
  { value: 'bearerToken', label: 'Bearer Token' },
  { value: 'apiKey', label: 'API Key Value pair' },
  { value: 'digestAuth', label: 'Digest Auth' },
  { value: 'oauthPassThru', label: 'Forward OAuth' },
  { value: 'oauth2', label: 'OAuth2', logo: '/public/plugins/yesoreyeram-infinity-datasource/img/oauth-2-sm.png' },
  { value: 'aws', label: 'AWS', logo: '/public/plugins/yesoreyeram-infinity-datasource/img/aws.jpg' },
  { value: 'azureBlob', label: 'Azure Blob' },
  { value: 'others', label: 'Other Auth Providers' },
];

export const AuthEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { FormField, SecretFormField } = LegacyForms;
  const { options, onOptionsChange } = props;
  const { secureJsonFields } = options;
  const [othersOpen, setOthersOpen] = useState(false);
  const theme = useTheme2();
  const secureJsonData = (options.secureJsonData || {}) as InfinitySecureOptions;
  const authType = props.options.jsonData.auth_method
    ? props.options.jsonData.auth_method
    : props.options.basicAuth
      ? 'basicAuth'
      : props.options.jsonData.oauthPassThru
        ? 'oauthPassThru'
        : props.options.jsonData.auth_method || 'none';
  const styles = {
    subheading: css`
      margin-block: 20px;
    `,
    container: css`
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: auto;
      grid-auto-flow: row;
      grid-column-gap: 10px;
      grid-row-gap: 10px;
      margin-bottom: 20px;
    `,
    card: css({
      cursor: 'pointer',
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.strong}`,
      padding: `5px 10px`,
      textOverflow: 'ellipsis',
    }),
    card_selected: css({
      cursor: 'pointer',
      color: theme.colors.text.primary,
      // border: `1px solid ${theme.colors.success.shade}`,
      border: `1px solid ${theme.colors.border.strong}`,
      background: theme.colors.emphasize(theme.colors.background.secondary, 0.2),
      padding: `5px 10px`,
    }),
  };
  const onAuthTypeChange = (authMethod: AuthType = 'none') => {
    switch (authMethod) {
      case 'basicAuth':
        onOptionsChange({ ...options, basicAuth: true, jsonData: { ...options.jsonData, oauthPassThru: false, auth_method: 'basicAuth' } });
        break;
      case 'oauthPassThru':
        onOptionsChange({ ...options, basicAuth: false, jsonData: { ...options.jsonData, oauthPassThru: true, auth_method: 'oauthPassThru' } });
        break;
      case 'digestAuth':
      case 'apiKey':
      case 'bearerToken':
      case 'aws':
      case 'azureBlob':
      case 'oauth2':
      case 'none':
      default:
        onOptionsChange({ ...options, basicAuth: false, jsonData: { ...options.jsonData, oauthPassThru: false, auth_method: authMethod } });
    }
  };
  const onUserNameChange = (basicAuthUser: string) => {
    onOptionsChange({ ...options, basicAuthUser });
  };
  const onAPIKeyKeyChange = (apiKeyKey: string) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, apiKeyKey } });
  };
  const onAwsRegionChange = (region: string) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, aws: { ...options.jsonData?.aws, region } } });
  };
  const onAwsServiceChange = (service: string) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, aws: { ...options.jsonData?.aws, service } } });
  };
  const onAzureBlogAccountChange = (azureBlobAccountName: string) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, azureBlobAccountName } });
  };
  const onResetSecret = (key: keyof InfinitySecureOptions) => {
    onOptionsChange({
      ...options,
      secureJsonFields: { ...options.secureJsonFields, [key]: false },
      secureJsonData: { ...options.secureJsonData, [key]: '' },
    });
  };
  return (
    <>
      <h5 className={styles.subheading}>Auth type</h5>
      <div className={styles.container}>
        {authTypes.map((a, ai) => (
          <a
            role={'button'}
            tabIndex={ai + 1}
            className={a.value === authType && !othersOpen ? styles.card_selected : styles.card}
            key={a.value}
            onKeyDown={(e) => {
              if (e.keyCode === 32) {
                if (a && a.value) {
                  a.value === 'others' ? setOthersOpen(true) : onAuthTypeChange(a.value);
                } else {
                  onAuthTypeChange('none');
                }
                e.preventDefault();
              }
            }}
            onClick={(e) => {
              if (a && a.value) {
                a.value === 'others' ? setOthersOpen(true) : onAuthTypeChange(a.value);
              } else {
                onAuthTypeChange('none');
              }
              e.preventDefault();
            }}
          >
            {a.logo ? <img src={a.logo} width={24} height={24} style={{ marginInlineEnd: '10px' }} /> : <Icon name="key-skeleton-alt" style={{ marginInlineEnd: '10px' }} />}
            {a.label}
          </a>
        ))}
      </div>
      <OthersAuthentication options={options} isOpen={othersOpen} onClose={() => setOthersOpen(false)} onOptionsChange={onOptionsChange} />
      {authType !== 'none' && authType !== 'oauthPassThru' && !othersOpen && (
        <>
          <h5 className={styles.subheading}>Auth details</h5>
          <div>
            {(authType === 'basicAuth' || authType === 'digestAuth') && (
              <>
                <div className="gf-form">
                  <FormField label="User Name" placeholder="username" labelWidth={10} value={props.options.basicAuthUser || ''} onChange={(e) => onUserNameChange(e.currentTarget.value)}></FormField>
                </div>
                <div className="gf-form">
                  <SecretFormField
                    labelWidth={10}
                    inputWidth={12}
                    required
                    value={secureJsonData.basicAuthPassword || ''}
                    isConfigured={(secureJsonFields && secureJsonFields.basicAuthPassword) as boolean}
                    onReset={() => onResetSecret('basicAuthPassword')}
                    onChange={onUpdateDatasourceSecureJsonDataOption(props, 'basicAuthPassword')}
                    label="Password"
                    aria-label="password"
                    placeholder="password"
                    tooltip="password"
                  />
                </div>
                <ConfigPreview jsonData={options.jsonData} authType={authType} />
              </>
            )}
            {authType === 'bearerToken' && (
              <>
                <div className="gf-form">
                  <SecretFormField
                    labelWidth={10}
                    inputWidth={12}
                    required
                    value={secureJsonData.bearerToken || ''}
                    isConfigured={(secureJsonFields && secureJsonFields.bearerToken) as boolean}
                    onReset={() => onResetSecret('bearerToken')}
                    onChange={onUpdateDatasourceSecureJsonDataOption(props, 'bearerToken')}
                    label="Bearer token"
                    aria-label="bearer token"
                    placeholder="bearer token"
                    tooltip="bearer token"
                  />
                </div>
                <ConfigPreview jsonData={options.jsonData} authType={authType} />
              </>
            )}
            {authType === 'apiKey' && (
              <>
                <div className="gf-form">
                  <FormField
                    label="Key"
                    placeholder="api key key"
                    tooltip="api key key"
                    labelWidth={10}
                    value={props.options.jsonData.apiKeyKey || ''}
                    onChange={(e) => onAPIKeyKeyChange(e.currentTarget.value)}
                  ></FormField>
                </div>
                <div className="gf-form">
                  <SecretFormField
                    labelWidth={10}
                    inputWidth={12}
                    required
                    value={secureJsonData.apiKeyValue || ''}
                    isConfigured={(secureJsonFields && secureJsonFields.apiKeyValue) as boolean}
                    onReset={() => onResetSecret('apiKeyValue')}
                    onChange={onUpdateDatasourceSecureJsonDataOption(props, 'apiKeyValue')}
                    label="Value"
                    aria-label="api key value"
                    placeholder="api key value"
                    tooltip="api key value"
                  />
                </div>
                <div className="gf-form">
                  <InlineFormLabel tooltip="Add api key to header/query params.">Add to</InlineFormLabel>
                  <RadioButtonGroup<APIKeyType>
                    options={[
                      { value: 'header', label: 'Header' },
                      { value: 'query', label: 'Query Param' },
                    ]}
                    value={options.jsonData.apiKeyType || 'header'}
                    onChange={(apiKeyType = 'header') => onOptionsChange({ ...options, jsonData: { ...options.jsonData, apiKeyType } })}
                  />
                </div>
                <ConfigPreview jsonData={options.jsonData} authType={authType} />
              </>
            )}
            {authType === 'aws' && (
              <>
                <div className="gf-form">
                  <InlineFormLabel>Region</InlineFormLabel>
                  <Select width={24} options={AWSRegions} placeholder="us-east-2" onChange={(e) => onAwsRegionChange(e.value!)} value={props.options.jsonData?.aws?.region || ''} />
                </div>
                <div className="gf-form">
                  <FormField
                    label="Service"
                    placeholder="monitoring"
                    labelWidth={10}
                    value={props.options.jsonData?.aws?.service || ''}
                    onChange={(e) => onAwsServiceChange(e.currentTarget.value)}
                  ></FormField>
                </div>
                <div className="gf-form">
                  <SecretFormField
                    labelWidth={10}
                    inputWidth={12}
                    required
                    value={secureJsonData.awsAccessKey || ''}
                    isConfigured={(secureJsonFields && secureJsonFields.awsAccessKey) as boolean}
                    onReset={() => onResetSecret('awsAccessKey')}
                    onChange={onUpdateDatasourceSecureJsonDataOption(props, 'awsAccessKey')}
                    label="Access Key"
                    aria-label="aws access key"
                    placeholder="aws access key"
                    tooltip="aws access key"
                  />
                </div>
                <div className="gf-form">
                  <SecretFormField
                    labelWidth={10}
                    inputWidth={12}
                    required
                    value={secureJsonData.awsSecretKey || ''}
                    isConfigured={(secureJsonFields && secureJsonFields.awsSecretKey) as boolean}
                    onReset={() => onResetSecret('awsSecretKey')}
                    onChange={onUpdateDatasourceSecureJsonDataOption(props, 'awsSecretKey')}
                    label="Secret Key"
                    aria-label="aws secret key"
                    placeholder="aws secret key"
                    tooltip="aws secret key"
                  />
                </div>
              </>
            )}
            {authType === 'oauth2' && <OAuthInputsEditor {...props} />}
            {authType === 'azureBlob' && (
              <>
                <div className="gf-form">
                  <FormField
                    label="Storage account name"
                    placeholder="storage account name"
                    tooltip={'storage account name'}
                    labelWidth={12}
                    value={props.options.jsonData?.azureBlobAccountName || ''}
                    onChange={(e) => onAzureBlogAccountChange(e.currentTarget.value)}
                  ></FormField>
                </div>
                <div className="gf-form">
                  <SecretFormField
                    labelWidth={12}
                    inputWidth={12}
                    required
                    value={secureJsonData.azureBlobAccountKey || ''}
                    isConfigured={(secureJsonFields && secureJsonFields.azureBlobAccountKey) as boolean}
                    onReset={() => onResetSecret('azureBlobAccountKey')}
                    onChange={onUpdateDatasourceSecureJsonDataOption(props, 'azureBlobAccountKey')}
                    label="Storage account key"
                    aria-label="azure blob storage account key"
                    placeholder="azure blob storage account key"
                    tooltip="azure blob storage account key"
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}
      {authType !== 'none' && authType !== 'azureBlob' && !othersOpen && (
        <>
          <h5 className={styles.subheading}>Allowed hosts</h5>
          <AllowedHostsEditor options={options} onOptionsChange={onOptionsChange} />
        </>
      )}
    </>
  );
};

const ConfigPreview = (props: { jsonData: InfinityOptions; authType: string }) => {
  const { jsonData, authType } = props;
  return (
    <>
      <br />
      <h5>Preview / Sample request</h5>
      <br />
      <code>{configToCurl(jsonData, authType)}</code>
    </>
  );
};

const configToCurl = (jsonData: InfinityOptions, authType = 'unknown') => {
  const headerKeys = Object.keys(jsonData || {})
    .filter((key) => key.startsWith('httpHeaderName'))
    .filter(Boolean)
    .map((k) => (jsonData as any)[k])
    .filter(Boolean)
    .map((k) => `--header '${k || 'header_key'}: xxx'`)
    .join(` `);
  const queryKeys = Object.keys(jsonData || {})
    .filter((key) => key.startsWith('secureQueryName'))
    .filter(Boolean)
    .map((k) => (jsonData as any)[k])
    .filter(Boolean)
    .map((k) => `${k || 'header_key'}=xxx`)
    .join(`&`);
  if (authType === 'basicAuth' || authType === 'digestAuth') {
    return `curl --location 'https://your_url.com?${queryKeys}' --header 'Authorization: Basic <YOUR_USERNAME_PASSWORD_ENCODED>' ${headerKeys}`;
  } else if (authType === 'bearerToken') {
    return `curl --location 'https://your_url.com?${queryKeys}' --header 'Authorization: Bearer <YOUR_TOKEN_GOES_HERE>' ${headerKeys}`;
  } else if (authType === 'apiKey') {
    if (jsonData.apiKeyType === 'query') {
      return `curl --location 'https://your_url.com?${jsonData.apiKeyKey}=<YOUR_API_KEY_VALUED>&${queryKeys}' ${headerKeys}`;
    } else {
      return `curl --location 'https://your_url.com?${queryKeys}' --header '${jsonData.apiKeyKey || '<YOUR_API_KEY>'}: <YOUR_API_VALUE>' ${headerKeys}`;
    }
  }
  return '';
};
