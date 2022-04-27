import { DataSourceJsonData, DataSourceInstanceSettings } from '@grafana/data';
import { InfinityQuery } from './query.types';

//#region Config
export interface GlobalInfinityQuery {
  name: string;
  id: string;
  query: InfinityQuery;
}
export type AuthType = 'none' | 'basicAuth' | 'apiKey' | 'bearerToken' | 'oauthPassThru' | 'oauth2';
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
};
export interface InfinityOptions extends DataSourceJsonData {
  auth_method?: AuthType;
  apiKeyKey?: string;
  apiKeyType?: APIKeyType;
  oauth2?: OAuth2Props;
  tlsSkipVerify?: boolean;
  tlsAuth?: boolean;
  serverName?: string;
  tlsAuthWithCACert?: boolean;
  global_queries?: GlobalInfinityQuery[];
  timeoutInSeconds?: number;
  oauthPassThru?: boolean;
  allowedHosts?: string[];
}

export interface InfinitySecureOptions {
  basicAuthPassword?: string;
  tlsCACert?: string;
  tlsClientCert?: string;
  tlsClientKey?: string;
  apiKeyValue?: string;
  bearerToken?: string;
  oauth2ClientSecret?: string;
  oauth2JWTPrivateKey?: string;
}
export interface SecureField {
  id: string;
  name: string;
  value: string;
  configured: boolean;
}
export type InfinityInstanceSettings = DataSourceInstanceSettings<InfinityOptions>;
//#endregion
