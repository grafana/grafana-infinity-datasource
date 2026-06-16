package testsuite_test

import (
	"context"
	"fmt"
	"strings"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/experimental"
	"github.com/stretchr/testify/require"
)

func TestParsers(t *testing.T) {
	t.Run("parsers", func(t *testing.T) {
		t.Run("json", func(t *testing.T) {
			t.Run("simple", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{ 
							"type"		:	"json",
							"source"	:	"inline",
							"data"		:   "[{\"name\":\"foo\",\"age\":123},{\"name\":\"bar\",\"age\":456}]",
							"parser" 	: 	"simple"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, `[{"name":"foo","age":123},{"name":"bar","age":456}]`)
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
							"type"		:	"json",
							"source"	:	"url",
							"parser" 	: 	"simple",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("uql", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{ 
							"type"		:	"json",
							"source"	:	"inline",
							"data"		:   "[{\"name\":\"foo\",\"age\":123},{\"name\":\"bar\",\"age\":456}]",
							"parser" 	: 	"uql",
							"uql"		:   "parse-json"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, `[{"name":"foo","age":123},{"name":"bar","age":456}]`)
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
							"type"		:	"json",
							"source"	:	"url",
							"parser" 	: 	"uql",
							"uql"		:   "parse-json",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("groq", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{ 
							"type"		:	"json",
							"source"	:	"inline",
							"data"		:   "[{\"name\":\"foo\",\"age\":123},{\"name\":\"bar\",\"age\":456}]",
							"parser" 	: 	"groq",
							"groq"		:   "*"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, `[{"name":"foo","age":123},{"name":"bar","age":456}]`)
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
							"type"		:	"json",
							"source"	:	"url",
							"parser" 	: 	"groq",
							"groq"		:   "*",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("backend", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{ 
							"type"				:	"json",
							"source"			:	"inline",
							"data"				:   "[{\"name\":\"foo\",\"age\":123},{\"name\":\"bar\",\"age\":456}]",
							"parser" 			: 	"backend",
							"root_selector"		:   "$"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, `[{"name":"foo","age":123},{"name":"bar","age":456}]`)
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
							"type"				:	"json",
							"source"			:	"url",
							"parser" 			: 	"backend",
							"root_selector"		:   "$",
							"url" 				: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("jq-backend", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{ 
							"type"				:	"json",
							"source"			:	"inline",
							"data"				:   "[{\"name\":\"foo\",\"age\":123},{\"name\":\"bar\",\"age\":456}]",
							"parser" 			: 	"jq-backend",
							"root_selector"		:   ".[]"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, `[{"name":"foo","age":123},{"name":"bar","age":456}]`)
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
							"type"				:	"json",
							"source"			:	"url",
							"parser" 			: 	"jq-backend",
							"root_selector"		:   ".[]",
							"url" 				: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
		})
		t.Run("csv", func(t *testing.T) {
			t.Run("simple", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{ 
							"type"		:	"csv",
							"source"	:	"inline",
							"data"		:   "name,age\nfoo,123\nbar,456",
							"parser" 	: 	"simple"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "name,age\nfoo,123\nbar,456")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"		:	"csv",
							"source"	:	"url",
							"parser" 	: 	"simple",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("uql", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"		:	"csv",
							"source"	:	"inline",
							"data"		:   "name,age\nfoo,123\nbar,456",
							"parser" 	: 	"uql",
							"uql"		:   "parse-csv"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "name,age\nfoo,123\nbar,456")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"		:	"csv",
							"source"	:	"url",
							"parser" 	: 	"uql",
							"uql"		:   "parse-csv",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("groq", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"		:	"csv",
							"source"	:	"inline",
							"data"		:   "name,age\nfoo,123\nbar,456",
							"parser" 	: 	"groq",
							"groq"		:   "*"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "name,age\nfoo,123\nbar,456")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"		:	"csv",
							"source"	:	"url",
							"parser" 	: 	"groq",
							"groq"		:   "*",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("backend", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"				:	"csv",
							"source"			:	"inline",
							"data"				:   "name,age\nfoo,123\nbar,456",
							"parser" 			: 	"backend",
							"root_selector"		:   "$"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "name,age\nfoo,123\nbar,456")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"				:	"csv",
							"source"			:	"url",
							"parser" 			: 	"backend",
							"root_selector"		:   "$",
							"url" 				: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("jq-backend", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"				:	"csv",
							"source"			:	"inline",
							"data"				:   "name,age\nfoo,123\nbar,456",
							"parser" 			: 	"jq-backend",
							"root_selector"		:   ".[]"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "name,age\nfoo,123\nbar,456")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"				:	"csv",
							"source"			:	"url",
							"parser" 			: 	"jq-backend",
							"root_selector"		:   ".[]",
							"url" 				: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
		})
		t.Run("tsv", func(t *testing.T) {
			t.Run("simple", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{ 
							"type"		:	"tsv",
							"source"	:	"inline",
							"data"		:   "name\tage\nfoo\t123\nbar\t456",
							"parser" 	: 	"simple"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "name\tage\nfoo\t123\nbar\t456")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"		:	"tsv",
							"source"	:	"url",
							"parser" 	: 	"simple",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("uql", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"		:	"tsv",
							"source"	:	"inline",
							"data"		:   "name\tage\nfoo\t123\nbar\t456",
							"parser" 	: 	"uql",
							"uql"		:   "parse-tsv"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "name\tage\nfoo\t123\nbar\t456")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"		:	"tsv",
							"source"	:	"url",
							"parser" 	: 	"uql",
							"uql"		:   "parse-tsv",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("groq", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"		:	"tsv",
							"source"	:	"inline",
							"data"		:   "name\tage\nfoo\t123\nbar\t456",
							"parser" 	: 	"groq",
							"groq"		:   "*"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "name\tage\nfoo\t123\nbar\t456")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"		:	"tsv",
							"source"	:	"url",
							"parser" 	: 	"groq",
							"groq"		:   "*",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("backend", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"				:	"tsv",
							"source"			:	"inline",
							"data"				:   "name\tage\nfoo\t123\nbar\t456",
							"parser" 			: 	"backend",
							"root_selector"		:   "$"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "name\tage\nfoo\t123\nbar\t456")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"				:	"tsv",
							"source"			:	"url",
							"parser" 			: 	"backend",
							"root_selector"		:   "$",
							"url" 				: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("jq-backend", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"				:	"tsv",
							"source"			:	"inline",
							"data"				:   "name\tage\nfoo\t123\nbar\t456",
							"parser" 			: 	"jq-backend",
							"root_selector"		:   ".[]"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "name\tage\nfoo\t123\nbar\t456")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"				:	"tsv",
							"source"			:	"url",
							"parser" 			: 	"jq-backend",
							"root_selector"		:   ".[]",
							"url" 				: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
		})
		t.Run("xml", func(t *testing.T) {
			t.Run("simple", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{ 
							"type"		:	"xml",
							"source"	:	"inline",
							"data"		:   "<?xml version=\"1.0\" encoding=\"UTF-8\"?><root><row><name>foo</name><age>123</age></row><row><name>bar</name><age>456</age></row></root>",
							"parser" 	: 	"simple"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "<?xml version=\"1.0\" encoding=\"UTF-8\"?><root><row><name>foo</name><age>123</age></row><row><name>bar</name><age>456</age></row></root>")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"		:	"xml",
							"source"	:	"url",
							"parser" 	: 	"simple",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("uql", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"		:	"xml",
							"source"	:	"inline",
							"data"		:   "<?xml version=\"1.0\" encoding=\"UTF-8\"?><root><row><name>foo</name><age>123</age></row><row><name>bar</name><age>456</age></row></root>",
							"parser" 	: 	"uql",
							"uql"		:   "parse-xml"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "<?xml version=\"1.0\" encoding=\"UTF-8\"?><root><row><name>foo</name><age>123</age></row><row><name>bar</name><age>456</age></row></root>")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"		:	"xml",
							"source"	:	"url",
							"parser" 	: 	"uql",
							"uql"		:   "parse-xml",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("groq", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"		:	"xml",
							"source"	:	"inline",
							"data"		:   "<?xml version=\"1.0\" encoding=\"UTF-8\"?><root><row><name>foo</name><age>123</age></row><row><name>bar</name><age>456</age></row></root>",
							"parser" 	: 	"groq",
							"groq"		:   "*"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "<?xml version=\"1.0\" encoding=\"UTF-8\"?><root><row><name>foo</name><age>123</age></row><row><name>bar</name><age>456</age></row></root>")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"		:	"xml",
							"source"	:	"url",
							"parser" 	: 	"groq",
							"groq"		:   "*",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("backend", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"				:	"xml",
							"source"			:	"inline",
							"data"				:   "<?xml version=\"1.0\" encoding=\"UTF-8\"?><root><row><name>foo</name><age>123</age></row><row><name>bar</name><age>456</age></row></root>",
							"parser" 			: 	"backend",
							"root_selector"		:   "$.root.row"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "<?xml version=\"1.0\" encoding=\"UTF-8\"?><root><row><name>foo</name><age>123</age></row><row><name>bar</name><age>456</age></row></root>")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"				:	"xml",
							"source"			:	"url",
							"parser" 			: 	"backend",
							"root_selector"		:   "$.root.row",
							"url" 				: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("jq-backend", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"				:	"xml",
							"source"			:	"inline",
							"data"				:   "<?xml version=\"1.0\" encoding=\"UTF-8\"?><root><row><name>foo</name><age>123</age></row><row><name>bar</name><age>456</age></row></root>",
							"parser" 			: 	"jq-backend",
							"root_selector"		:   ".root | .row"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "<?xml version=\"1.0\" encoding=\"UTF-8\"?><root><row><name>foo</name><age>123</age></row><row><name>bar</name><age>456</age></row></root>")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"				:	"xml",
							"source"			:	"url",
							"parser" 			: 	"jq-backend",
							"root_selector"		:   ".root | .row",
							"url" 				: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
		})
		t.Run("html", func(t *testing.T) {
			t.Run("simple", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{ 
							"type"		:	"html",
							"source"	:	"inline",
							"data"		:   "<html><head></head><body><table class=\"table table-bordered table-hover table-condensed\"><thead><tr><th title=\"Field #1\">name</th><th title=\"Field #2\">age</th></tr></thead><tbody><tr><td>foo</td><td align=\"right\">123</td></tr><tr><td>bar</td><td align=\"right\">456</td></tr></tbody></table></body></html>",
							"parser" 	: 	"simple"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "<html><head></head><body><table class=\"table table-bordered table-hover table-condensed\"><thead><tr><th title=\"Field #1\">name</th><th title=\"Field #2\">age</th></tr></thead><tbody><tr><td>foo</td><td align=\"right\">123</td></tr><tr><td>bar</td><td align=\"right\">456</td></tr></tbody></table></body></html>")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"		:	"html",
							"source"	:	"url",
							"parser" 	: 	"simple",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("uql", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"		:	"html",
							"source"	:	"inline",
							"data"		:   "<html><head></head><body><table class=\"table table-bordered table-hover table-condensed\"><thead><tr><th title=\"Field #1\">name</th><th title=\"Field #2\">age</th></tr></thead><tbody><tr><td>foo</td><td align=\"right\">123</td></tr><tr><td>bar</td><td align=\"right\">456</td></tr></tbody></table></body></html>",
							"parser" 	: 	"uql",
							"uql"		:   "parse-html"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "<html><head></head><body><table class=\"table table-bordered table-hover table-condensed\"><thead><tr><th title=\"Field #1\">name</th><th title=\"Field #2\">age</th></tr></thead><tbody><tr><td>foo</td><td align=\"right\">123</td></tr><tr><td>bar</td><td align=\"right\">456</td></tr></tbody></table></body></html>")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"		:	"html",
							"source"	:	"url",
							"parser" 	: 	"uql",
							"uql"		:   "parse-html",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("groq", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"		:	"html",
							"source"	:	"inline",
							"data"		:   "<html><head></head><body><table class=\"table table-bordered table-hover table-condensed\"><thead><tr><th title=\"Field #1\">name</th><th title=\"Field #2\">age</th></tr></thead><tbody><tr><td>foo</td><td align=\"right\">123</td></tr><tr><td>bar</td><td align=\"right\">456</td></tr></tbody></table></body></html>",
							"parser" 	: 	"groq",
							"groq"		:   "*"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "<html><head></head><body><table class=\"table table-bordered table-hover table-condensed\"><thead><tr><th title=\"Field #1\">name</th><th title=\"Field #2\">age</th></tr></thead><tbody><tr><td>foo</td><td align=\"right\">123</td></tr><tr><td>bar</td><td align=\"right\">456</td></tr></tbody></table></body></html>")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"		:	"html",
							"source"	:	"url",
							"parser" 	: 	"groq",
							"groq"		:   "*",
							"url" 		: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("backend", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"				:	"html",
							"source"			:	"inline",
							"data"				:   "<html><head></head><body><table class=\"table table-bordered table-hover table-condensed\"><thead><tr><th title=\"Field #1\">name</th><th title=\"Field #2\">age</th></tr></thead><tbody><tr><td>foo</td><td align=\"right\">123</td></tr><tr><td>bar</td><td align=\"right\">456</td></tr></tbody></table></body></html>",
							"parser" 			: 	"backend",
							"columns": [
								{ 	"selector": "td.0", 			"text": "name", 	"type": "string" 	},
								{	"selector": "td.1.#content",	"text": "age",		"type": "number"	}
							],
							"root_selector"		:   "$.html.body.table.tbody.tr"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "<html><head></head><body><table class=\"table table-bordered table-hover table-condensed\"><thead><tr><th title=\"Field #1\">name</th><th title=\"Field #2\">age</th></tr></thead><tbody><tr><td>foo</td><td align=\"right\">123</td></tr><tr><td>bar</td><td align=\"right\">456</td></tr></tbody></table></body></html>")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"				:	"html",
							"source"			:	"url",
							"parser" 			: 	"backend",
							"root_selector"		:   "$.html.body.table.tbody.tr",
							"columns": [
								{ 	"selector": "td.0", 			"text": "name", 	"type": "string" 	},
								{	"selector": "td.1.#content",	"text": "age",		"type": "number"	}
							],
							"url" 				: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
			t.Run("jq-backend", func(t *testing.T) {
				t.Run("inline", func(t *testing.T) {
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
							"type"				:	"html",
							"source"			:	"inline",
							"data"				:   "<html><head></head><body><table class=\"table table-bordered table-hover table-condensed\"><thead><tr><th title=\"Field #1\">name</th><th title=\"Field #2\">age</th></tr></thead><tbody><tr><td>foo</td><td align=\"right\">123</td></tr><tr><td>bar</td><td align=\"right\">456</td></tr></tbody></table></body></html>",
							"parser" 			: 	"jq-backend",
							"columns": [
								{ 	"selector": "td.0", 			"text": "name", 	"type": "string" 	},
								{	"selector": "td.1.#content",	"text": "age",		"type": "number"	}
							],
							"root_selector"		:   ".html.body.table.tbody.tr"
						}`)}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
				t.Run("url", func(t *testing.T) {
					server := getServerWithGZipCompressedResponse(t, "<html><head></head><body><table class=\"table table-bordered table-hover table-condensed\"><thead><tr><th title=\"Field #1\">name</th><th title=\"Field #2\">age</th></tr></thead><tbody><tr><td>foo</td><td align=\"right\">123</td></tr><tr><td>bar</td><td align=\"right\">456</td></tr></tbody></table></body></html>")
					server.Start()
					defer server.Close()
					ds := getds(t, backend.DataSourceInstanceSettings{JSONData: []byte(`{"is_mock": true}`), DecryptedSecureJSONData: map[string]string{}})
					res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
						Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{
							"type"				:	"html",
							"source"			:	"url",
							"parser" 			: 	"jq-backend",
							"root_selector"		:   ".html.body.table.tbody.tr",
							"columns": [
								{ 	"selector": "td.0", 			"text": "name", 	"type": "string" 	},
								{	"selector": "td.1.#content",	"text": "age",		"type": "number"	}
							],
							"url" 				: 	"%s"
						}`, server.URL))}},
					})
					require.Nil(t, err)
					require.NotNil(t, res)
					resItem := res.Responses["A"]
					experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestParsers/", ""), &resItem, true)
				})
			})
		})
	})
}
