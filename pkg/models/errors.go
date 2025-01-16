package models

import "errors"

var (
	ErrUnsuccessfulHTTPResponseStatus error = errors.New("unsuccessful HTTP response")
	ErrParsingResponseBodyAsJson      error = errors.New("unable to parse response body as JSON")
	ErrCreatingHTTPClient             error = errors.New("error creating HTTP client")
	ErrNonHTTPGetPostRestricted       error = errors.New(`only HTTP verbs GET/POST are allowed for this data source. To make use other methods, enable the "Allow non GET / POST HTTP verbs" in the data source config URL section`)
)
