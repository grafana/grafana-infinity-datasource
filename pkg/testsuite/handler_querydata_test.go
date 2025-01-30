package testsuite_test

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-infinity-datasource/pkg/pluginhost"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/experimental"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func queryData(t *testing.T, ctx context.Context, backendQuery backend.DataQuery, infClient infinity.Client, requestHeaders map[string]string, pluginContext backend.PluginContext) (response backend.DataResponse) {
	t.Helper()
	query, err := models.LoadQuery(ctx, backendQuery, pluginContext, infClient.Settings)
	require.Nil(t, err)
	return pluginhost.QueryDataQuery(ctx, pluginContext, query, infClient, requestHeaders)
}

func TestAuthentication(t *testing.T) {
	t.Run("should throw error when allowed hosts not configured", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			fmt.Fprintf(w, `{ "message" : "OK" }`)
		}))
		defer server.Close()
		client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodApiKey})
		require.Nil(t, err)
		require.NotNil(t, client)
		res := queryData(t, context.Background(), backend.DataQuery{
			JSON: []byte(fmt.Sprintf(`{
				"type": "json",
				"url":  "%s",
				"source": "url"
			}`, server.URL)),
		}, *client, map[string]string{}, backend.PluginContext{})
		require.NotNil(t, res)
		require.NotNil(t, res.Error)
		require.Equal(t, "datasource is missing allowed hosts/URLs. Configure it in the datasource settings page for enhanced security", res.Error.Error())
		require.Equal(t, 0, len(res.Frames))
	})
	t.Run("basic auth", func(t *testing.T) {
		t.Run("should set basic auth headers when set the username and password", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				assert.Equal(t, "Basic "+base64.StdEncoding.EncodeToString([]byte("infinityUser:myPassword")), r.Header.Get(infinity.HeaderKeyAuthorization))
				assert.Equal(t, "", r.Header.Get(infinity.HeaderKeyIdToken))
				fmt.Fprintf(w, `{ "message" : "OK" }`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{
				URL:                  server.URL,
				AuthenticationMethod: models.AuthenticationMethodBasic,
				AllowedHosts:         []string{server.URL},
				BasicAuthEnabled:     true,
				UserName:             "infinityUser",
				Password:             "myPassword",
			})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "json",
					"url":  "%s",
					"source": "url"
				}`, server.URL)),
			}, *client, map[string]string{"Authorization": "foo", "X-ID-Token": "bar"}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
			metaData := res.Frames[0].Meta.Custom.(*infinity.CustomMeta)
			require.NotNil(t, metaData)
			require.Equal(t, "", metaData.Error)
			require.Equal(t, http.StatusOK, metaData.ResponseCodeFromServer)
		})
		t.Run("should return error when incorrect credentials set", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				assert.Equal(t, "", r.Header.Get(infinity.HeaderKeyIdToken))
				if r.Header.Get(infinity.HeaderKeyAuthorization) == "Basic "+base64.StdEncoding.EncodeToString([]byte("infinityUser:myPassword")) {
					fmt.Fprintf(w, "OK")
					return
				}
				w.WriteHeader(http.StatusUnauthorized)
				fmt.Fprintf(w, "UnAuthorized")
			}))
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{
				URL:                  server.URL,
				AllowedHosts:         []string{server.URL},
				AuthenticationMethod: models.AuthenticationMethodBasic,
				BasicAuthEnabled:     true,
				UserName:             "infinityUser",
				Password:             "myIncorrectPassword",
			})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
						"type": "json",
						"url":  "%s",
						"source": "url"
					}`, server.URL)),
			}, *client, map[string]string{"Authorization": "foo", "X-ID-Token": "bar"}, backend.PluginContext{})
			require.NotNil(t, res)
			metaData := res.Frames[0].Meta.Custom.(*infinity.CustomMeta)
			require.NotNil(t, res.Error)
			require.NotNil(t, metaData)
			require.Equal(t, "unsuccessful HTTP response. 401 Unauthorized", metaData.Error)
			require.Equal(t, http.StatusUnauthorized, metaData.ResponseCodeFromServer)
		})
	})
	t.Run("forward oauth identity", func(t *testing.T) {
		t.Run("should forward the oauth headers when forward oauth identity is set", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				assert.Equal(t, "foo", r.Header.Get(infinity.HeaderKeyAuthorization))
				assert.Equal(t, "bar", r.Header.Get(infinity.HeaderKeyIdToken))
				fmt.Fprintf(w, `{ "message" : "OK" }`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{
				URL:                  server.URL,
				AllowedHosts:         []string{server.URL},
				ForwardOauthIdentity: true,
			})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "json",
					"url":  "%s",
					"source": "url"
				}`, server.URL)),
			}, *client, map[string]string{"Authorization": "foo", "X-ID-Token": "bar"}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
		})
		t.Run("should not forward the oauth headers when forward oauth identity is not set", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				assert.Equal(t, "", r.Header.Get(infinity.HeaderKeyAuthorization))
				assert.Equal(t, "", r.Header.Get(infinity.HeaderKeyIdToken))
				fmt.Fprintf(w, `{ "message" : "OK" }`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{
				URL:                  server.URL,
				AllowedHosts:         []string{server.URL},
				ForwardOauthIdentity: false,
			})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
						"type": "json",
						"url":  "%s",
						"source": "url"
					}`, server.URL)),
			}, *client, map[string]string{"Authorization": "foo", "X-ID-Token": "bar"}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
		})
	})
	t.Run("oauth2 client credentials", func(t *testing.T) {
		t.Run("should respect oauth credentials", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.URL.String() == "/token" {
					w.Header().Set("Content-Type", "application/json")
					_, _ = io.WriteString(w, `{"access_token": "foo", "refresh_token": "bar"}`)
					return
				}
				if r.Header.Get("Authorization") != "Bearer foo" {
					w.WriteHeader(http.StatusUnauthorized)
					return
				}
				w.Header().Set("Content-Type", "application/json")
				_, _ = io.WriteString(w, `{"foo":"bar"}`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{
				URL:                  server.URL,
				AllowedHosts:         []string{server.URL},
				AuthenticationMethod: models.AuthenticationMethodOAuth,
				OAuth2Settings: models.OAuth2Settings{
					OAuth2Type:   models.AuthOAuthTypeClientCredentials,
					TokenURL:     server.URL + "/token",
					ClientID:     "MY_CLIENT_ID",
					ClientSecret: "MY_CLIENT_SECRET",
					Scopes:       []string{"scope1", "scope2"},
				},
			})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "json",
					"source": "url",
					"url":  "%s/something-else"
				}`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
			metaData := res.Frames[0].Meta.Custom.(*infinity.CustomMeta)
			require.NotNil(t, metaData)
			require.Equal(t, map[string]any(map[string]any{"foo": "bar"}), metaData.Data)
		})
		t.Run("should throw error with invalid oauth credentials", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.URL.String() == "/token" {
					w.WriteHeader(http.StatusUnauthorized)
					return
				}
				if r.Header.Get(infinity.HeaderKeyAuthorization) != "Bearer foo" {
					w.WriteHeader(http.StatusUnauthorized)
					return
				}
				w.Header().Set("Content-Type", "application/json")
				_, _ = io.WriteString(w, `{"foo":"bar"}`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{
				URL:                  server.URL,
				AllowedHosts:         []string{server.URL},
				AuthenticationMethod: models.AuthenticationMethodOAuth,
				OAuth2Settings: models.OAuth2Settings{
					OAuth2Type:   models.AuthOAuthTypeClientCredentials,
					TokenURL:     server.URL + "/token",
					ClientID:     "MY_CLIENT_ID",
					ClientSecret: "MY_CLIENT_SECRET",
					Scopes:       []string{"scope1", "scope2"},
				},
			})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "json",
					"source": "url",
					"url":  "%s/something-else"
				}`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.NotNil(t, res.Error)
			assert.Equal(t, fmt.Sprintf("error while performing the infinity query. error getting response from url %s/something-else. no response received. Error: Get \"%s/something-else\": oauth2: cannot fetch token: 401 Unauthorized\nResponse: ", server.URL, server.URL), res.Error.Error())
			metaData := res.Frames[0].Meta.Custom.(*infinity.CustomMeta)
			require.NotNil(t, metaData)
			require.Equal(t, http.StatusInternalServerError, metaData.ResponseCodeFromServer)
			require.Equal(t, fmt.Sprintf("error getting response from url %s/something-else. no response received. Error: Get \"%s/something-else\": oauth2: cannot fetch token: 401 Unauthorized\nResponse: ", server.URL, server.URL), metaData.Error)
			require.Equal(t, nil, metaData.Data)
		})
	})
	t.Run("client cert and tls verify", func(t *testing.T) {
		t.Run("should error when CA cert verification failed", func(t *testing.T) {
			server := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				assert.Equal(t, "", r.Header.Get(infinity.HeaderKeyIdToken))
				fmt.Fprintf(w, `{ "message" : "OK" }`)
			}))
			server.TLS = getServerCertificate(server.URL)
			assert.NotNil(t, server.TLS)
			server.StartTLS()
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{
				URL:                  server.URL,
				AuthenticationMethod: models.AuthenticationMethodNone,
				TLSAuthWithCACert:    true,
				TLSCACert:            mockPEMClientCACet,
			})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "json",
					"url":  "%s",
					"source": "url"
				}`, server.URL)),
			}, *client, map[string]string{"Authorization": "foo", "X-ID-Token": "bar"}, backend.PluginContext{})
			require.NotNil(t, res)
			require.NotNil(t, res.Error)
			assert.Contains(t, res.Error.Error(), "x509: certificate signed by unknown authority")
			metaData := res.Frames[0].Meta.Custom.(*infinity.CustomMeta)
			require.NotNil(t, metaData)
			assert.Contains(t, metaData.Error, "x509: certificate signed by unknown authority")
			require.Equal(t, http.StatusInternalServerError, metaData.ResponseCodeFromServer)
		})
		t.Run("should honour skip tls verify setting", func(t *testing.T) {
			server := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				assert.Equal(t, "", r.Header.Get(infinity.HeaderKeyIdToken))
				fmt.Fprintf(w, `{ "message" : "OK" }`)
			}))
			server.TLS = getServerCertificate(server.URL)
			assert.NotNil(t, server.TLS)
			server.StartTLS()
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{
				URL:                  server.URL,
				AuthenticationMethod: models.AuthenticationMethodNone,
				InsecureSkipVerify:   true,
			})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "json",
					"url":  "%s",
					"source": "url"
				}`, server.URL)),
			}, *client, map[string]string{"Authorization": "foo", "X-ID-Token": "bar"}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
			metaData := res.Frames[0].Meta.Custom.(*infinity.CustomMeta)
			require.NotNil(t, metaData)
			require.Equal(t, "", metaData.Error)
			require.Equal(t, http.StatusOK, metaData.ResponseCodeFromServer)
			require.Equal(t, map[string]any(map[string]any{"message": "OK"}), metaData.Data)
		})
	})
	t.Run("digest auth", func(t *testing.T) {
		t.Run("should be ok with correct credentials", func(t *testing.T) {
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodDigestAuth,
				UserName:             "foo",
				Password:             "bar",
				AllowedHosts:         []string{"http://httpbin.org/digest-auth"},
			})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "json",
					"url":  "%s",
					"source": "url"
				}`, "http://httpbin.org/digest-auth/auth/foo/bar/MD5")),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
		})
		t.Run("should fail with incorrect credentials", func(t *testing.T) {
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodDigestAuth,
				UserName:             "foo",
				Password:             "baz",
				AllowedHosts:         []string{"http://httpbin.org/digest-auth"},
			})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "json",
					"url":  "%s",
					"source": "url"
				}`, "http://httpbin.org/digest-auth/auth/foo/bar/MD5")),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res.Error)
			require.Equal(t, "error while performing the infinity query. unsuccessful HTTP response. 401 UNAUTHORIZED", res.Error.Error())
		})
		t.Run("should fail with incorrect auth method", func(t *testing.T) {
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{
				AuthenticationMethod: models.AuthenticationMethodBasic,
				UserName:             "foo",
				Password:             "bar",
				AllowedHosts:         []string{"http://httpbin.org/digest-auth"},
			})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "json",
					"url":  "%s",
					"source": "url"
				}`, "http://httpbin.org/digest-auth/auth/foo/bar/MD5")),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res.Error)
			require.Equal(t, "error while performing the infinity query. unsuccessful HTTP response. 401 UNAUTHORIZED", res.Error.Error())
		})
	})
}

func TestResponseFormats(t *testing.T) {
	t.Run("JSON", func(t *testing.T) {
		t.Run("should parse the response and send results", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				fmt.Fprintf(w, `{ "foo" : "bar" }`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "json",
					"url":  "%s",
					"source": "url"
				}`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
			metaData := res.Frames[0].Meta.Custom.(*infinity.CustomMeta)
			require.NotNil(t, metaData)
			require.Equal(t, "", metaData.Error)
			require.Equal(t, http.StatusOK, metaData.ResponseCodeFromServer)
			require.Equal(t, map[string]any(map[string]any{"foo": "bar"}), metaData.Data)
		})
	})
	t.Run("JSON Backend", func(t *testing.T) {
		t.Run("should parse the response and send results", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				fmt.Fprintf(w, `{
					"channel": {
					  "id": 38629,
					  "name": "Traffic Monitor",
					  "description": "Traffic Monitor showing density of cars detected",
					  "latitude": "42.28",
					  "longitude": "-71.35",
					  "field1": "Density of Westbound Cars",
					  "field2": "Density of Eastbound Cars",
					  "created_at": "2015-05-19T20:14:03Z",
					  "updated_at": "2019-07-24T20:12:00Z",
					  "last_entry_id": 13487228
					},
					"feeds": [
					  {
						"created_at": "2022-09-06T16:40:50Z",
						"entry_id": 13487129,
						"field1": "20.000000",
						"field2": "46.000000"
					  },
					  {
						"created_at": "2022-09-06T16:40:50Z",
						"entry_id": 13487130,
						"field1": "22.000000",
						"field2": "32.000000"
					  },
					  {
						"created_at": "2022-09-06T17:40:50Z",
						"entry_id": 13487129,
						"field1": "30.000000",
						"field2": "56.000000"
					  },
					  {
						"created_at": "2022-09-06T17:40:50Z",
						"entry_id": 13487130,
						"field1": "10.000000",
						"field2": "36.000000"
					  }
					]
				  }`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "json",
					"url":  "%s",
					"source": "url",
					"format": "timeseries",
					"parser": "backend",
					"root_selector": "feeds",
					"columns": [
					  {
						"text": "",
						"selector": "created_at",
						"type": "timestamp"
					  },
					  {
						"text": "",
						"selector": "field1",
						"type": "number"
					  },
					  {
						"text": "",
						"selector": "entry_id",
						"type": "string"
					  }
					]
				}`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
			// require.Equal(t, data.FieldTypeNullableFloat64, res.Frames[0].Fields[0].Type())
			// require.Equal(t, data.FieldTypeNullableString, res.Frames[0].Fields[1].Type())
			// require.Equal(t, data.FieldTypeNullableTime, res.Frames[0].Fields[2].Type())
		})
		t.Run("should parse the computed columns", func(t *testing.T) {
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{URL: ""})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(`{
					"type": "json",
					"data":  "[{ \"Name\": \"amc ambassador dpl\", \"Miles_per_Gallon\": 15, \"Cylinders\": 8, \"Displacement\": 390, \"Horsepower\": 190, \"Weight_in_lbs\": 3850, \"Acceleration\": 8.5, \"Year\": \"1970-01-01\", \"Origin\": \"USA\" }, { \"Name\": \"citroen ds-21 pallas\", \"Miles_per_Gallon\": null, \"Cylinders\": null, \"Displacement\": 133, \"Horsepower\": 115, \"Weight_in_lbs\": 3090, \"Acceleration\": 17.5, \"Year\": \"1970-01-01\", \"Origin\": \"Europe\" }, { \"Name\": \"chevrolet hello concours (sw)\", \"Miles_per_Gallon\": null, \"Cylinders\": 8, \"Displacement\": 350, \"Horsepower\": 165, \"Weight_in_lbs\": 4142, \"Acceleration\": 11.5, \"Year\": \"1970-01-01\", \"Origin\": \"USA\" }]",
					"source": "inline",
					"parser": "backend",
					"root_selector": "",
					"columns": [],
					"computed_columns": [{ "selector" : "[Cylinders] + horsepower" , "text": "power" }]
				}`),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
			experimental.CheckGoldenJSONResponse(t, "golden", "backend-computed-columns", &res, UPDATE_GOLDEN_DATA)
		})
		t.Run("should filter computed columns", func(t *testing.T) {
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{URL: ""})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(`{
					"type": "json",
					"data":  "[{\"id\":0,\"name\":\"iPhone 6S\",\"description\":\"Kogi skateboard tattooed, whatever portland fingerstache coloring book mlkshk leggings flannel dreamcatcher.\",\"imageUrl\":\"http://www.icentar.me/phone/6s/images/goldbig.jpg\",\"price\":799},{\"id\":1,\"name\":\"iPhone 5S\",\"description\":\"Kogi skateboard tattooed, whatever portland fingerstache coloring book mlkshk leggings flannel dreamcatcher.\",\"imageUrl\":\"http://www.icentar.me/phone/5s/images/silverbig.png\",\"price\":349},{\"id\":2,\"name\":\"Macbook\",\"description\":\"Kogi skateboard tattooed, whatever portland fingerstache coloring book mlkshk leggings flannel dreamcatcher.\",\"imageUrl\":\"http://www.icentar.me/mac/macbook/images/pro.jpg\",\"price\":1499},{\"id\":3,\"name\":\"Macbook Air\",\"description\":\"Kogi skateboard tattooed, whatever portland fingerstache coloring book mlkshk leggings flannel dreamcatcher.\",\"imageUrl\":\"http://www.icentar.me/mac/mbair/images/air.jpg\",\"price\":999},{\"id\":4,\"name\":\"Macbook Air 2013\",\"description\":\"Kogi skateboard tattooed, whatever portland fingerstache coloring book mlkshk leggings flannel dreamcatcher.\",\"imageUrl\":\"http://www.icentar.me/mac/mbair/images/air.jpg\",\"price\":599},{\"id\":5,\"name\":\"Macbook Air 2012\",\"description\":\"Kogi skateboard tattooed, whatever portland fingerstache coloring book mlkshk leggings flannel dreamcatcher.\",\"imageUrl\":\"http://www.icentar.me/mac/mbair/images/air.jpg\",\"price\":499}]",
					"source": "inline",
					"parser": "backend",
					"root_selector": "",
					"computed_columns": [{ "selector" : "price > 500 ? 2 : 5" , "text": "no of items" },{ "selector" : "[no of items] * price" , "text": "cost" }],
					"filterExpression" : "!(name IN ('Macbook','Macbook Air'))",
					"summarizeExpression" : "sum(cost)"
				}`),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
			experimental.CheckGoldenJSONResponse(t, "golden", "backend-filter-computed-columns", &res, UPDATE_GOLDEN_DATA)
		})
	})
	t.Run("GraphQL", func(t *testing.T) {
		t.Run("should parse the response and send results", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				fmt.Fprintf(w, `{ "foo" : "bar" }`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "graphql",
					"url":  "%s",
					"source": "url"
				}`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
			metaData := res.Frames[0].Meta.Custom.(*infinity.CustomMeta)
			require.NotNil(t, metaData)
			require.Equal(t, "", metaData.Error)
			require.Equal(t, http.StatusOK, metaData.ResponseCodeFromServer)
			require.Equal(t, map[string]any(map[string]any{"foo": "bar"}), metaData.Data)
		})
	})
	t.Run("CSV", func(t *testing.T) {
		t.Run("should parse the response and send results", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				w.Header().Add("Content-Type", "text/csv")
				fmt.Fprintf(w, "a,b\na1,b1")
			}))
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "uql",
					"url":  "%s",
					"source": "url"
				}`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
			metaData := res.Frames[0].Meta.Custom.(*infinity.CustomMeta)
			require.NotNil(t, metaData)
			require.Equal(t, "", metaData.Error)
			require.Equal(t, http.StatusOK, metaData.ResponseCodeFromServer)
			require.Equal(t, "a,b\na1,b1", metaData.Data)
		})
	})
	t.Run("XML", func(t *testing.T) {
		t.Run("should parse the response and send results", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				w.Header().Add("Content-Type", "text/xml")
				fmt.Fprintf(w, `<xml><User name="foo"></xml>`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "xml",
					"url":  "%s",
					"source": "url"
				}`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
			metaData := res.Frames[0].Meta.Custom.(*infinity.CustomMeta)
			require.NotNil(t, metaData)
			require.Equal(t, "", metaData.Error)
			require.Equal(t, http.StatusOK, metaData.ResponseCodeFromServer)
			require.Equal(t, `<xml><User name="foo"></xml>`, metaData.Data)
		})
	})
	t.Run("UQL", func(t *testing.T) {
		t.Run("should parse the response and send results", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				w.Header().Add("Content-Type", "application/json")
				fmt.Fprintf(w, `{ "foo" : "bar" }`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "uql",
					"url":  "%s",
					"source": "url"
				}`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
			metaData := res.Frames[0].Meta.Custom.(*infinity.CustomMeta)
			require.NotNil(t, metaData)
			require.Equal(t, "", metaData.Error)
			require.Equal(t, http.StatusOK, metaData.ResponseCodeFromServer)
			require.Equal(t, map[string]any(map[string]any{"foo": "bar"}), metaData.Data)
		})
	})
	t.Run("GROQ", func(t *testing.T) {
		t.Run("should parse the response and send results", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				w.Header().Add("Content-Type", "application/json")
				fmt.Fprintf(w, `{ "foo" : "bar" }`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(context.TODO(), models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := queryData(t, context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "groq",
					"url":  "%s",
					"source": "url"
				}`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
			metaData := res.Frames[0].Meta.Custom.(*infinity.CustomMeta)
			require.NotNil(t, metaData)
			require.Equal(t, "", metaData.Error)
			require.Equal(t, http.StatusOK, metaData.ResponseCodeFromServer)
			require.Equal(t, map[string]any(map[string]any{"foo": "bar"}), metaData.Data)
		})
	})
}

func TestInlineSources(t *testing.T) {
	tests := []struct {
		name            string
		queryJSON       string
		timeRange       backend.TimeRange
		wantErr         error
		skipGoldenCheck bool
		test            func(t *testing.T, frame *data.Frame)
	}{
		{
			name: "should execute default query without error",
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				t.Run("should have custom meta data correctly", func(t *testing.T) {
					require.NotNil(t, frame.Meta.Custom)
					require.Equal(t, "This feature is not available for this type of query yet", frame.Meta.ExecutedQueryString)
				})
			},
		},
		{
			name: "should return inline uql correctly",
			queryJSON: `{
				"refId":					"q1",
				"type": 					"uql",
				"source":					"inline",
				"format":					"table",
				"data":						"[1,2,3]",
				"uql":						"parse-json | count"
			}`,
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				t.Run("should have frame name correctly", func(t *testing.T) {
					require.Equal(t, "q1", frame.Name)
				})
				t.Run("should have custom meta data correctly", func(t *testing.T) {
					require.NotNil(t, frame.Meta.Custom)
					customMeta := frame.Meta.Custom.(*infinity.CustomMeta)
					require.NotNil(t, customMeta)
					require.Equal(t, models.QueryTypeUQL, customMeta.Query.Type)
					require.Equal(t, "inline", customMeta.Query.Source)
					require.Equal(t, "table", customMeta.Query.Format)
					require.Equal(t, "[1,2,3]", customMeta.Query.Data)
					require.Equal(t, "parse-json | count", customMeta.Query.UQL)
					require.Equal(t, "[1,2,3]", customMeta.Data)
					require.Equal(t, "", customMeta.Error)
				})
			},
		},
		{
			name: "should return backend results correctly",
			queryJSON: `{
				"refId":					"q1",
				"type": 					"json",
				"parser": 					"backend",
				"source":					"inline",
				"data":						"[{\"Sex\":\"Male\"},{\"Sex\":\"Male\"},{\"Sex\":null},{\"Sex\":\"Female\"},{\"Sex\":\"Others\"}]",
				"filterExpression": 		"Sex != 'Female' && Sex != null",
				"summarizeExpression": 		"count(Sex)",
				"summarizeAlias": 			"Count by gender",
				"summarizeBy": 				"Sex"
			}`,
			skipGoldenCheck: true,
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				assert.Equal(t, data.NewField("Sex", nil, []*string{toSP("Male"), toSP(""), toSP("Others")}), frame.Fields[0])
				assert.Equal(t, data.NewField("Count by gender", nil, []*float64{toFP(2), toFP(1), toFP(1)}), frame.Fields[1])
			},
		},
		{
			name: "should return backend results correctly with computed columns",
			queryJSON: `{
				"refId":					"q1",
				"type": 					"json",
				"parser": 					"backend",
				"source":					"inline",
				"data":						"[1,2,3,4,5,6]",
				"computed_columns": 		[{"selector":"q1 == 2 ? '' : 'Male'", "text":"something"}]
			}`,
			skipGoldenCheck: true,
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				// TODO: fix null vlues. When the selector is changed to `q1 == 2 ? null : "Male"`, it produces invalid results.
				assert.Equal(t, data.NewField("q1", nil, []*float64{toFP(1), toFP(2), toFP(3), toFP(4), toFP(5), toFP(6)}), frame.Fields[0])
				assert.Equal(t, data.NewField("something", nil, []*string{toSP("Male"), toSP(""), toSP("Male"), toSP("Male"), toSP("Male"), toSP("Male")}), frame.Fields[1])
			},
		},
		{
			name: "should return backend results jsonata root selector",
			queryJSON: `{
				"refId":					"q1",
				"type": 					"json",
				"parser": 					"backend",
				"source":					"inline",
				"data":						"{\"orders\":[{\"price\":10,\"quantity\":3},{\"price\":0.5,\"quantity\":10},{\"price\":100,\"quantity\":1}]}",
				"root_selector": 			"$sum(orders.price)",
				"computed_columns": 		[]
			}`,
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			require.NotEmpty(t, tt.name)
			queryJSON := tt.queryJSON
			if queryJSON == "" {
				queryJSON = "{}"
			}
			bq := backend.DataQuery{JSON: []byte(queryJSON), TimeRange: tt.timeRange}
			query, err := models.LoadQuery(context.Background(), bq, backend.PluginContext{}, models.InfinitySettings{})
			require.Nil(t, err)
			frame, err := infinity.GetFrameForInlineSources(context.TODO(), query)
			if tt.wantErr != nil {
				require.NotNil(t, err)
				assert.Equal(t, tt.wantErr, err)
				return
			}
			require.Nil(t, err)
			if !tt.skipGoldenCheck {
				require.NotNil(t, frame)
				response := &backend.DataResponse{Frames: data.Frames{frame}}
				experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestInlineSources/", "inline/"), response, UPDATE_GOLDEN_DATA)
			}
			if tt.test != nil {
				tt.test(t, frame)
			}
		})
	}
}

func TestRemoteSources(t *testing.T) {
	tests := []struct {
		name            string
		queryJSON       string
		client          *infinity.Client
		timeRange       backend.TimeRange
		wantErr         error
		skipGoldenCheck bool
		test            func(t *testing.T, frame *data.Frame)
	}{
		{
			name: "should execute default query without error",
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				t.Run("should have custom meta data correctly", func(t *testing.T) {
					require.NotNil(t, frame.Meta.Custom)
					require.Equal(t, "###############\n## URL\n###############\n\nhttps://raw.githubusercontent.com/grafana/grafana-infinity-datasource/main/testdata/users.json\n\n###############\n## Curl Command\n###############\n\ncurl -X 'GET' -H 'Accept: application/json;q=0.9,text/plain' -H 'Accept-Encoding: gzip' 'https://raw.githubusercontent.com/grafana/grafana-infinity-datasource/main/testdata/users.json'", frame.Meta.ExecutedQueryString)
				})
			},
		},
		{
			name: "json query",
			queryJSON: `{
				"refId":					"q1",
				"type": 					"json",
				"source":					"url",
				"format":					"table",
				"url":						"http://foo"
			}`,
			client: New("[1,2,3]"),
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				require.Equal(t, "###############\n## URL\n###############\n\nhttp://foo\n\n###############\n## Curl Command\n###############\n\ncurl -X 'GET' -H 'Accept: application/json;q=0.9,text/plain' -H 'Accept-Encoding: gzip' 'http://foo'", frame.Meta.ExecutedQueryString)
				t.Run("should have frame name correctly", func(t *testing.T) {
					require.Equal(t, "q1", frame.Name)
				})
				t.Run("should have custom meta data correctly", func(t *testing.T) {
					require.NotNil(t, frame.Meta.Custom)
					customMeta := frame.Meta.Custom.(*infinity.CustomMeta)
					require.NotNil(t, customMeta)
					require.Equal(t, models.QueryTypeJSON, customMeta.Query.Type)
					require.Equal(t, "url", customMeta.Query.Source)
					require.Equal(t, "table", customMeta.Query.Format)
					require.Equal(t, "http://foo", customMeta.Query.URL)
					require.Equal(t, []any([]any{float64(1), float64(2), float64(3)}), customMeta.Data)
					require.Equal(t, "", customMeta.Error)
				})
			},
		},
		{
			name: "csv query",
			queryJSON: `{
				"refId":					"q1",
				"type": 					"csv",
				"source":					"url",
				"format":					"table",
				"url":						"http://bar"
			}`,
			client: New("a,b\na1,b1"),
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				require.Equal(t, "###############\n## URL\n###############\n\nhttp://bar\n\n###############\n## Curl Command\n###############\n\ncurl -X 'GET' -H 'Accept: text/csv; charset=utf-8' -H 'Accept-Encoding: gzip' 'http://bar'", frame.Meta.ExecutedQueryString)
				t.Run("should have frame name correctly", func(t *testing.T) {
					require.Equal(t, "q1", frame.Name)
				})
				t.Run("should have custom meta data correctly", func(t *testing.T) {
					require.NotNil(t, frame.Meta.Custom)
					customMeta := frame.Meta.Custom.(*infinity.CustomMeta)
					require.NotNil(t, customMeta)
					require.Equal(t, models.QueryTypeCSV, customMeta.Query.Type)
					require.Equal(t, "url", customMeta.Query.Source)
					require.Equal(t, "table", customMeta.Query.Format)
					require.Equal(t, "http://bar", customMeta.Query.URL)
					require.Equal(t, "a,b\na1,b1", customMeta.Data)
					require.Equal(t, "", customMeta.Error)
				})
			},
		},
		{
			name: "uql query",
			queryJSON: `{
				"refId":					"q1",
				"type": 					"uql",
				"source":					"url",
				"format":					"table",
				"url":						"http://foo",
				"uql":						"parse-json | count"
			}`,
			client: New("[1,2,3]"),
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				require.Equal(t, "###############\n## URL\n###############\n\nhttp://foo\n\n###############\n## Curl Command\n###############\n\ncurl -X 'GET' -H 'Accept-Encoding: gzip' 'http://foo'\n\n###############\n## UQL\n###############\n\nparse-json | count", frame.Meta.ExecutedQueryString)
				t.Run("should have frame name correctly", func(t *testing.T) {
					require.Equal(t, "q1", frame.Name)
				})
				t.Run("should have custom meta data correctly", func(t *testing.T) {
					require.NotNil(t, frame.Meta.Custom)
					customMeta := frame.Meta.Custom.(*infinity.CustomMeta)
					require.NotNil(t, customMeta)
					require.Equal(t, models.QueryTypeUQL, customMeta.Query.Type)
					require.Equal(t, "url", customMeta.Query.Source)
					require.Equal(t, "table", customMeta.Query.Format)
					require.Equal(t, "http://foo", customMeta.Query.URL)
					require.Equal(t, "parse-json | count", customMeta.Query.UQL)
					require.Equal(t, "[1,2,3]", customMeta.Data)
					require.Equal(t, "", customMeta.Error)
				})
			},
		},
		{
			name: "groq query",
			queryJSON: `{
				"refId":					"q1",
				"type": 					"groq",
				"source":					"url",
				"format":					"table",
				"url":						"http://foo",
				"groq":						"*{1,2,3}"
			}`,
			client: New("[1,2,3]"),
			test: func(t *testing.T, frame *data.Frame) {
				require.NotNil(t, frame)
				require.Equal(t, "###############\n## URL\n###############\n\nhttp://foo\n\n###############\n## Curl Command\n###############\n\ncurl -X 'GET' -H 'Accept-Encoding: gzip' 'http://foo'\n###############\n## GROQ\n###############\n\n*{1,2,3}\n", frame.Meta.ExecutedQueryString)
				t.Run("should have frame name correctly", func(t *testing.T) {
					require.Equal(t, "q1", frame.Name)
				})
				t.Run("should have custom meta data correctly", func(t *testing.T) {
					require.NotNil(t, frame.Meta.Custom)
					customMeta := frame.Meta.Custom.(*infinity.CustomMeta)
					require.NotNil(t, customMeta)
					require.Equal(t, models.QueryTypeGROQ, customMeta.Query.Type)
					require.Equal(t, "url", customMeta.Query.Source)
					require.Equal(t, "table", customMeta.Query.Format)
					require.Equal(t, "http://foo", customMeta.Query.URL)
					require.Equal(t, "*{1,2,3}", customMeta.Query.GROQ)
					require.Equal(t, "[1,2,3]", customMeta.Data)
					require.Equal(t, "", customMeta.Error)
				})
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			require.NotEmpty(t, tt.name)
			queryJSON := tt.queryJSON
			if queryJSON == "" {
				queryJSON = "{}"
			}
			bq := backend.DataQuery{JSON: []byte(queryJSON), TimeRange: tt.timeRange}
			query, err := models.LoadQuery(context.Background(), bq, backend.PluginContext{}, models.InfinitySettings{})
			require.Nil(t, err)
			client := tt.client
			if client == nil {
				client = New("")
			}

			frame, err := infinity.GetFrameForURLSources(context.Background(), &backend.PluginContext{}, query, *client, map[string]string{})
			if tt.wantErr != nil {
				require.NotNil(t, err)
				assert.Equal(t, tt.wantErr, err)
				return
			}
			require.Nil(t, err)
			if !tt.skipGoldenCheck {
				require.NotNil(t, frame)
				response := &backend.DataResponse{Frames: data.Frames{frame}}
				experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestRemoteSources/", "remote/"), response, UPDATE_GOLDEN_DATA)
			}
			if tt.test != nil {
				tt.test(t, frame)
			}
		})
	}
}

func getds(t *testing.T, settings backend.DataSourceInstanceSettings) *pluginhost.DataSource {
	t.Helper()
	host, err := pluginhost.NewDataSourceInstance(context.Background(), settings)
	require.Nil(t, err)
	require.NotNil(t, host)
	ds, ok := host.(*pluginhost.DataSource)
	require.True(t, ok)
	require.NotNil(t, ds)
	return ds

}

func TestQuery(t *testing.T) {
	t.Run("json default url default", func(t *testing.T) {
		server := getServerWithStaticResponse(t, `{"message":"ok"}`, false)
		server.Start()
		defer server.Close()
		ds := getds(t, backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"is_mock": true}`),
			DecryptedSecureJSONData: map[string]string{},
		})
		res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
			Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
				"type"		:	"json",
				"source"	:	"url",
				"url" 		: 	"%s"
			}`, server.URL))}},
		})
		require.Nil(t, err)
		require.NotNil(t, res)
		resItem := res.Responses["A"]
		experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
	})
	t.Run("csv default url default", func(t *testing.T) {
		server := getServerWithStaticResponse(t, strings.Join([]string{`name,age`, `foo,123`, `bar,456`}, "\n"), false)
		server.Start()
		defer server.Close()
		ds := getds(t, backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"is_mock": true}`),
			DecryptedSecureJSONData: map[string]string{},
		})
		res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
			Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
				"type"		:	"csv",
				"source"	:	"url",
				"url" 		: 	"%s"
			}`, server.URL))}},
		})
		require.Nil(t, err)
		require.NotNil(t, res)
		resItem := res.Responses["A"]
		experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
	})
	t.Run("csv backend url default", func(t *testing.T) {
		server := getServerWithStaticResponse(t, strings.Join([]string{`name,age`, `foo,123`, `bar,456`}, "\n"), false)
		server.Start()
		defer server.Close()
		ds := getds(t, backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"is_mock": true}`),
			DecryptedSecureJSONData: map[string]string{},
		})
		res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
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
		experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
	})
	t.Run("csv backend inline default", func(t *testing.T) {
		ds := getds(t, backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"is_mock": true}`),
			DecryptedSecureJSONData: map[string]string{},
		})
		res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
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
		experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
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
		ds := getds(t, backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"is_mock": true}`),
			DecryptedSecureJSONData: map[string]string{},
		})
		res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
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
		experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
	})
	t.Run("html", func(t *testing.T) {
		server := getServerWithStaticResponse(t, "../../testdata/users.html", true)
		server.Start()
		defer server.Close()
		ds := getds(t, backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"is_mock": true}`),
			DecryptedSecureJSONData: map[string]string{},
		})
		t.Run("default url default", func(t *testing.T) {
			res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
				Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
					"type": "html",
					"url":  "%s",
					"source": "url",
					"root_selector": "tbody tr",
					"columns": [
						{
							"text": "name",
							"selector": "td:nth-child(1)",
							"type": "string"
						},
						{
							"text": "age",
							"selector": "td:nth-child(2)",
							"type": "number"
						},
						{
							"text": "country",
							"selector": "td:nth-child(3)",
							"type": "string"
						},
						{
							"text": "occupation",
							"selector": "td:nth-child(4)",
							"type": "string"
						},
						{
							"text": "salary",
							"selector": "td:nth-child(5)",
							"type": "number"
						}
					]
				}`, server.URL))}},
			})
			require.Nil(t, err)
			require.NotNil(t, res)
			resItem := res.Responses["A"]
			experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestQuery/html/", "html_"), &resItem, UPDATE_GOLDEN_DATA)
		})
		t.Run("backend url default", func(t *testing.T) {
			ds := getds(t, backend.DataSourceInstanceSettings{
				JSONData:                []byte(`{"is_mock": true}`),
				DecryptedSecureJSONData: map[string]string{},
			})
			res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
				Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(fmt.Sprintf(`{ 
					"type": "html",
					"url":  "%s",
					"source": "url",
					"parser": "backend",
					"root_selector": "html.body.table.tbody.tr",
					"columns": [
						{
							"selector": "td.0",
							"text": "name",
							"timestampFormat": "",
							"type": "string"
						},
						{
							"selector": "td.1.#content",
							"text": "age",
							"timestampFormat": "",
							"type": "number"
						},
						{
							"selector": "td.2",
							"text": "country",
							"timestampFormat": "",
							"type": "string"
						},
						{
							"selector": "td.3",
							"text": "occupation",
							"timestampFormat": "",
							"type": "string"
						},
						{
							"selector": "td.4.#content",
							"text": "salary",
							"timestampFormat": "",
							"type": "number"
						}
					]
				}`, server.URL))}},
			})
			require.Nil(t, err)
			require.NotNil(t, res)
			resItem := res.Responses["A"]
			experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestQuery/html/", "html_"), &resItem, UPDATE_GOLDEN_DATA)
		})
	})
	t.Run("scenario azure cost management", func(t *testing.T) {
		server := getServerWithStaticResponse(t, "./../../testdata/misc/azure-cost-management-daily.json", true)
		server.Start()
		defer server.Close()
		ds := getds(t, backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"is_mock": true}`),
			DecryptedSecureJSONData: map[string]string{},
		})
		res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
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
		experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
	})
	t.Run("transformations limit default", func(t *testing.T) {
		ds := getds(t, backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"is_mock": true}`),
			DecryptedSecureJSONData: map[string]string{},
		})
		res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
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
			experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestQuery/", "")+"_"+k, &resItem, UPDATE_GOLDEN_DATA)
		}
	})
	t.Run("azure blob", func(t *testing.T) {
		t.Skip()
		t.Run("backend", func(t *testing.T) {
			server := getServerWithStaticResponse(t, "./../../testdata/users.json", true)
			server.Start()
			defer server.Close()
			ds := getds(t, backend.DataSourceInstanceSettings{
				JSONData: []byte(fmt.Sprintf(`{
					"is_mock"				: true,
					"auth_method"			: "azureBlob",
					"azureBlobAccountUrl"	: "%s",
					"azureBlobAccountName"  : "dummyaccount"
				}`, server.URL)),
				DecryptedSecureJSONData: map[string]string{
					"azureBlobAccountKey": "ZmFrZQ==",
				},
			})
			res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
				Queries: []backend.DataQuery{
					{
						RefID: "A",
						JSON: []byte((`{ 
							"type"				:	"json",
							"source"			:	"azure-blob",
							"parser" 			: 	"backend",
							"azContainerName"	: 	"my-azContainerName",
							"azBlobName"		: 	"folder/users.json"
						}`)),
					},
				},
			})
			require.Nil(t, err)
			require.NotNil(t, res)
			require.Nil(t, res.Responses["A"].Error)
			resItem := res.Responses["A"]
			experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
		})
		t.Run("backend csv", func(t *testing.T) {
			server := getServerWithStaticResponse(t, "./../../testdata/users.csv", true)
			server.Start()
			defer server.Close()
			ds := getds(t, backend.DataSourceInstanceSettings{
				JSONData: []byte(fmt.Sprintf(`{
					"is_mock"				: true,
					"auth_method"			: "azureBlob",
					"azureBlobAccountUrl"	: "%s",
					"azureBlobAccountName"  : "dummyaccount"
				}`, server.URL)),
				DecryptedSecureJSONData: map[string]string{
					"azureBlobAccountKey": "ZmFrZQ==",
				},
			})
			res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
				Queries: []backend.DataQuery{
					{
						RefID: "A",
						JSON: []byte((`{
							"type"				:	"csv",
							"source"			:	"azure-blob",
							"parser" 			: 	"backend",
							"azContainerName"	: 	"my-azContainerName",
							"azBlobName"		: 	"folder/users.csv"
						}`)),
					},
				},
			})
			require.Nil(t, err)
			require.NotNil(t, res)
			require.Nil(t, res.Responses["A"].Error)
			resItem := res.Responses["A"]
			experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
		})
		t.Run("uql xml", func(t *testing.T) {
			server := getServerWithStaticResponse(t, "./../../testdata/users.xml", true)
			server.Start()
			defer server.Close()
			ds := getds(t, backend.DataSourceInstanceSettings{
				JSONData: []byte(fmt.Sprintf(`{
					"is_mock"				: true,
					"auth_method"			: "azureBlob",
					"azureBlobAccountUrl"	: "%s",
					"azureBlobAccountName"  : "dummyaccount"
				}`, server.URL)),
				DecryptedSecureJSONData: map[string]string{
					"azureBlobAccountKey": "ZmFrZQ==",
				},
			})
			res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
				Queries: []backend.DataQuery{
					{
						RefID: "A",
						JSON: []byte((`{
							"type"				:	"xml",
							"source"			:	"azure-blob",
							"parser" 			: 	"uql",
							"azContainerName"	: 	"my-azContainerName",
							"azBlobName"		: 	"folder/users.xml"
						}`)),
					},
				},
			})
			require.Nil(t, err)
			require.NotNil(t, res)
			require.Nil(t, res.Responses["A"].Error)
			resItem := res.Responses["A"]
			experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
		})
		t.Run("default tsv", func(t *testing.T) {
			server := getServerWithStaticResponse(t, "./../../testdata/users.tsv", true)
			server.Start()
			defer server.Close()
			ds := getds(t, backend.DataSourceInstanceSettings{
				JSONData: []byte(fmt.Sprintf(`{
					"is_mock"				: true,
					"auth_method"			: "azureBlob",
					"azureBlobAccountUrl"	: "%s",
					"azureBlobAccountName"  : "dummyaccount"
				}`, server.URL)),
				DecryptedSecureJSONData: map[string]string{
					"azureBlobAccountKey": "ZmFrZQ==",
				},
			})
			res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
				Queries: []backend.DataQuery{
					{
						RefID: "A",
						JSON: []byte((`{
							"type"				:	"tsv",
							"source"			:	"azure-blob",
							"azContainerName"	: 	"my-azContainerName",
							"azBlobName"		: 	"folder/users.tsv"
						}`)),
					},
				},
			})
			require.Nil(t, err)
			require.NotNil(t, res)
			require.Nil(t, res.Responses["A"].Error)
			resItem := res.Responses["A"]
			experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestQuery/", ""), &resItem, UPDATE_GOLDEN_DATA)
		})
	})
}

func TestResponseEncoding(t *testing.T) {
	t.Run("testing gzip compressed content", func(t *testing.T) {
		server := getServerWithGZipCompressedResponse(t, strings.Join([]string{`name,age`, `foo,123`, `bar,456`}, "\n"))
		server.Start()
		defer server.Close()
		ds := getds(t, backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"is_mock": true}`),
			DecryptedSecureJSONData: map[string]string{},
		})
		res, err := ds.QueryData(context.Background(), &backend.QueryDataRequest{
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
		experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "TestResponseEncoding/", ""), &resItem, UPDATE_GOLDEN_DATA)
	})
}
