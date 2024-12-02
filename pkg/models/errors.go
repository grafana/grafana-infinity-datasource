package models

import "errors"

var (
	ErrUnsuccessfulHTTPResponseStatus error = errors.New("unsuccessful HTTP response")
	ErrParsingResponseBodyAsJson      error = errors.New("unable to parse response body as JSON")
	ErrMissingAllowedHosts            error = errors.New("datasource is missing allowed hosts/URLs. Configure it in the datasource settings page for enhanced security")
)
