import type { InfinityQuery } from './query.types';
import type { DataSourceInstanceSettings, DataSourceJsonData } from '@grafana/data';

//#region Config
export interface GlobalInfinityQuery {
  name: string;
  id: string;
  query: InfinityQuery;
}
export type AuthType = 'none' | 'basicAuth' | 'apiKey' | 'bearerToken' | 'oauthPassThru' | 'digestAuth' | 'aws' | 'azureBlob' | 'oauth2' | 'azure';
export type OAuth2Type = 'client_credentials' | 'jwt' | 'others';
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
};
export type AWSAuthProps = {
  authType?: 'keys';
  region?: string;
  service?: string;
};

export type AzureCloudType = 'AzureCloud' | 'AzureChinaCloud' | 'AzureUSGovernment';
export type AzureAuthType = 'clientsecret' | 'msi' | 'workloadidentity';

// the keys are used to align with the Grafana Azure SDK
export type AzureProps = {
  azureCloud?: AzureCloudType;
  authType?: AzureAuthType;
  tenantId?: string;
  clientId?: string;
  scopes?: string[];
};
export type InfinityReferenceData = { name: string; data: string };
export type ProxyType = 'none' | 'env' | 'url';
export type UnsecureQueryHandling = 'warn' | 'allow' | 'deny';
export interface InfinityOptions extends DataSourceJsonData {
  auth_method?: AuthType;
  apiKeyKey?: string;
  apiKeyType?: APIKeyType;
  oauth2?: OAuth2Props;
  aws?: AWSAuthProps;
  // azureCredentials is used to align with the Grafana Azure SDK
  azureCredentials?: AzureProps;
  tlsSkipVerify?: boolean;
  tlsAuth?: boolean;
  serverName?: string;
  tlsAuthWithCACert?: boolean;
  global_queries?: GlobalInfinityQuery[];
  timeoutInSeconds?: number;
  proxy_type?: ProxyType;
  proxy_url?: string;
  oauthPassThru?: boolean;
  allowedHosts?: string[];
  refData?: InfinityReferenceData[];
  customHealthCheckEnabled?: boolean;
  customHealthCheckUrl?: string;
  azureBlobAccountUrl?: string;
  azureBlobAccountName?: string;
  unsecuredQueryHandling?: UnsecureQueryHandling;
  enableSecureSocksProxy?: boolean;
  pathEncodedUrlsEnabled?: boolean;
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
  oauth2ClientSecret?: string;
  // azureClientSecret is used to align with the Grafana Azure SDK
  azureClientSecret?: string;
  oauth2JWTPrivateKey?: string;
  azureBlobAccountKey?: string;
}
export interface SecureField {
  id: string;
  name: string;
  value: string;
  configured: boolean;
}
export type InfinityInstanceSettings = DataSourceInstanceSettings<InfinityOptions>;
//#endregion
