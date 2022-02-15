import React from 'react';
import { DataSourcePluginOptionsEditorProps, SelectableValue, onUpdateDatasourceSecureJsonDataOption } from '@grafana/data';
import { InlineFormLabel, RadioButtonGroup, Input, LegacyForms, LinkButton } from '@grafana/ui';
import { SecureFieldsEditor } from '../../components/config/SecureFieldsEditor';
import { InfinityOptions, InfinitySecureOptions, OAuth2Props, OAuth2Type } from '../../types';

const oAuthTypes: Array<SelectableValue<OAuth2Type>> = [
  { value: 'client_credentials', label: 'Client Credentials' },
  { value: 'jwt', label: 'JWT' },
  { value: 'others', label: 'Others' },
];

export const OAuthInputsEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const { secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as InfinitySecureOptions;
  const oauth2: OAuth2Props = options?.jsonData?.oauth2 || {};
  oauth2.oauth2_type = oauth2.oauth2_type || 'client_credentials';
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
  const onResetJWTPrivateKey = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: { ...options.secureJsonFields, oauth2JWTPrivateKey: false },
      secureJsonData: { ...options.secureJsonData, oauth2JWTPrivateKey: '' },
    });
  };
  return (
    <>
      <div className="gf-form">
        <InlineFormLabel width={10}>OAuth Type</InlineFormLabel>
        <RadioButtonGroup<OAuth2Type> options={oAuthTypes} onChange={(v) => onOAuth2PropsChange('oauth2_type', v)} value={oauth2.oauth2_type || 'client_credentials'}></RadioButtonGroup>
      </div>
      {oauth2.oauth2_type === 'client_credentials' && (
        <>
          <div className="gf-form">
            <InlineFormLabel width={10}>Client ID</InlineFormLabel>
            <Input css={null} onChange={(v) => onOAuth2PropsChange('client_id', v.currentTarget.value)} value={oauth2.client_id} width={30} placeholder={'Client ID'} />
          </div>
          <div className="gf-form">
            <LegacyForms.SecretFormField
              labelWidth={10}
              inputWidth={15}
              required
              value={secureJsonData.oauth2ClientSecret || ''}
              isConfigured={(secureJsonFields && secureJsonFields.oauth2ClientSecret) as boolean}
              onReset={onResetClientSecret}
              onChange={onUpdateDatasourceSecureJsonDataOption(props, 'oauth2ClientSecret')}
              label="Client Secret"
              aria-label="client secret"
              placeholder="Client secret"
            />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={10}>Token URL</InlineFormLabel>
            <Input css={null} onChange={(v) => onOAuth2PropsChange('token_url', v.currentTarget.value)} value={oauth2.token_url} width={30} placeholder={'Token URL'} />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={10}>Scopes</InlineFormLabel>
            <Input
              css={null}
              onChange={(v) => onOAuth2PropsChange('scopes', (v.currentTarget.value || '').split(','))}
              value={(oauth2.scopes || []).join(',')}
              width={30}
              placeholder={'Comma separated values of scopes'}
            />
          </div>
          <div className="gf-form">
            <SecureFieldsEditor
              dataSourceConfig={options}
              onChange={onOptionsChange}
              title="Endpoint params"
              hideTile={true}
              label="Endpoint param"
              labelWidth={10}
              secureFieldName="oauth2EndPointParamsName"
              secureFieldValue="oauth2EndPointParamsValue"
            />
          </div>
        </>
      )}
      {oauth2.oauth2_type === 'jwt' && (
        <>
          <div className="gf-form">
            <InlineFormLabel width={10} tooltip="Email is the OAuth client identifier used when communicating with the configured OAuth provider.">
              Email
            </InlineFormLabel>
            <Input css={null} onChange={(v) => onOAuth2PropsChange('email', v.currentTarget.value)} value={oauth2.email} width={30} placeholder={'email'} />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={10} tooltip="PrivateKeyID contains an optional hint indicating which key is being used">
              Private Key Identifier
            </InlineFormLabel>
            <Input
              css={null}
              onChange={(v) => onOAuth2PropsChange('private_key_id', v.currentTarget.value)}
              value={oauth2.private_key_id}
              width={30}
              placeholder={'(optional) private key identifier'}
            />
          </div>
          <div className="gf-form">
            <LegacyForms.SecretFormField
              labelWidth={10}
              inputWidth={15}
              required
              value={secureJsonData.oauth2JWTPrivateKey || ''}
              tooltip="PrivateKey contains the contents of an RSA private key or the contents of a PEM file that contains a private key. The provided private key is used to sign JWT payloads"
              isConfigured={(secureJsonFields && secureJsonFields.oauth2JWTPrivateKey) as boolean}
              onReset={onResetJWTPrivateKey}
              onChange={onUpdateDatasourceSecureJsonDataOption(props, 'oauth2JWTPrivateKey')}
              label="Private Key"
              aria-label="Private Key"
              placeholder="Private Key"
            />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={10} tooltip="TokenURL is the endpoint required to complete the 2-legged JWT flow.">
              Token URL
            </InlineFormLabel>
            <Input css={null} onChange={(v) => onOAuth2PropsChange('token_url', v.currentTarget.value)} value={oauth2.token_url} width={30} placeholder={'Token URL'} />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={10} tooltip="Subject is the optional user to impersonate.">
              Subject
            </InlineFormLabel>
            <Input css={null} onChange={(v) => onOAuth2PropsChange('subject', v.currentTarget.value)} value={oauth2.subject} width={30} placeholder={'(optional) Subject'} />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={10} tooltip="Scopes optionally specifies a list of requested permission scopes. Enter comma separated values">
              Scopes
            </InlineFormLabel>
            <Input
              css={null}
              onChange={(v) => onOAuth2PropsChange('scopes', (v.currentTarget.value || '').split(','))}
              value={(oauth2.scopes || []).join(',')}
              width={30}
              placeholder={'Comma separated values of scopes'}
            />
          </div>
        </>
      )}
      {oauth2.oauth2_type === 'others' && (
        <div style={{ margin: '15px', marginInline: '45px', textAlign: 'center' }}>
          <p>
            Looking for more OAuth support?
            <br />
            <br />
            <LinkButton href="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/260" target="_blank" rel="noreferrer" variant="secondary" size="md">
              Click here to know more
            </LinkButton>
          </p>
        </div>
      )}
    </>
  );
};
