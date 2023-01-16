package pluginhost_test

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/experimental"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/mock"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/pluginhost"
)

func TestAuthentication(t *testing.T) {
	t.Run("should throw error when allowed hosts not configured", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			fmt.Fprintf(w, `{ "message" : "OK" }`)
		}))
		defer server.Close()
		client, err := infinity.NewClient(models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodApiKey})
		require.Nil(t, err)
		require.NotNil(t, client)
		res := pluginhost.QueryData(context.Background(), backend.DataQuery{
			JSON: []byte(fmt.Sprintf(`{
				"type": "json",
				"url":  "%s",
				"source": "url"
			}`, server.URL)),
		}, *client, map[string]string{}, backend.PluginContext{})
		require.NotNil(t, res)
		require.Nil(t, res.Error)
		require.Equal(t, "Datasource is missing allowed hosts/URLs. Configure it in the datasource settings page for enhanced security.", res.Frames[0].Meta.Notices[0].Text)
	})
	t.Run("basic auth", func(t *testing.T) {
		t.Run("should set basic auth headers when set the username and password", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				assert.Equal(t, "Basic "+base64.StdEncoding.EncodeToString([]byte("infinityUser:myPassword")), r.Header.Get("Authorization"))
				assert.Equal(t, "", r.Header.Get("X-ID-Token"))
				fmt.Fprintf(w, `{ "message" : "OK" }`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(models.InfinitySettings{
				URL:                  server.URL,
				AuthenticationMethod: models.AuthenticationMethodBasic,
				AllowedHosts:         []string{server.URL},
				BasicAuthEnabled:     true,
				UserName:             "infinityUser",
				Password:             "myPassword",
			})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
				assert.Equal(t, "", r.Header.Get("X-ID-Token"))
				if r.Header.Get("Authorization") == "Basic "+base64.StdEncoding.EncodeToString([]byte("infinityUser:myPassword")) {
					fmt.Fprintf(w, "OK")
					return
				}
				w.WriteHeader(http.StatusUnauthorized)
				fmt.Fprintf(w, "UnAuthorized")
			}))
			defer server.Close()
			client, err := infinity.NewClient(models.InfinitySettings{
				URL:                  server.URL,
				AllowedHosts:         []string{server.URL},
				AuthenticationMethod: models.AuthenticationMethodBasic,
				BasicAuthEnabled:     true,
				UserName:             "infinityUser",
				Password:             "myIncorrectPassword",
			})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
			require.Equal(t, "401 Unauthorized", metaData.Error)
			require.Equal(t, http.StatusUnauthorized, metaData.ResponseCodeFromServer)
		})
	})
	t.Run("forward oauth identity", func(t *testing.T) {
		t.Run("should forward the oauth headers when forward oauth identity is set", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				assert.Equal(t, "foo", r.Header.Get("Authorization"))
				assert.Equal(t, "bar", r.Header.Get("X-ID-Token"))
				fmt.Fprintf(w, `{ "message" : "OK" }`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(models.InfinitySettings{
				URL:                  server.URL,
				AllowedHosts:         []string{server.URL},
				ForwardOauthIdentity: true,
			})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
				assert.Equal(t, "", r.Header.Get("Authorization"))
				assert.Equal(t, "", r.Header.Get("X-ID-Token"))
				fmt.Fprintf(w, `{ "message" : "OK" }`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(models.InfinitySettings{
				URL:                  server.URL,
				AllowedHosts:         []string{server.URL},
				ForwardOauthIdentity: false,
			})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
			client, err := infinity.NewClient(models.InfinitySettings{
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
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
				if r.Header.Get("Authorization") != "Bearer foo" {
					w.WriteHeader(http.StatusUnauthorized)
					return
				}
				w.Header().Set("Content-Type", "application/json")
				_, _ = io.WriteString(w, `{"foo":"bar"}`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(models.InfinitySettings{
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
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "json",
					"source": "url",
					"url":  "%s/something-else"
				}`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.NotNil(t, res.Error)
			assert.Equal(t, fmt.Sprintf("error getting data frame. error getting response from url %s/something-else. no response received. Error: Get \"%s/something-else\": oauth2: cannot fetch token: 401 Unauthorized\nResponse: ", server.URL, server.URL), res.Error.Error())
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
				assert.Equal(t, "", r.Header.Get("X-ID-Token"))
				fmt.Fprintf(w, `{ "message" : "OK" }`)
			}))
			server.TLS = getServerCertificate(server.URL)
			assert.NotNil(t, server.TLS)
			server.StartTLS()
			defer server.Close()
			client, err := infinity.NewClient(models.InfinitySettings{
				URL:                  server.URL,
				AuthenticationMethod: models.AuthenticationMethodNone,
				TLSAuthWithCACert:    true,
				TLSCACert:            mockPEMClientCACet,
			})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{
					"type": "json",
					"url":  "%s",
					"source": "url"
				}`, server.URL)),
			}, *client, map[string]string{"Authorization": "foo", "X-ID-Token": "bar"}, backend.PluginContext{})
			require.NotNil(t, res)
			require.NotNil(t, res.Error)
			assert.Equal(t, fmt.Sprintf("error getting data frame. error getting response from url %s. no response received. Error: Get \"%s\": x509: certificate signed by unknown authority", server.URL, server.URL), res.Error.Error())
			metaData := res.Frames[0].Meta.Custom.(*infinity.CustomMeta)
			require.NotNil(t, metaData)
			require.Equal(t, fmt.Sprintf("error getting response from url %s. no response received. Error: Get \"%s\": x509: certificate signed by unknown authority", server.URL, server.URL), metaData.Error)
			require.Equal(t, http.StatusInternalServerError, metaData.ResponseCodeFromServer)
		})
		t.Run("should honour skip tls verify setting", func(t *testing.T) {
			server := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				assert.Equal(t, "", r.Header.Get("X-ID-Token"))
				fmt.Fprintf(w, `{ "message" : "OK" }`)
			}))
			server.TLS = getServerCertificate(server.URL)
			assert.NotNil(t, server.TLS)
			server.StartTLS()
			defer server.Close()
			client, err := infinity.NewClient(models.InfinitySettings{
				URL:                  server.URL,
				AuthenticationMethod: models.AuthenticationMethodNone,
				InsecureSkipVerify:   true,
			})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
}

func TestResponseFormats(t *testing.T) {
	t.Run("JSON", func(t *testing.T) {
		t.Run("should parse the response and send results", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				fmt.Fprintf(w, `{ "foo" : "bar" }`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
			client, err := infinity.NewClient(models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
			client, err := infinity.NewClient(models.InfinitySettings{URL: ""})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
			experimental.CheckGoldenJSONResponse(t, "testdata", "backend-computed-columns", &res, mock.UPDATE_GOLDEN_DATA)
		})
		t.Run("should filter computed columns", func(t *testing.T) {
			client, err := infinity.NewClient(models.InfinitySettings{URL: ""})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
			experimental.CheckGoldenJSONResponse(t, "testdata", "backend-filter-computed-columns", &res, mock.UPDATE_GOLDEN_DATA)
		})
	})
	t.Run("JSON SQLite", func(t *testing.T) {
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
			client, err := infinity.NewClient(models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
				JSON: []byte(fmt.Sprintf(`{ 
					"type": "json",
					"url":  "%s",
					"source": "url",
					"format": "timeseries",
					"parser": "sqlite",
					"root_selector": "feeds",
					"sqlite": "select * from input"
				}`, server.URL)),
			}, *client, map[string]string{}, backend.PluginContext{})
			require.NotNil(t, res)
			require.Nil(t, res.Error)
			// require.Equal(t, data.FieldTypeNullableFloat64, res.Frames[0].Fields[0].Type())
			// require.Equal(t, data.FieldTypeNullableString, res.Frames[0].Fields[1].Type())
			// require.Equal(t, data.FieldTypeNullableTime, res.Frames[0].Fields[2].Type())
		})
	})
	t.Run("GraphQL", func(t *testing.T) {
		t.Run("should parse the response and send results", func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, http.MethodGet, r.Method)
				fmt.Fprintf(w, `{ "foo" : "bar" }`)
			}))
			defer server.Close()
			client, err := infinity.NewClient(models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
			client, err := infinity.NewClient(models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
			client, err := infinity.NewClient(models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
			client, err := infinity.NewClient(models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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
			client, err := infinity.NewClient(models.InfinitySettings{URL: server.URL})
			require.Nil(t, err)
			res := pluginhost.QueryData(context.Background(), backend.DataQuery{
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

func getServerCertificate(serverName string) *tls.Config {
	caPool := x509.NewCertPool()
	if ok := caPool.AppendCertsFromPEM([]byte(mockPEMClientCACet)); !ok {
		return nil
	}
	return &tls.Config{ServerName: serverName, RootCAs: caPool}
}

var mockPEMClientCACet = `-----BEGIN CERTIFICATE-----
MIID3jCCAsagAwIBAgIgfeRMmudbqVL25f2u2vfOW1D94ak+ste/pCrVBCAZemow
DQYJKoZIhvcNAQEFBQAwfzEJMAcGA1UEBhMAMRAwDgYDVQQKDAdleGFtcGxlMRAw
DgYDVQQLDAdleGFtcGxlMRQwEgYDVQQDDAtleGFtcGxlLmNvbTEiMCAGCSqGSIb3
DQEJARYTaGVsbG9AbG9jYWxob3N0LmNvbTEUMBIGA1UEAwwLZXhhbXBsZS5jb20w
HhcNMjEwNTEyMjExNDE3WhcNMzEwNTEzMjExNDE3WjBpMQkwBwYDVQQGEwAxEDAO
BgNVBAoMB2V4YW1wbGUxEDAOBgNVBAsMB2V4YW1wbGUxFDASBgNVBAMMC2V4YW1w
bGUuY29tMSIwIAYJKoZIhvcNAQkBFhNoZWxsb0Bsb2NhbGhvc3QuY29tMIIBIjAN
BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr2Sc7JXdo94OBImxLauD20fHLAMt
rSFzUMlPJTYalGhuUXRfT6oIr4uf3jydCHT0kkoBKSOurl230Vj8dArN5Pe/+xFM
tgBmSCiFF7NcdvvW8VH5OmJK7j89OAt7DqIzeecqziNBTnWoxnDXbzv4EG994MEU
BtKO8EKPFpxpa5dppN6wDzzLhV1GuhGZRo0aI/Fg4AXWMD3UX2NFHyc7VymhetFL
enereKqQNhMghZL9x/SYkV0j4hkx3dT6t6YthJ0W1E/ATPwyCeNBdTuSVeQe5tm3
QsLIhLf8h5vBphtGClPAdcmKpujOpraBVNk1KGE3Ij+l/sx2lHt031pzxwIDAQAB
o1wwWjAdBgNVHQ4EFgQUjD6ckZ1Y3SA71L+kgT6JqzNWr3AwHwYDVR0jBBgwFoAU
jD6ckZ1Y3SA71L+kgT6JqzNWr3AwGAYDVR0RBBEwD4INKi5leGFtcGxlLmNvbTAN
BgkqhkiG9w0BAQUFAAOCAQEAQdNZna5iggoJErqNDjysHKAHd+ckLLZrDe4uM7SZ
hk3PdO29Ez5Is0aM4ZdYm2Jl0T5PR79adC4d5wHB4GRDBk0IFZmaTZnYmoRQGa0a
O0dRF0i35jbpWudqeKDi+dyWl05NVDC7TY9uLByqNxUgaG21/BMhxjgR4GI8vbEP
rF3wUqxK2LawghsB7hzT/XWZmAwz56nMKasfV2Mf2UhpnkALIfeEcwuLxVdvUqsV
kxoDsydZaDV+uf8aeQYZvvc9qvONSXWuDcU7uMr9PioXgSHwSOO8UrPbb16TOuhi
WVZwQfmwUtNEQ3zkAYo2g4ZL/LJsmvrmEqwD7csToi/HtQ==
-----END CERTIFICATE-----`
