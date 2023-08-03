import { z } from 'zod';

const zAuthTypeNone = z.literal('none');
const zAuthTypeBasicAuth = z.literal('basicAuth');
const zAuthTypeApiKey = z.literal('apiKey');
const zAuthTypeBearerToken = z.literal('bearerToken');
const zAuthTypeOAuthPassThrough = z.literal('oauthPassThru');
const zAuthTypeDigestAuth = z.literal('digestAuth');
const zAuthTypeAWS = z.literal('aws');
const zAuthTypeOAuth2 = z.literal('oauth2');
const zAuthType = z.union([zAuthTypeNone, zAuthTypeBasicAuth, zAuthTypeApiKey, zAuthTypeBearerToken, zAuthTypeOAuthPassThrough, zAuthTypeDigestAuth, zAuthTypeAWS, zAuthTypeOAuth2]);

const zOAuth2Type = z.union([z.literal('client_credentials'), z.literal('jwt'), z.literal('others')]);

const zAPIKeyType = z.union([z.literal('header'), z.literal('query')]);

const zInfinityReferenceData = z.object({ name: z.string(), data: z.string() });

const zOAuth2Props = z.object({
  oauth2_type: zOAuth2Type.optional(),
  client_id: z.string().optional(),
  email: z.string().optional(),
  private_key_id: z.string().optional(),
  subject: z.string().optional(),
  token_url: z.string().optional(),
  scopes: z.string().array().optional(),
  authStyle: z.number().min(0).max(2).optional(),
});

const zAWSAuthProps = z.object({
  authType: z.literal('keys').optional(),
  region: z.string().optional(),
  service: z.string().optional(),
});

const zSecureField = z.object;

export type InfinityReferenceData = z.infer<typeof zInfinityReferenceData>;
export type AuthType = z.infer<typeof zAuthType>;
export type OAuth2Type = z.infer<typeof zOAuth2Type>;
export type APIKeyType = z.infer<typeof zAPIKeyType>;
export type AWSAuthProps = z.infer<typeof zAWSAuthProps>;
export type OAuth2Props = z.infer<typeof zOAuth2Props>;
