import type { InfinityQuery } from './query.types';
import type { DataSourceInstanceSettings, DataSourceJsonData } from '@grafana/data';
import type { AuthType, APIKeyType, AWSAuthProps, OAuth2Props, InfinityReferenceData } from './config';

//#region Config
export interface GlobalInfinityQuery {
  name: string;
  id: string;
  query: InfinityQuery;
}

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
  oauthPassThru?: boolean;
  allowedHosts?: string[];
  refData?: InfinityReferenceData[];
  enableOpenApi?: boolean;
  openApiVersion?: 'open-api-2.0';
  openApiUrl?: string;
  openAPIBaseURL?: string;
  customHealthCheckEnabled?: boolean;
  customHealthCheckUrl?: string;
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
}
export interface SecureField {
  id: string;
  name: string;
  value: string;
  configured: boolean;
}
export type InfinityInstanceSettings = DataSourceInstanceSettings<InfinityOptions>;
//#endregion
