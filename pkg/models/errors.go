package models

import "errors"

var (
	ErrUnsuccessfulHTTPResponseStatus 	error = errors.New("unsuccessful HTTP response")
	ErrParsingResponseBodyAsJson      	error = errors.New("unable to parse response body as JSON")
	ErrCreatingHTTPClient             	error = errors.New("error creating HTTP client")
	ErrNotAllowedDangerousHTTPMethods   error = errors.New(`only GET and POST HTTP methods are allowed for this data source. To make use other methods, enable the "Allow dangerous HTTP methods" in the data source configuration`)
)
