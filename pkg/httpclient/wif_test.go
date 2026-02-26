package httpclient_test

import (
	"context"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/httpclient"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// externalAccountJSON is a minimal external_account credentials JSON used in tests.
// It has deliberately unreachable URLs so token exchange does NOT succeed in unit tests –
// we only verify that the HTTP client is wired up correctly.
const externalAccountJSON = `{
  "type": "external_account",
  "audience": "//iam.googleapis.com/projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider",
  "subject_token_type": "urn:ietf:params:oauth:token-type:jwt",
  "token_url": "https://sts.googleapis.com/v1/token",
  "credential_source": {
    "url": "http://localhost:0/token",
    "format": {
      "type": "json",
      "subject_token_field_name": "access_token"
    }
  }
}`

// externalAccountJSONAWS is an external_account credentials JSON that uses AWS credentials
// as the external identity source. This demonstrates multi-provider support: any workload
// with AWS credentials can exchange them for Google access tokens.
const externalAccountJSONAWS = `{
  "type": "external_account",
  "audience": "//iam.googleapis.com/projects/123/locations/global/workloadIdentityPools/aws-pool/providers/aws-provider",
  "subject_token_type": "urn:ietf:params:aws:token-type:aws4_request",
  "token_url": "https://sts.googleapis.com/v1/token",
  "credential_source": {
    "environment_id": "aws1",
    "region_url": "http://169.254.169.254/latest/meta-data/placement/availability-zone",
    "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials",
    "regional_cred_verification_url": "https://sts.{region}.amazonaws.com?Action=GetCallerIdentity&Version=2011-06-15"
  }
}`

func oauthExternalAccountSettings(credentialsJSON string, scopes []string) models.InfinitySettings {
	return models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodOAuth,
		TimeoutInSeconds:     60,
		OAuth2Settings: models.OAuth2Settings{
			OAuth2Type:      models.AuthOAuthExternalAccount,
			CredentialsJSON: credentialsJSON,
			Scopes:          scopes,
		},
	}
}

func TestGetHTTPClient_OAuthExternalAccount_NotConfigured(t *testing.T) {
	settings := models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodNone,
		TimeoutInSeconds:     60,
	}
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}

func TestGetHTTPClient_OAuthExternalAccount_OtherOAuth2TypeIgnored(t *testing.T) {
	// Selecting oauth2 with client_credentials type should NOT trigger external_account path.
	settings := models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodOAuth,
		TimeoutInSeconds:     60,
		OAuth2Settings: models.OAuth2Settings{
			OAuth2Type: models.AuthOAuthTypeClientCredentials,
		},
	}
	// No error even with empty credentials – client_credentials path is attempted.
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}

func TestGetHTTPClient_OAuthExternalAccount_EmptyCredentials(t *testing.T) {
	settings := oauthExternalAccountSettings("", nil)
	// With empty credentials the google library should return an error.
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.Error(t, err)
	assert.Nil(t, client)
}

func TestGetHTTPClient_OAuthExternalAccount_InvalidJSON(t *testing.T) {
	settings := oauthExternalAccountSettings(`not-valid-json`, nil)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.Error(t, err)
	assert.Nil(t, client)
}

func TestGetHTTPClient_OAuthExternalAccount_WrongCredentialType(t *testing.T) {
	// Providing a service_account JSON (instead of external_account) must be rejected
	// because the implementation explicitly requires the ExternalAccount type.
	serviceAccountJSON := `{
		"type": "service_account",
		"project_id": "my-project",
		"private_key_id": "key-id",
		"private_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA0Z3VS5JJcds3xHn/ygWep4PAtOaE1+lUMCQR7hBEBCaTGVPG\n",
		"client_email": "test@my-project.iam.gserviceaccount.com",
		"token_uri": "https://oauth2.googleapis.com/token"
	}`
	settings := oauthExternalAccountSettings(serviceAccountJSON, nil)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.Error(t, err)
	assert.Nil(t, client)
}

func TestGetHTTPClient_OAuthExternalAccount_ValidCredentials_OIDCProvider(t *testing.T) {
	// OIDC URL credential source – represents Google WIF for any OIDC/SAML provider
	// (GitHub Actions, Azure AD, Kubernetes SA tokens, etc.).
	settings := oauthExternalAccountSettings(externalAccountJSON, []string{"https://www.googleapis.com/auth/cloud-platform"})
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}

func TestGetHTTPClient_OAuthExternalAccount_ValidCredentials_NoScopes(t *testing.T) {
	settings := oauthExternalAccountSettings(externalAccountJSON, nil)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}

func TestGetHTTPClient_OAuthExternalAccount_ValidCredentials_MultipleScopes(t *testing.T) {
	scopes := []string{
		"https://www.googleapis.com/auth/cloud-platform",
		"https://www.googleapis.com/auth/bigquery",
	}
	settings := oauthExternalAccountSettings(externalAccountJSON, scopes)
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}

func TestGetHTTPClient_OAuthExternalAccount_ValidCredentials_AWSProvider(t *testing.T) {
	// AWS credential source – represents cross-cloud auth where an AWS workload
	// presents its AWS credentials to Google STS to get a Google access token.
	settings := oauthExternalAccountSettings(externalAccountJSONAWS, []string{"https://www.googleapis.com/auth/cloud-platform"})
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}
