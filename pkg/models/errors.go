package models

import (
	"errors"
	"fmt"
)

var (
	// Config errors
	ErrMissingAllowedHosts error = errors.New("datasource is missing allowed hosts/URLs. Configure it in the datasource settings page for enhanced security")
	// Query errors
	ErrEmptyPaginationListFieldName error = &QueryValidationError{field: "pagination_param_list_field_name"}
	// Misc errors
	ErrUnsuccessfulHTTPResponseStatus error = errors.New("unsuccessful HTTP response")
	ErrParsingResponseBodyAsJson      error = errors.New("unable to parse response body as JSON")
)

type ConfigValidationError struct {
	Field string
}

func (e *ConfigValidationError) Error() string {
	return fmt.Sprintf("invalid or empty field: %s ", e.Field)
}

type QueryValidationError struct {
	field string
}

func (e *QueryValidationError) Error() string {
	return fmt.Sprintf("invalid or empty field: %s ", e.field)
}

type macroError struct {
	message          string
	secondaryMessage string
	macroName        string
	field            string
}

func (e *macroError) Error() string {
	if e.message == "invalid macro" {
		return fmt.Sprintf("invalid %s macro", e.macroName)
	}
	if e.macroName == "" {
		return e.message
	}
	if e.message == "" {
		return fmt.Sprintf("insufficient arguments to %s macro", e.macroName)
	}
	return fmt.Sprintf("error applying macros to %s field%s. %s", e.field, e.secondaryMessage, e.message)
}

type queryParsingError struct {
	message string
	err     error
}

func (e *queryParsingError) Error() string {
	if e.err != nil && e.message == "" {
		return e.Error()
	}
	if e.err != nil {
		return fmt.Errorf("%s.%w", e.message, e.err).Error()
	}
	return e.message
}
