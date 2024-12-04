package models

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/gtime"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/errorsource"
	m "github.com/grafana/infinity-libs/lib/go/macros"
)

type macroFunc func(string, []string) (string, error)

func getMatches(macroName, input string) ([][]string, error) {
	macroRegex := fmt.Sprintf("\\$__%s\\b(?:\\((.*?)\\))?", macroName)
	rgx, err := regexp.Compile(macroRegex)
	if err != nil {
		return nil, errorsource.PluginError(err, false)
	}
	return rgx.FindAllStringSubmatch(input, -1), nil
}

func escapeKeywords(input string) string {
	input = strings.ReplaceAll(input, "__comma", ",")
	input = strings.ReplaceAll(input, "__space", " ")
	input = strings.ReplaceAll(input, "__open", "(")
	input = strings.ReplaceAll(input, "__close", ")")
	return input
}

// InterPolateMacros interpolate macros on a given string
func InterPolateMacros(queryString string, timeRange backend.TimeRange, pluginContext backend.PluginContext) (string, error) {
	timeRangeInMilliSeconds := timeRange.To.UnixMilli() - timeRange.From.UnixMilli()
	macros := map[string]macroFunc{
		"combineValues": func(query string, args []string) (string, error) {
			if len(args) <= 3 {
				return query, errorsource.DownstreamError(&macroError{macroName: "combineValues"}, false)
			}
			if len(args) == 4 && args[3] == "*" {
				return "", nil
			}
			outs := []string{}
			prefix := escapeKeywords(args[0])
			suffix := escapeKeywords(args[1])
			joinBy := escapeKeywords(args[2])
			for idx, arg := range args {
				if idx <= 2 {
					continue
				}
				outs = append(outs, fmt.Sprintf("%s%s%s", prefix, arg, suffix))
			}
			return strings.Join(outs, joinBy), nil
		},
		"customInterval": func(query string, args []string) (string, error) {
			if len(args) == 0 {
				return query, errorsource.DownstreamError(&macroError{macroName: "customInterval"}, false)
			}
			for argI := range args {
				if argI == len(args)-1 {
					return args[argI], nil
				}
				if argI%2 != 0 {
					duration, err := gtime.ParseDuration(args[argI-1])
					if err != nil {
						return query, errorsource.DownstreamError(&macroError{message: "invalid macro", macroName: "customInterval"}, false)
					}
					if timeRangeInMilliSeconds <= duration.Milliseconds() {
						return args[argI], nil
					}
				}
			}
			return query, nil
		},
	}
	for key, macro := range macros {
		matches, err := getMatches(key, queryString)
		if err != nil {
			return queryString, errorsource.PluginError(err, false)
		}
		for _, match := range matches {
			if len(match) == 0 {
				continue
			}
			args := []string{}
			if len(match) > 1 {
				args = strings.Split(match[1], ",")
			}
			res, err := macro(queryString, args)
			if err != nil {
				return queryString, errorsource.PluginError(err, false)
			}
			queryString = strings.Replace(queryString, match[0], res, -1)
		}
	}
	queryString, err := m.ApplyMacros(queryString, m.Args{TimeRange: timeRange, User: pluginContext.User})
	if err != nil {
		return queryString, err
	}
	return strings.Trim(queryString, " "), nil
}

// ApplyMacros interpolates macros on a given infinity Query
func ApplyMacros(ctx context.Context, query Query, timeRange backend.TimeRange, pluginContext backend.PluginContext) (Query, error) {
	url, err := InterPolateMacros(query.URL, timeRange, pluginContext)
	if err != nil {
		return query, &macroError{message: err.Error(), field: "url"}
	}
	query.URL = url

	uql, err := InterPolateMacros(query.UQL, timeRange, pluginContext)
	if err != nil {
		return query, &macroError{message: err.Error(), field: "uql"}
	}
	query.UQL = uql

	groq, err := InterPolateMacros(query.GROQ, timeRange, pluginContext)
	if err != nil {
		return query, &macroError{message: err.Error(), field: "groq"}
	}
	query.GROQ = groq

	data, err := InterPolateMacros(query.Data, timeRange, pluginContext)
	if err != nil {
		return query, &macroError{message: err.Error(), field: "data"}
	}
	query.Data = data

	body, err := InterPolateMacros(query.URLOptions.Body, timeRange, pluginContext)
	if err != nil {
		return query, &macroError{message: err.Error(), field: "body data"}
	}
	query.URLOptions.Body = body

	graphqlQuery, err := InterPolateMacros(query.URLOptions.BodyGraphQLQuery, timeRange, pluginContext)
	if err != nil {
		return query, &macroError{message: err.Error(), field: "body graphql"}
	}
	query.URLOptions.BodyGraphQLQuery = graphqlQuery

	for idx, p := range query.URLOptions.Params {
		up, err := InterPolateMacros(p.Value, timeRange, pluginContext)
		if err != nil {
			return query, &macroError{message: err.Error(), field: "url parameter", secondaryMessage: " " + p.Key}
		}
		query.URLOptions.Params[idx].Value = up
	}

	for idx, cc := range query.ComputedColumns {
		up, err := InterPolateMacros(cc.Selector, timeRange, pluginContext)
		if err != nil {
			return query, &macroError{message: err.Error(), field: "computed column", secondaryMessage: fmt.Sprintf(" %s (alias: %s)", cc.Selector, cc.Text)}
		}
		query.ComputedColumns[idx].Selector = up
	}

	exp, err := InterPolateMacros(query.FilterExpression, timeRange, pluginContext)
	if err != nil {
		return query, &macroError{message: err.Error(), field: "filter expression"}
	}
	query.FilterExpression = exp

	return query, nil
}
