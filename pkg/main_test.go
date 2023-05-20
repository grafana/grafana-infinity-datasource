package main_test

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/experimental"
	"github.com/stretchr/testify/require"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/pluginhost"
)

const UPDATE_GOLDEN_DATA = false

func TestQuery(t *testing.T) {
	host := pluginhost.NewDatasource()
	require.NotNil(t, host)
	t.Run("json default url default", func(t *testing.T) {
		server := getServerWithStaticResponse(t, `{"message":"ok"}`, false)
		server.Start()
		defer server.Close()
		res, err := host.QueryData(context.Background(), &backend.QueryDataRequest{
			PluginContext: backend.PluginContext{
				DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{
					JSONData:                []byte(`{"is_mock": true}`),
					DecryptedSecureJSONData: map[string]string{},
				},
			},
			Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
				"type"		:	"json",
				"source"	:	"url",
				"url" 		: 	"%s"
			}`, server.URL))}},
		})
		require.Nil(t, err)
		require.NotNil(t, res)
		resItem := res.Responses["A"]
		experimental.CheckGoldenJSONResponse(t, "testdata", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
	})
	t.Run("csv default url default", func(t *testing.T) {
		server := getServerWithStaticResponse(t, strings.Join([]string{`name,age`, `foo,123`, `bar,456`}, "\n"), false)
		server.Start()
		defer server.Close()
		res, err := host.QueryData(context.Background(), &backend.QueryDataRequest{
			PluginContext: backend.PluginContext{
				DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{
					JSONData:                []byte(`{"is_mock": true}`),
					DecryptedSecureJSONData: map[string]string{},
				},
			},
			Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
				"type"		:	"csv",
				"source"	:	"url",
				"url" 		: 	"%s"
			}`, server.URL))}},
		})
		require.Nil(t, err)
		require.NotNil(t, res)
		resItem := res.Responses["A"]
		experimental.CheckGoldenJSONResponse(t, "testdata", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
	})
	t.Run("csv backend url default", func(t *testing.T) {
		server := getServerWithStaticResponse(t, strings.Join([]string{`name,age`, `foo,123`, `bar,456`}, "\n"), false)
		server.Start()
		defer server.Close()
		res, err := host.QueryData(context.Background(), &backend.QueryDataRequest{
			PluginContext: backend.PluginContext{
				DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{
					JSONData:                []byte(`{"is_mock": true}`),
					DecryptedSecureJSONData: map[string]string{},
				},
			},
			Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
				"type"		:	"csv",
				"source"	:	"url",
				"parser" 	: 	"backend",
				"url" 		: 	"%s"
			}`, server.URL))}},
		})
		require.Nil(t, err)
		require.NotNil(t, res)
		resItem := res.Responses["A"]
		experimental.CheckGoldenJSONResponse(t, "testdata", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
	})
	t.Run("csv backend inline default", func(t *testing.T) {
		res, err := host.QueryData(context.Background(), &backend.QueryDataRequest{
			PluginContext: backend.PluginContext{
				DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{
					JSONData:                []byte(`{"is_mock": true}`),
					DecryptedSecureJSONData: map[string]string{},
				},
			},
			Queries: []backend.DataQuery{{RefID: "A", JSON: []byte((`{ 
				"type"		:	"csv",
				"source"	:	"inline",
				"parser" 	: 	"backend",
				"data" 		: 	"user,age\n1,1\n2,2\n3,3"
			}`))}},
		})
		require.Nil(t, err)
		require.NotNil(t, res)
		resItem := res.Responses["A"]
		experimental.CheckGoldenJSONResponse(t, "testdata", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
	})
	t.Run("xml backend url default", func(t *testing.T) {
		server := getServerWithStaticResponse(t, `<?xml version="1.0" encoding="UTF-8" ?>
		<users>
			<user>
				<name>foo</name>
				<age>123</age>
			</user>
			<user>
				<name>bar</name>
				<age>456</age>
			</user>
		</users>`, false)
		server.Start()
		defer server.Close()
		res, err := host.QueryData(context.Background(), &backend.QueryDataRequest{
			PluginContext: backend.PluginContext{
				DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{
					JSONData:                []byte(`{"is_mock": true}`),
					DecryptedSecureJSONData: map[string]string{},
				},
			},
			Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
				"type"			:	"xml",
				"source"		:	"url",
				"parser" 		: 	"backend",
				"root_selector" : 	"users.user",
				"url" 			: 	"%s"
			}`, server.URL))}},
		})
		require.Nil(t, err)
		require.NotNil(t, res)
		resItem := res.Responses["A"]
		experimental.CheckGoldenJSONResponse(t, "testdata", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
	})
	t.Run("scenario azure cost management", func(t *testing.T) {
		server := getServerWithStaticResponse(t, "./testdata/input/azure-cost-management-daily.json", true)
		server.Start()
		defer server.Close()
		res, err := host.QueryData(context.Background(), &backend.QueryDataRequest{
			PluginContext: backend.PluginContext{
				DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{
					JSONData:                []byte(`{"is_mock": true}`),
					DecryptedSecureJSONData: map[string]string{},
				},
			},
			Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
				"type"			: "json",
				"source"		: "url",
				"parser"		: "backend",
				"url"			:  "%s",
				"root_selector" : "properties.rows",
				"columns": [
					{
						"selector": "1",
						"text": "cost",
						"type": "number"
					},
					{
						"selector": "2",
						"text": "timestamp",
						"timestampFormat": "20060102",
						"type": "timestamp"
					}
				]
			}`, server.URL))}},
		})
		require.Nil(t, err)
		require.NotNil(t, res)
		resItem := res.Responses["A"]
		experimental.CheckGoldenJSONResponse(t, "testdata", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
	})
	t.Run("transformations limit default", func(t *testing.T) {
		res, err := host.QueryData(context.Background(), &backend.QueryDataRequest{
			PluginContext: backend.PluginContext{
				DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{
					JSONData:                []byte(`{"is_mock": true}`),
					DecryptedSecureJSONData: map[string]string{},
				},
			},
			Queries: []backend.DataQuery{
				{
					RefID: "A",
					JSON: []byte((`{ 
						"type"		:	"csv",
						"source"	:	"inline",
						"parser" 	: 	"backend",
						"data" 		: 	"user,age\n1,1\n2,2\n3,3"
					}`)),
				},
				{
					RefID: "B",
					JSON: []byte((`{ 
						"type"		:	"csv",
						"source"	:	"inline",
						"parser" 	: 	"backend",
						"data" 		: 	"user,age\n4,4\n5,5\n6,6"
					}`)),
				},
				{
					RefID: "C",
					JSON: []byte((`{ 
						"type"				:	"transformations",
						"transformations" 	: 	[
							{ "type" : "limit", "limit" : { "limitField" : 2 } }
						]
					}`)),
				},
			},
		})
		require.Nil(t, err)
		require.NotNil(t, res)
		require.Equal(t, 2, len(res.Responses))
		for k := range res.Responses {
			resItem := res.Responses[k]
			experimental.CheckGoldenJSONResponse(t, "testdata", strings.ReplaceAll(t.Name(), "TestQuery/", "")+"_"+k, &resItem, UPDATE_GOLDEN_DATA)
		}
	})
}

func getServerWithStaticResponse(t *testing.T, content string, isFile bool) *httptest.Server {
	t.Helper()
	server := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		default:
			if isFile {
				filecontent, err := os.ReadFile(content)
				require.Nil(t, err)
				_, err = w.Write(filecontent)
				require.Nil(t, err)
				return
			}
			_, _ = w.Write([]byte(content))
		}
	}))
	listener, err := net.Listen("tcp", "127.0.0.1:8080")
	require.Nil(t, err)
	server.Listener.Close()
	server.Listener = listener
	return server
}
