package models

import "errors"

var (
	ErrFailedToGetPluginInstance error = errors.New("failed to get plugin instance")
	ErrInvalidInfinityClient     error = errors.New("invalid infinity client")
)

var (
	ErrUnsuccessfulHTTPResponseStatus error = errors.New("unsuccessful HTTP response code")
	ErrParsingResponseBodyAsJson      error = errors.New("unable to parse response body as JSON")
	ErrCreatingHTTPClient             error = errors.New("error creating HTTP client")
	ErrNotAllowedDangerousHTTPMethods error = errors.New(`only GET and POST HTTP methods are allowed for this data source. To make use other methods, enable the "Allow dangerous HTTP methods" in the data source configuration`)
)

var (
	ErrAuthenticationFailed error = errors.New("authentication failed (HTTP 401)")
	ErrAccessForbidden      error = errors.New("access forbidden (HTTP 403)")
	ErrAuthSuggestion       error = errors.New("the resource requires authentication. To fix this, configure authentication in the data source settings under the Authentication section. Supported methods include: Basic Auth, API Key, Bearer Token, OAuth2, and more")
)

var (
	ErrInvalidConfig               error = errors.New("invalid settings")
	ErrInvalidConfigPassword       error = errors.New("invalid or empty password detected")
	ErrInvalidConfigAPIKey         error = errors.New("invalid API key specified")
	ErrInvalidConfigBearerToken    error = errors.New("invalid or empty bearer token detected")
	ErrInvalidConfigAzBlobAccName  error = errors.New("invalid/empty azure blob account name")
	ErrInvalidConfigAzBlobKey      error = errors.New("invalid/empty azure blob key")
	ErrInvalidConfigAWSAccessKey   error = errors.New("invalid/empty AWS access key")
	ErrInvalidConfigAWSSecretKey   error = errors.New("invalid/empty AWS secret key")
	ErrInvalidConfigHostNotAllowed error = errors.New("requested URL not allowed. To allow this URL, update the data source config in the Security tab, Allowed hosts section")
)

var (
	ErrInvalidAzBlobClient      error = errors.New("invalid azure blob service client. check storage account name and key")
	ErrConnectingAzBlobAccount  error = errors.New("error connecting to azure blob storage")
	ErrInvalidAzBlobStorageName error = errors.New("invalid azure blob storage name")
	ErrAzBlob403                error = errors.New("http 403. check azure blob storage key")
	ErrAzBlob500                error = errors.New("http 500")
)
