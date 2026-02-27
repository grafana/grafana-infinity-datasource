import type { InfinityQuery } from '@/types';
import type { DataSourceInstanceSettings, DataSourceJsonData } from '@grafana/data';

//#region Config
export interface GlobalInfinityQuery {
  name: string;
  id: string;
  query: InfinityQuery;
}
export type AuthType = 'none' | 'basicAuth' | 'apiKey' | 'bearerToken' | 'oauthPassThru' | 'digestAuth' | 'aws' | 'azureBlob' | 'oauth2';
export type OAuth2Type = 'client_credentials' | 'jwt' | 'external_account' | 'sts_token_exchange' | 'others';
export type APIKeyType = 'header' | 'query';
export type OAuth2Props = {
  oauth2_type?: OAuth2Type;
  client_id?: string;
  email?: string;
  private_key_id?: string;
  subject?: string;
  token_url?: string;
  scopes?: string[];
  authStyle?: number;
  authHeader?: string;
  tokenTemplate?: string;
  /** Target audience for RFC 8693 STS token exchange. Only used with sts_token_exchange. */
  audience?: string;
  /** OAuth2 token type of the Grafana-forwarded bearer token. Only used with sts_token_exchange. */
  subject_token_type?: string;
};
export type AWSAuthProps = {
  authType?: 'keys';
  region?: string;
  service?: string;
};
export type InfinityReferenceData = { name: string; data: string };
export type ProxyType = 'none' | 'env' | 'url';
export type UnsecureQueryHandling = 'warn' | 'allow' | 'deny';
export type AzureBlobCloudType = 'AzureCloud' | 'AzureUSGovernment' | 'AzureChinaCloud';
export interface InfinityOptions extends DataSourceJsonData {
  auth_method?: AuthType;
  apiKeyKey?: string;
  apiKeyType?: APIKeyType;
  oauth2?: OAuth2Props;
  aws?: AWSAuthProps;
  tlsSkipVerify?: boolean;
  tlsAuth?: boolean;
  serverName?: string;
  tlsAuthWithCACert?: boolean;
  global_queries?: GlobalInfinityQuery[];
  timeoutInSeconds?: number;
  proxy_type?: ProxyType;
  proxy_url?: string;
  proxy_username?: string;
  oauthPassThru?: boolean;
  allowedHosts?: string[];
  refData?: InfinityReferenceData[];
  customHealthCheckEnabled?: boolean;
  customHealthCheckUrl?: string;
  azureBlobCloudType?: AzureBlobCloudType;
  azureBlobAccountUrl?: string;
  azureBlobAccountName?: string;
  unsecuredQueryHandling?: UnsecureQueryHandling;
  enableSecureSocksProxy?: boolean;
  pathEncodedUrlsEnabled?: boolean;
  ignoreStatusCodeCheck?: boolean;
  allowDangerousHTTPMethods?: boolean;
  keepCookies?: string[];
}

export interface InfinitySecureOptions {
  basicAuthPassword?: string;
  tlsCACert?: string;
  tlsClientCert?: string;
  tlsClientKey?: string;
  apiKeyValue?: string;
  bearerToken?: string;
  awsAccessKey?: string;
  awsSecretKey?: string;
  oauth2ExternalCredentials?: string;
  oauth2ClientSecret?: string;
  oauth2JWTPrivateKey?: string;
  azureBlobAccountKey?: string;
  proxyUserPassword?: string;
}
export interface SecureField {
  id: string;
  name: string;
  value: string;
  configured: boolean;
}
export type InfinityInstanceSettings = DataSourceInstanceSettings<InfinityOptions>;
//#endregion
