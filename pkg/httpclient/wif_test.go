package httpclient_test

import (
	"context"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/httpclient"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// wifExternalAccountJSON is a minimal external_account credentials JSON used in tests.
// It has deliberately invalid URLs so token exchange does NOT succeed in unit tests –
// we only verify that the HTTP client is wired up correctly.
const wifExternalAccountJSON = `{
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

func TestGetHTTPClient_GoogleWIF_NotConfigured(t *testing.T) {
	settings := models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodNone,
		TimeoutInSeconds:     60,
	}
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}

func TestGetHTTPClient_GoogleWIF_EmptyCredentials(t *testing.T) {
	settings := models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodGoogleWIF,
		TimeoutInSeconds:     60,
		GoogleWIFSettings:    models.GoogleWIFSettings{},
	}
	// With empty credentials the google library should return an error.
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.Error(t, err)
	assert.Nil(t, client)
}

func TestGetHTTPClient_GoogleWIF_InvalidJSON(t *testing.T) {
	settings := models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodGoogleWIF,
		TimeoutInSeconds:     60,
		GoogleWIFSettings: models.GoogleWIFSettings{
			Credentials: `not-valid-json`,
		},
	}
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.Error(t, err)
	assert.Nil(t, client)
}

func TestGetHTTPClient_GoogleWIF_WrongCredentialType(t *testing.T) {
	// Providing a service_account JSON (instead of external_account) must be rejected
	// because the implementation explicitly requires ExternalAccount type.
	serviceAccountJSON := `{
		"type": "service_account",
		"project_id": "my-project",
		"private_key_id": "key-id",
		"private_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA0Z3VS5JJcds3xHn/ygWep4PAtOaE1+lUMCQR7hBEBCaTGVPG\n",
		"client_email": "test@my-project.iam.gserviceaccount.com",
		"token_uri": "https://oauth2.googleapis.com/token"
	}`
	settings := models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodGoogleWIF,
		TimeoutInSeconds:     60,
		GoogleWIFSettings: models.GoogleWIFSettings{
			Credentials: serviceAccountJSON,
		},
	}
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.Error(t, err)
	assert.Nil(t, client)
}

func TestGetHTTPClient_GoogleWIF_ValidCredentials_ClientCreated(t *testing.T) {
	settings := models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodGoogleWIF,
		TimeoutInSeconds:     60,
		GoogleWIFSettings: models.GoogleWIFSettings{
			Credentials: wifExternalAccountJSON,
			Scopes:      []string{"https://www.googleapis.com/auth/cloud-platform"},
		},
	}
	// The HTTP client should be created successfully – no actual token exchange happens here.
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}

func TestGetHTTPClient_GoogleWIF_ValidCredentials_NoScopes(t *testing.T) {
	settings := models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodGoogleWIF,
		TimeoutInSeconds:     60,
		GoogleWIFSettings: models.GoogleWIFSettings{
			Credentials: wifExternalAccountJSON,
		},
	}
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}

func TestGetHTTPClient_GoogleWIF_ValidCredentials_MultipleScopes(t *testing.T) {
	settings := models.InfinitySettings{
		AuthenticationMethod: models.AuthenticationMethodGoogleWIF,
		TimeoutInSeconds:     60,
		GoogleWIFSettings: models.GoogleWIFSettings{
			Credentials: wifExternalAccountJSON,
			Scopes: []string{
				"https://www.googleapis.com/auth/cloud-platform",
				"https://www.googleapis.com/auth/bigquery",
			},
		},
	}
	client, err := httpclient.GetHTTPClient(context.Background(), settings)
	require.NoError(t, err)
	require.NotNil(t, client)
}
