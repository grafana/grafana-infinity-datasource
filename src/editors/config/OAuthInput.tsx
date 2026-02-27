import { css } from '@emotion/css';
import { onUpdateDatasourceSecureJsonDataOption, DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { InlineFormLabel, Input, LegacyForms, LinkButton, RadioButtonGroup, Stack, SecretTextArea } from '@grafana/ui';
import React from 'react';
import { Components } from '@/selectors';
import { SecureFieldsEditor } from '@/components/config/SecureFieldsEditor';
import type { InfinityOptions, InfinitySecureOptions, OAuth2Props, OAuth2Type } from '@/types';

const oAuthTypes: Array<SelectableValue<OAuth2Type>> = [
  { value: 'client_credentials', label: 'Client Credentials' },
  { value: 'jwt', label: 'JWT' },
  { value: 'external_account', label: 'External Account (WIF)' },
  { value: 'sts_token_exchange', label: 'Forward Token → STS Exchange' },
  { value: 'others', label: 'Others' },
];

/** Parses a comma-separated scopes string into an array of trimmed, non-empty scope values. */
const parseCommaSeparatedScopes = (value: string): string[] =>
  (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

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
        <InlineFormLabel width={10} tooltip="This refers to OAuth2 grant type">
          Grant Type
        </InlineFormLabel>
        <RadioButtonGroup<OAuth2Type> options={oAuthTypes} onChange={(v) => onOAuth2PropsChange('oauth2_type', v)} value={oauth2.oauth2_type || 'client_credentials'}></RadioButtonGroup>
      </div>
      {(oauth2.oauth2_type === 'client_credentials' || !oauth2?.oauth2_type) && (
        <>
          <div className="gf-form">
            <InlineFormLabel
              width={10}
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
            <InlineFormLabel width={10}>Client ID</InlineFormLabel>
            <Input onChange={(v) => onOAuth2PropsChange('client_id', v.currentTarget.value)} value={oauth2.client_id} width={30} placeholder={'Client ID'} />
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
            <Input onChange={(v) => onOAuth2PropsChange('token_url', v.currentTarget.value)} value={oauth2.token_url} width={30} placeholder={'Token URL'} />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={10}>Scopes</InlineFormLabel>
            <Input
              onChange={(v) => onOAuth2PropsChange('scopes', parseCommaSeparatedScopes(v.currentTarget.value))}
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
          <TokenCustomization options={options} onOptionsChange={onOptionsChange} />
        </>
      )}
      {oauth2.oauth2_type === 'jwt' && (
        <>
          <div className="gf-form">
            <InlineFormLabel width={10} tooltip="Email is the OAuth client identifier used when communicating with the configured OAuth provider.">
              Email
            </InlineFormLabel>
            <Input onChange={(v) => onOAuth2PropsChange('email', v.currentTarget.value)} value={oauth2.email} width={30} placeholder={'email'} />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={10} tooltip="PrivateKeyID contains an optional hint indicating which key is being used">
              Private Key Identifier
            </InlineFormLabel>
            <Input onChange={(v) => onOAuth2PropsChange('private_key_id', v.currentTarget.value)} value={oauth2.private_key_id} width={30} placeholder={'(optional) private key identifier'} />
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
            <Input onChange={(v) => onOAuth2PropsChange('token_url', v.currentTarget.value)} value={oauth2.token_url} width={30} placeholder={'Token URL'} />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={10} tooltip="Subject is the optional user to impersonate.">
              Subject
            </InlineFormLabel>
            <Input onChange={(v) => onOAuth2PropsChange('subject', v.currentTarget.value)} value={oauth2.subject} width={30} placeholder={'(optional) Subject'} />
          </div>
          <div className="gf-form">
            <InlineFormLabel width={10} tooltip="Scopes optionally specifies a list of requested permission scopes. Enter comma separated values">
              Scopes
            </InlineFormLabel>
            <Input
              onChange={(v) => onOAuth2PropsChange('scopes', parseCommaSeparatedScopes(v.currentTarget.value))}
              value={(oauth2.scopes || []).join(',')}
              width={30}
              placeholder={'Comma separated values of scopes'}
            />
          </div>
          <TokenCustomization options={options} onOptionsChange={onOptionsChange} />
        </>
      )}
      {oauth2.oauth2_type === 'external_account' && (
        <ExternalAccountEditor options={options} onOptionsChange={onOptionsChange} secureJsonFields={secureJsonFields} secureJsonData={secureJsonData} />
      )}
      {oauth2.oauth2_type === 'sts_token_exchange' && (
        <STSTokenExchangeEditor options={options} onOptionsChange={onOptionsChange} />
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
  const oauth2: OAuth2Props = options?.jsonData?.oauth2 || {};
  const { TokenHeader: TokenHeaderSelector, TokenTemplate: TokenTemplateSelector, CustomizeTokenSection: CustomizeTokenSectionSelector } = Components.ConfigEditor.Auth.OAuth2;
  const onOAuth2PropsChange = <T extends keyof OAuth2Props, V extends OAuth2Props[T]>(key: T, value: V) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, oauth2: { ...oauth2, [key]: value } } });
  };
  const styles = {
    subheading: css`
      margin-block: 20px;
    `,
  };
  return (
    <div>
      <h5 className={styles.subheading}>{CustomizeTokenSectionSelector.label}</h5>
      <Stack direction={'column'}>
        <Stack gap={0.5}>
          <InlineFormLabel width={12} interactive={true} tooltip={TokenHeaderSelector.tooltip}>
            {TokenHeaderSelector.label}
          </InlineFormLabel>
          <Input onChange={(v) => onOAuth2PropsChange('authHeader', v.currentTarget.value)} value={oauth2.authHeader} width={30} placeholder={TokenHeaderSelector.placeholder} />
        </Stack>
        <Stack gap={0.5}>
          <InlineFormLabel width={12} interactive={true} tooltip={TokenTemplateSelector.tooltip}>
            {TokenTemplateSelector.label}
          </InlineFormLabel>
          <Input onChange={(v) => onOAuth2PropsChange('tokenTemplate', v.currentTarget.value)} value={oauth2.tokenTemplate} width={30} placeholder={TokenTemplateSelector.placeholder} />
        </Stack>
      </Stack>
    </div>
  );
};

type ExternalAccountEditorProps = {
  options: DataSourcePluginOptionsEditorProps<InfinityOptions>['options'];
  onOptionsChange: DataSourcePluginOptionsEditorProps<InfinityOptions>['onOptionsChange'];
  secureJsonFields: DataSourcePluginOptionsEditorProps<InfinityOptions>['options']['secureJsonFields'];
  secureJsonData: InfinitySecureOptions;
};

/**
 * ExternalAccountEditor provides the UI for the OAuth2 "External Account" grant type.
 *
 * The external_account credentials JSON format supports multiple external identity providers
 * as the upstream token source:
 *
 * - **Google Workload Identity Federation (any OIDC/SAML provider)**: configure a Workload
 *   Identity Pool + Provider in Google Cloud and download the credentials JSON.
 * - **AWS**: use an EC2/ECS instance's AWS credentials as the external token
 *   (credential_source.environment_id == "aws1" in the JSON).
 * - **GitHub Actions**: point the URL credential source at the GitHub OIDC endpoint to
 *   exchange a GitHub Actions OIDC token for a Google access token.
 * - **Azure AD / Entra ID**: point the URL credential source at the Azure OIDC endpoint.
 * - **Any OIDC provider**: any provider that can produce a JWT accessible via a URL or file.
 *
 * The provider type is encoded in the credentials JSON itself; Infinity does not need
 * separate configuration for each provider — one unified credential JSON is enough.
 */
const ExternalAccountEditor = ({ options, onOptionsChange, secureJsonFields, secureJsonData }: ExternalAccountEditorProps) => {
  const oauth2: OAuth2Props = options?.jsonData?.oauth2 || {};
  const onOAuth2PropsChange = <T extends keyof OAuth2Props, V extends OAuth2Props[T]>(key: T, value: V) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, oauth2: { ...oauth2, [key]: value } } });
  };
  const onResetExternalCredentials = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: { ...options.secureJsonFields, oauth2ExternalCredentials: false },
      secureJsonData: { ...options.secureJsonData, oauth2ExternalCredentials: '' },
    });
  };
  return (
    <Stack direction={'column'} gap={1}>
      <div className="gf-form">
        <InlineFormLabel
          width={12}
          tooltip={
            <>
              Paste the <strong>external_account</strong> credentials JSON here. This file is typically downloaded from your identity provider (e.g. Google Cloud → IAM &amp; Admin → Workload Identity Federation → Download configuration).
              <br />
              <br />
              Supported external identity providers: Google WIF (OIDC/SAML), AWS EC2/ECS, GitHub Actions OIDC, Azure AD federated identity, and any OIDC/SAML provider.
            </>
          }
          {...{ interactive: true }}
        >
          Credentials JSON
        </InlineFormLabel>
        <SecretTextArea
          rows={8}
          cols={50}
          aria-label="oauth2 external account credentials json"
          placeholder={`{\n  "type": "external_account",\n  "audience": "//iam.googleapis.com/...",\n  "subject_token_type": "urn:ietf:params:oauth:token-type:jwt",\n  "token_url": "https://sts.googleapis.com/v1/token",\n  "credential_source": { ... }\n}`}
          isConfigured={(secureJsonFields && secureJsonFields.oauth2ExternalCredentials) as boolean}
          onChange={onUpdateDatasourceSecureJsonDataOption({ options, onOptionsChange } as DataSourcePluginOptionsEditorProps<InfinityOptions>, 'oauth2ExternalCredentials')}
          onReset={onResetExternalCredentials}
        />
      </div>
      <div className="gf-form">
        <InlineFormLabel
          width={12}
          tooltip="Comma-separated list of OAuth2 scopes to request. For Google APIs, this is typically 'https://www.googleapis.com/auth/cloud-platform'."
        >
          Scopes
        </InlineFormLabel>
        <Input
          onChange={(v) => onOAuth2PropsChange('scopes', parseCommaSeparatedScopes(v.currentTarget.value))}
          value={(oauth2.scopes || []).join(', ')}
          width={50}
          placeholder={'https://www.googleapis.com/auth/cloud-platform'}
        />
      </div>
    </Stack>
  );
};

/**
 * STSTokenExchangeEditor configures the OAuth2 "Forward Token → STS Exchange" grant type.
 *
 * ### How this differs from "Forward OAuth Identity" (oauthPassThru)
 *
 * | Aspect | Forward OAuth Identity | Forward Token → STS Exchange |
 * |--------|----------------------|------------------------------|
 * | What gets sent to the target API | The Grafana user's **original** IdP token | A **new, short-lived** token issued by the STS **for the target service** |
 * | Target API requirement | Must accept the IdP's tokens directly | Only needs to accept its own STS-issued tokens |
 * | Cross-cloud support | No — the target must trust your IdP | Yes — the STS bridges trust between your IdP and the target service |
 * | Long-lived secrets required | No | No |
 * | Per-user identity preserved | Yes | Yes — each user's IdP token generates a distinct STS token |
 * | Audience scoping | Not enforced | Yes — the STS issues tokens scoped to a specific `audience` |
 *
 * **Forward OAuth Identity** simply re-uses the user's existing Grafana OAuth token on
 * the outgoing request. It works only if the target API directly trusts the same IdP
 * (e.g., calling an Azure resource when Grafana uses Azure AD auth).
 *
 * **Forward Token → STS Exchange** uses the Grafana user's token as proof-of-identity
 * ("subject token") in an RFC 8693 token exchange. The STS validates the external
 * identity and issues a new, audience-scoped access token. This is required when:
 * - The target API lives in a different cloud/trust domain (e.g., Google APIs when
 *   Grafana uses Okta, GitHub, or Azure AD).
 * - You need the token to be scoped to a specific Google WIF audience or service account.
 * - You want the target service to only ever see its own STS-issued tokens, never raw IdP tokens.
 *
 * ### Requirements
 * - Grafana must be configured with an OAuth2 login provider (Okta, Azure AD, GitHub, etc.).
 * - The datasource must have "Forward OAuth Identity" enabled in Grafana's datasource settings
 *   so that Grafana injects the user's bearer token into plugin requests.
 * - The external IdP must be registered as a trusted provider in the target STS
 *   (e.g., a Google Workload Identity Pool provider that trusts your Okta OIDC endpoint).
 */
const STSTokenExchangeEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const oauth2: OAuth2Props = options?.jsonData?.oauth2 || {};
  const onOAuth2PropsChange = <T extends keyof OAuth2Props, V extends OAuth2Props[T]>(key: T, value: V) => {
    onOptionsChange({ ...options, jsonData: { ...options.jsonData, oauth2: { ...oauth2, [key]: value } } });
  };
  const subjectTokenTypeOptions = [
    { value: 'urn:ietf:params:oauth:token-type:id_token', label: 'ID Token (OIDC JWT — Azure AD, Okta, GitHub)' },
    { value: 'urn:ietf:params:oauth:token-type:access_token', label: 'Access Token (Okta, Azure AD access_token)' },
    { value: 'urn:ietf:params:oauth:token-type:jwt', label: 'Generic JWT' },
  ];
  return (
    <Stack direction={'column'} gap={1}>
      <div className="gf-form">
        <InlineFormLabel
          width={14}
          tooltip={
            <>
              The STS token exchange endpoint URL. For Google Workload Identity Federation this is{' '}
              <code>https://sts.googleapis.com/v1/token</code>.
              <br />
              <br />
              The STS must be configured to trust your Grafana OAuth provider (Okta, Azure AD, GitHub, etc.)
              as an external identity source.
              <br />
              <br />
              <strong>Difference from Forward OAuth Identity:</strong> Forward OAuth Identity sends the
              Grafana user's token directly to the target API. This option first exchanges it for a new
              token issued specifically for the target service. Use this when the target API lives in a
              different trust domain (e.g., Google APIs when Grafana uses Okta or Azure AD).
            </>
          }
          {...{ interactive: true }}
        >
          STS Token URL
        </InlineFormLabel>
        <Input
          onChange={(v) => onOAuth2PropsChange('token_url', v.currentTarget.value)}
          value={oauth2.token_url || ''}
          width={40}
          placeholder={'https://sts.googleapis.com/v1/token'}
        />
      </div>
      <div className="gf-form">
        <InlineFormLabel
          width={14}
          tooltip={
            <>
              The audience that the exchanged token should be scoped to. For Google WIF this is the
              full workload identity pool provider resource name, e.g.:
              <br />
              <code>{'//iam.googleapis.com/projects/PROJECT/locations/global/workloadIdentityPools/POOL/providers/PROVIDER'}</code>
            </>
          }
          {...{ interactive: true }}
        >
          Audience
        </InlineFormLabel>
        <Input
          onChange={(v) => onOAuth2PropsChange('audience', v.currentTarget.value)}
          value={oauth2.audience || ''}
          width={50}
          placeholder={'//iam.googleapis.com/projects/123/locations/global/workloadIdentityPools/pool/providers/provider'}
        />
      </div>
      <div className="gf-form">
        <InlineFormLabel
          width={14}
          tooltip={
            <>
              The OAuth2 token type of the <strong>Grafana-forwarded</strong> bearer token (the subject_token in
              RFC 8693 terms).
              <br />
              <br />
              Use <strong>ID Token</strong> when Grafana is configured with Okta, Azure AD, or GitHub and the
              forwarded token is an OIDC ID token (a JWT with <code>sub</code> / <code>email</code> claims).
              <br />
              <br />
              Use <strong>Access Token</strong> when the forwarded token is an OAuth2 opaque or JWT access token.
            </>
          }
          {...{ interactive: true }}
        >
          Subject Token Type
        </InlineFormLabel>
        <RadioButtonGroup<string>
          options={subjectTokenTypeOptions}
          onChange={(v) => onOAuth2PropsChange('subject_token_type', v || subjectTokenTypeOptions[0].value)}
          value={oauth2.subject_token_type || subjectTokenTypeOptions[0].value}
        />
      </div>
      <div className="gf-form">
        <InlineFormLabel
          width={14}
          tooltip="Comma-separated OAuth2 scopes to request in the exchanged token. For Google APIs: 'https://www.googleapis.com/auth/cloud-platform'."
        >
          Scopes
        </InlineFormLabel>
        <Input
          onChange={(v) => onOAuth2PropsChange('scopes', parseCommaSeparatedScopes(v.currentTarget.value))}
          value={(oauth2.scopes || []).join(', ')}
          width={50}
          placeholder={'https://www.googleapis.com/auth/cloud-platform'}
        />
      </div>
    </Stack>
  );
};
