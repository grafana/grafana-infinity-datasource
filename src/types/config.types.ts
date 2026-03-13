import type { InfinityQuery } from '@/types';
import type { DataSourceInstanceSettings, DataSourceJsonData } from '@grafana/data';

//#region Config
export interface GlobalInfinityQuery {
  name: string;
  id: string;
  query: InfinityQuery;
}
export type AuthType = 'none' | 'basicAuth' | 'apiKey' | 'bearerToken' | 'oauthPassThru' | 'digestAuth' | 'aws' | 'azureBlob' | 'oauth2';
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
  authHeader?: string;
  tokenTemplate?: string;
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
//#region Vault Config
export type VaultProviderType = 'none' | 'azure-keyvault';
// Future providers: 'hashicorp-vault' | 'aws-secrets-manager' | 'gcp-secret-manager'

export type AzureKeyVaultAuthMethod = 'client-secret';

export interface AzureKeyVaultConfig {
  vaultUrl?: string;
  authMethod?: AzureKeyVaultAuthMethod;
  tenantId?: string;
  clientId?: string;
}

export interface VaultConfig {
  provider?: VaultProviderType;
  cacheTTL?: string;
  azure?: AzureKeyVaultConfig;
  secretMapping?: Record<string, string>;
}
//#endregion

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
  vaultConfig?: VaultConfig;
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
  oauth2JWTPrivateKey?: string;
  azureBlobAccountKey?: string;
  proxyUserPassword?: string;
  vaultAzureClientSecret?: string;
}
export interface SecureField {
  id: string;
  name: string;
  value: string;
  configured: boolean;
}
export type InfinityInstanceSettings = DataSourceInstanceSettings<InfinityOptions>;
//#endregion
