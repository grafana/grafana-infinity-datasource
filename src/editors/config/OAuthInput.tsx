import React from 'react';
import { DataSourcePluginOptionsEditorProps, SelectableValue, onUpdateDatasourceSecureJsonDataOption } from '@grafana/data';
import { InlineFormLabel, RadioButtonGroup, Input, LegacyForms, LinkButton } from '@grafana/ui';
import { InfinityOptions, InfinitySecureOptions, OAuth2Props, OAuth2Type } from '../../types';

const oAuthTypes: Array<SelectableValue<OAuth2Type>> = [
  { value: 'client_credentials', label: 'Client Credentials' },
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
        </>
      )}
      {oauth2.oauth2_type === 'others' && (
        <div style={{ margin: '15px' }}>
          <p>
            Looking for more OAuth types support?&nbsp;
            <LinkButton href="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/260" target="_blank" rel="noreferrer" variant="secondary" size="md">
              Click here to know more
            </LinkButton>
          </p>
        </div>
      )}
    </>
  );
};
