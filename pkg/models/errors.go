package models

import (
	"errors"
	"fmt"
)

var (
	ErrUnsuccessfulHTTPResponseStatus 	error = errors.New("unsuccessful HTTP response")
	ErrParsingResponseBodyAsJson      	error = errors.New("unable to parse response body as JSON")
	ErrCreatingHTTPClient             	error = errors.New("error creating HTTP client")
	ErrNotAllowedDangerousHTTPMethods   error = errors.New(`only GET and POST HTTP methods are allowed for this data source. To make use other methods, enable the "Allow dangerous HTTP methods" in the data source configuration`)
	ErrURLNotAllowed                    error = errors.New("requested URL is not allowed. To allow this URL, " +
		"update the datasource config Security -> Allowed Hosts section")
)

func ErrHostNameDenied(hostName string) error {
	return fmt.Errorf("hostname denied via grafana config. hostname %s", hostName)
}

func ErrHostNameNotAllowed(hostName string) error {
	return fmt.Errorf("hostname not allowed via grafana config. hostname %s", hostName)
}
