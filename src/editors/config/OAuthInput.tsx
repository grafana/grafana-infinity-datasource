import { onUpdateDatasourceSecureJsonDataOption, DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { CollapsableSection, Stack, InlineFormLabel, Input, LegacyForms, LinkButton, RadioButtonGroup } from '@grafana/ui';
import React from 'react';
import { SecureFieldsEditor } from './../../components/config/SecureFieldsEditor';
import type { InfinityOptions, InfinitySecureOptions, OAuth2Props, OAuth2Type } from './../../types';

const oAuthTypes: Array<SelectableValue<OAuth2Type>> = [
  { value: 'client_credentials', label: 'Client Credentials' },
  { value: 'jwt', label: 'JWT' },
  { value: 'others', label: 'Others' },
];

export const OAuthInputsEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const { secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as InfinitySecureOptions;
  let oauth2: OAuth2Props = options?.jsonData?.oauth2 || {};
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
        <InlineFormLabel width={12} tooltip="This refers to OAuth2 grant type">
          Grant Type
        </InlineFormLabel>
        <RadioButtonGroup<OAuth2Type> options={oAuthTypes} onChange={(v) => onOAuth2PropsChange('oauth2_type', v)} value={oauth2.oauth2_type || 'client_credentials'}></RadioButtonGroup>
      </div>
      {(oauth2.oauth2_type === 'client_credentials' || !oauth2?.oauth2_type) && (
        <>
          <div className="gf-form">
            <InlineFormLabel
              width={12}
              tooltip={
                <>
                  {`AuthStyleAutoDetect means to auto-detect which authentication style the provider wants by trying both ways and caching the successful way for the future.`}
                  <br />
                  <br />
                  {`AuthStyleInParams sends the "client_id" and "client_secret" in the POST body as application/x-www-form-urlencoded parameters.`}
                  <br />
                  <br />
                  {`AuthStyleInHeader sends the client_id and client_password using HTTP Basic Authorization. This is an optional style described in the OAuth2 RFC 6749 section 2.3.1.`}
                </>
              }
              {...{ interactive: true }}
            >
              Auth Style
            </InlineFormLabel>
            <RadioButtonGroup
              options={[
                { value: 0, label: 'Auto' },
                { value: 1, label: 'In Params' },
                { value: 2, label: 'In Header' },
              ]}
              onChange={(v) => onOAuth2PropsChange('authStyle', v || 0)}
              value={oauth2.authStyle || 0}
            ></RadioButtonGroup>
          </div>
          <div className="gf-form">
            <InlineFormLabel width={12}>Client ID</InlineFormLabel>
            <Input onChange={(v) => onOAuth2PropsChange('client_id', v.currentTarget.value)} value={oauth2.client_id} width={30} placeholder={'Client ID'} />
          </div>
          <div className="gf-form">
            <LegacyForms.SecretFormField
              labelWidth={12}
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
            <InlineFormLabel width={12}>Token URL</InlineFormLabel>
            <Input onChange={(v) => onOAuth2PropsChange('token_url', v.currentTarget.value)} value={oauth2.token_url} width={30} placeholder={'Token URL'} />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={12}>Scopes</InlineFormLabel>
            <Input
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
              labelWidth={12}
              secureFieldName="oauth2EndPointParamsName"
              secureFieldValue="oauth2EndPointParamsValue"
            />
          </div>
          <TokenCustomization options={options} onOptionsChange={onOptionsChange} />
        </>
      )}
      {oauth2.oauth2_type === 'jwt' && (
        <>
          <div className="gf-form">
            <InlineFormLabel width={12} tooltip="Email is the OAuth client identifier used when communicating with the configured OAuth provider.">
              Email
            </InlineFormLabel>
            <Input onChange={(v) => onOAuth2PropsChange('email', v.currentTarget.value)} value={oauth2.email} width={30} placeholder={'email'} />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={12} tooltip="PrivateKeyID contains an optional hint indicating which key is being used">
              Private Key Identifier
            </InlineFormLabel>
            <Input onChange={(v) => onOAuth2PropsChange('private_key_id', v.currentTarget.value)} value={oauth2.private_key_id} width={30} placeholder={'(optional) private key identifier'} />
          </div>
          <div className="gf-form">
            <LegacyForms.SecretFormField
              labelWidth={12}
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
            <InlineFormLabel width={12} tooltip="TokenURL is the endpoint required to complete the 2-legged JWT flow.">
              Token URL
            </InlineFormLabel>
            <Input onChange={(v) => onOAuth2PropsChange('token_url', v.currentTarget.value)} value={oauth2.token_url} width={30} placeholder={'Token URL'} />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={12} tooltip="Subject is the optional user to impersonate.">
              Subject
            </InlineFormLabel>
            <Input onChange={(v) => onOAuth2PropsChange('subject', v.currentTarget.value)} value={oauth2.subject} width={30} placeholder={'(optional) Subject'} />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={12} tooltip="Scopes optionally specifies a list of requested permission scopes. Enter comma separated values">
              Scopes
            </InlineFormLabel>
            <Input
              onChange={(v) => onOAuth2PropsChange('scopes', (v.currentTarget.value || '').split(','))}
              value={(oauth2.scopes || []).join(',')}
              width={30}
              placeholder={'Comma separated values of scopes'}
            />
          </div>
          <TokenCustomization options={options} onOptionsChange={onOptionsChange} />
        </>
      )}
      {oauth2.oauth2_type === 'others' && (
        <div style={{ margin: '15px', marginInline: '45px', textAlign: 'center' }}>
          <p>
            Looking for more OAuth support?
            <br />
            <br />
            <LinkButton href="https://github.com/grafana/grafana-infinity-datasource/discussions/260" target="_blank" rel="noreferrer" variant="secondary" size="md">
              Click here to know more
            </LinkButton>
          </p>
        </div>
      )}
    </>
  );
};

const TokenCustomization = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  let oauth2: OAuth2Props = options?.jsonData?.oauth2 || {};
  const onOAuth2PropsChange = <T extends keyof OAuth2Props, V extends OAuth2Props[T]>(key: T, value: V) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, oauth2: { ...oauth2, [key]: value } } });
  };
  return (
    <CollapsableSection label="Customization" isOpen={true}>
      <Stack direction={'column'}>
        <Stack gap={0.5}>
          <InlineFormLabel
            width={12}
            interactive={true}
            tooltip={`Once the token retrieved, the same will be sent to subsequent request's header with the key "Authorization". If the API require different key, provide the key here`}
          >
            Custom token header key
          </InlineFormLabel>
          <Input onChange={(v) => onOAuth2PropsChange('customTokenHeaderKey', v.currentTarget.value)} value={oauth2.customTokenHeaderKey} width={30} placeholder={'Authorization'} />
        </Stack>
        <Stack gap={0.5}>
          <InlineFormLabel
            width={12}
            interactive={true}
            tooltip={`Once the token retrieved, the same will be sent to subsequent request's Authorization header with the prefix "Bearer " or whatever returned from the initial token retrieval request's response. If the API require different prefix, provide the prefix here. Refer https://datatracker.ietf.org/doc/html/rfc6749#section-7.1 for more details`}
          >
            Custom token prefix
          </InlineFormLabel>
          <Input onChange={(v) => onOAuth2PropsChange('customTokenPrefix', v.currentTarget.value)} value={oauth2.customTokenPrefix} width={30} placeholder={'Bearer '} />
        </Stack>
      </Stack>
    </CollapsableSection>
  );
};
