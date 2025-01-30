package testsuite_test

import (
	"bytes"
	"compress/gzip"
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/require"
)

const UPDATE_GOLDEN_DATA = false

type InfinityMocker struct {
	Body     string
	FileName string // filename (relative path of where it is being called)
}

func (rt *InfinityMocker) RoundTrip(req *http.Request) (*http.Response, error) {
	responseBody := "{}"
	if rt.Body != "" {
		responseBody = rt.Body
	}
	res := &http.Response{
		StatusCode: http.StatusOK,
		Status:     "200 OK",
		Body:       io.NopCloser(bytes.NewBufferString(responseBody)),
	}
	if rt.FileName != "" {
		b, err := os.ReadFile(rt.FileName)
		if err != nil {
			return res, fmt.Errorf("error reading testdata file %s", rt.FileName)
		}
		reader := io.NopCloser(bytes.NewReader(b))
		res.Body = reader
	}
	if res.Body != nil {
		return res, nil
	}
	return nil, errors.New("fake client not working as expected. If you got this error fix this method")
}

func New(body string) *infinity.Client {
	client, _ := infinity.NewClient(context.TODO(), models.InfinitySettings{})
	client.HttpClient.Transport = &InfinityMocker{Body: body}
	client.IsMock = true
	return client
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

func getServerWithGZipCompressedResponse(t *testing.T, content string) *httptest.Server {
	t.Helper()
	server := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Encoding", "gzip")
		gw := gzip.NewWriter(w)
		defer gw.Close()
		_, err := gw.Write([]byte(content))
		require.Nil(t, err)
	}))
	listener, err := net.Listen("tcp", "127.0.0.1:8080")
	require.Nil(t, err)
	server.Listener.Close()
	server.Listener = listener
	return server
}

func getServerCertificate(serverName string) *tls.Config {
	caPool := x509.NewCertPool()
	if ok := caPool.AppendCertsFromPEM([]byte(mockPEMClientCACet)); !ok {
		return nil
	}
	return &tls.Config{ServerName: serverName, RootCAs: caPool}
}

func toFP(v float64) *float64 {
	return &v
}

func toSP(v string) *string {
	return &v
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
