package models

import "errors"

var (
	ErrUnsuccessfulHTTPResponseStatus error = errors.New("unsuccessful HTTP response")
	ErrParsingResponseBodyAsJson      error = errors.New("unable to parse response body as JSON")
	ErrCreatingHTTPClient             error = errors.New("error creating HTTP client")
)
