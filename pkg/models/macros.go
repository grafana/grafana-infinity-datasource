package models

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/gtime"
	m "github.com/grafana/infinity-libs/lib/go/macros"
)

type macroFunc func(string, []string) (string, error)

func getMatches(macroName, input string) ([][]string, error) {
	macroRegex := fmt.Sprintf("\\$__%s\\b(?:\\((.*?)\\))?", macroName)
	rgx, err := regexp.Compile(macroRegex)
	if err != nil {
		return nil, backend.PluginError(err)
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
				return query, backend.DownstreamError(errors.New("insufficient arguments to combineValues macro"))
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
				return query, backend.DownstreamError(errors.New("insufficient arguments to customInterval macro"))
			}
			for argI := range args {
				if argI == len(args)-1 {
					return args[argI], nil
				}
				if argI%2 != 0 {
					duration, err := gtime.ParseDuration(args[argI-1])
					if err != nil {
						return query, backend.DownstreamError(errors.New("invalid customInterval macro"))
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
			return queryString, err
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
				return queryString, err
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
		return query, fmt.Errorf("error applying macros to url field. %s", err.Error())
	}
	query.URL = url

	uql, err := InterPolateMacros(query.UQL, timeRange, pluginContext)
	if err != nil {
		return query, fmt.Errorf("error applying macros to uql field. %s", err.Error())
	}
	query.UQL = uql

	groq, err := InterPolateMacros(query.GROQ, timeRange, pluginContext)
	if err != nil {
		return query, fmt.Errorf("error applying macros to uql field. %s", err.Error())
	}
	query.GROQ = groq

	data, err := InterPolateMacros(query.Data, timeRange, pluginContext)
	if err != nil {
		return query, fmt.Errorf("error applying macros to data field. %s", err.Error())
	}
	query.Data = data

	body, err := InterPolateMacros(query.URLOptions.Body, timeRange, pluginContext)
	if err != nil {
		return query, fmt.Errorf("error applying macros to body data field. %s", err.Error())
	}
	query.URLOptions.Body = body

	graphqlQuery, err := InterPolateMacros(query.URLOptions.BodyGraphQLQuery, timeRange, pluginContext)
	if err != nil {
		return query, fmt.Errorf("error applying macros to body graphql query field. %s", err.Error())
	}
	query.URLOptions.BodyGraphQLQuery = graphqlQuery

	for idx, p := range query.URLOptions.Params {
		up, err := InterPolateMacros(p.Value, timeRange, pluginContext)
		if err != nil {
			return query, fmt.Errorf("error applying macros to url parameter field %s. %s", p.Key, err.Error())
		}
		query.URLOptions.Params[idx].Value = up
	}

	for idx, cc := range query.ComputedColumns {
		up, err := InterPolateMacros(cc.Selector, timeRange, pluginContext)
		if err != nil {
			return query, fmt.Errorf("error applying macros to computed column %s (alias: %s). %s", cc.Selector, cc.Text, err.Error())
		}
		query.ComputedColumns[idx].Selector = up
	}

	exp, err := InterPolateMacros(query.FilterExpression, timeRange, pluginContext)
	if err != nil {
		return query, fmt.Errorf("error applying macros to filter expression. %s", err.Error())
	}
	query.FilterExpression = exp

	return query, nil
}
