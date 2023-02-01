package testsuite_test

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/experimental"
	"github.com/stretchr/testify/require"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/pluginhost"
)

func TestQueryData(t *testing.T) {
	t.Run("Azure Cost Managment Query", func(t *testing.T) {
		l, err := net.Listen("tcp", "127.0.0.1:3123")
		if err != nil {
			log.Fatal(err)
		}
		server := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			filecontent, _ := readFileContent(t, "./testdata/azure/cost-management-daily.json")
			_, err = w.Write(filecontent)
			require.Nil(t, err)
		}))
		server.Listener.Close()
		server.Listener = l
		server.Start()
		defer server.Close()
		client, err := infinity.NewClient(models.InfinitySettings{AuthenticationMethod: models.AuthenticationMethodNone})
		client.IsMock = true
		require.Nil(t, err)
		require.NotNil(t, client)
		res := pluginhost.QueryData(context.Background(), backend.DataQuery{
			JSON: []byte(fmt.Sprintf(`{
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
				}`, server.URL)),
		}, *client, map[string]string{}, backend.PluginContext{})
		require.NotNil(t, res)
		require.Nil(t, res.Error)
		experimental.CheckGoldenJSONResponse(t, "golden", strings.ReplaceAll(t.Name(), "/", "_"), &res, updateGoldenFile)
	})
}

func readFileContent(t *testing.T, filename string) ([]byte, error) {
	t.Helper()
	return os.ReadFile(filename)
}

const updateGoldenFile = false
