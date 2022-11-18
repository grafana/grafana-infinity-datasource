package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/graphql-go/graphql"
	"github.com/graphql-go/handler"
	querySrv "github.com/yesoreyeram/grafana-infinity-datasource/pkg/query"
)

func (host *PluginHost) getRouter() *mux.Router {
	router := mux.NewRouter()
	router.Handle("/graphql", host.getGraphQLHandler()) // NOT IN USE YET
	router.HandleFunc("/reference-data", host.withDatasourceHandlerFunc(GetReferenceDataHandler)).Methods("GET")
	router.HandleFunc("/open-api", host.withDatasourceHandlerFunc(GetOpenAPIHandler)).Methods("GET") // NOT IN USE YET
	router.HandleFunc("/ping", host.withDatasourceHandlerFunc(GetPingHandler)).Methods("GET")
	router.NotFoundHandler = http.HandlerFunc(host.withDatasourceHandlerFunc(defaultHandler))
	return router
}

func (host *PluginHost) withDatasourceHandlerFunc(getHandler func(d *instanceSettings) http.HandlerFunc) func(rw http.ResponseWriter, r *http.Request) {
	return func(rw http.ResponseWriter, r *http.Request) {
		client, err := getInstanceFromRequest(host.im, r)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		h := getHandler(client)
		h.ServeHTTP(rw, r)
	}
}

func (host *PluginHost) getGraphQLHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		client, err := getInstanceFromRequest(host.im, r)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error())) //nolint
			return
		}
		schemaConfig := graphql.SchemaConfig{
			Query: graphql.NewObject(
				graphql.ObjectConfig{
					Name: "RootQuery",
					Fields: graphql.Fields{
						"hello": &graphql.Field{
							Type: graphql.String,
							Args: graphql.FieldConfigArgument{
								"to": &graphql.ArgumentConfig{
									Type:         graphql.String,
									Description:  "Name of the entity to say hello",
									DefaultValue: "World",
								},
							},
							Resolve: func(p graphql.ResolveParams) (any, error) {
								return fmt.Sprintf("Hello %s! 👋", p.Args["to"]), nil
							},
						},
						"query": &graphql.Field{
							Type: graphql.String,
							Args: graphql.FieldConfigArgument{
								"type": &graphql.ArgumentConfig{
									Type:         graphql.String,
									Description:  "query type. Can be one of json, csv, xml",
									DefaultValue: "json",
								},
								"url": &graphql.ArgumentConfig{
									Type:         graphql.String,
									Description:  "URL to be queried",
									DefaultValue: "https://github.com/yesoreyeram/grafana-infinity-datasource/blob/main/testdata/users.json",
								},
							},
							Resolve: func(p graphql.ResolveParams) (any, error) {
								res, _, _, err := client.client.GetResults(querySrv.Query{
									Type: p.Args["type"].(querySrv.QueryType),
									URL:  p.Args["url"].(string),
								}, map[string]string{})
								return res, err
							},
						},
						"time": &graphql.Field{
							Type: graphql.String,
							Args: graphql.FieldConfigArgument{
								"format": &graphql.ArgumentConfig{
									Type:         graphql.String,
									Description:  "Format for the time in golang time layout. https://yourbasic.org/golang/format-parse-string-time-date-example/",
									DefaultValue: "2006-01-02T15:04:05Z07:00",
								},
							},
							Resolve: func(p graphql.ResolveParams) (any, error) {
								return time.Now().Format(p.Args["format"].(string)), nil
							},
						},
					},
				},
			),
		}
		schema, _ := graphql.NewSchema(schemaConfig)
		h := handler.New(&handler.Config{
			Schema:   &schema,
			Pretty:   true,
			GraphiQL: true,
		})
		h.ServeHTTP(w, r)
	})
}

func GetOpenAPIHandler(client *instanceSettings) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		if client.client.Settings.EnableOpenAPI && client.client.Settings.OpenAPIUrl != "" {
			resp, err := client.client.HttpClient.Get(client.client.Settings.OpenAPIUrl)
			if err != nil {
				fmt.Fprintf(rw, "%s", err.Error())
				return
			}
			if resp != nil {
				defer resp.Body.Close()
				b, _ := io.ReadAll(resp.Body)
				fmt.Fprintf(rw, "%s", string(b))
				return
			}
		}
		rw.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(rw, "%s", "invalid open api settings")
	}
}

func GetReferenceDataHandler(client *instanceSettings) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		referenceKeys := []string{}
		for _, k := range client.client.Settings.ReferenceData {
			referenceKeys = append(referenceKeys, k.Name)
		}
		b, err := json.Marshal(referenceKeys)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "%s", err.Error())
			return
		}
		fmt.Fprintf(w, "%s", string(b))
	})
}

func GetPingHandler(client *instanceSettings) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(rw, "%s", "pong")
	}
}

func defaultHandler(client *instanceSettings) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		http.Error(rw, "not a known resource call", http.StatusInternalServerError)
	}
}
