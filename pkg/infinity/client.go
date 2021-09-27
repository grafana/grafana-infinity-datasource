package infinity

import (
	"crypto/tls"
	"crypto/x509"
	"net/http"
	"time"
)

type Client struct {
	Config     InfinityConfig
	HttpClient *http.Client
}

func GetTLSConfigFromConfig(settings InfinityConfig) (*tls.Config, error) {
	tlsConfig := &tls.Config{
		InsecureSkipVerify: settings.InsecureSkipVerify,
		ServerName:         settings.ServerName,
	}
	if settings.TlsClientAuth {
		if settings.TlsClientCert == "" || settings.TlsClientKey == "" {
			return nil, ErrorInvalidTlsClientCertOrKey
		}
		cert, err := tls.X509KeyPair([]byte(settings.TlsClientCert), []byte(settings.TlsClientKey))
		if err != nil {
			return nil, err
		}
		tlsConfig.Certificates = []tls.Certificate{cert}
	}
	if settings.TlsAuthWithCACert && settings.TlsCACert != "" {
		caPool := x509.NewCertPool()
		ok := caPool.AppendCertsFromPEM([]byte(settings.TlsCACert))
		if !ok {
			return nil, ErrorInvalidTlsCACert
		}
		tlsConfig.RootCAs = caPool
	}
	return tlsConfig, nil
}

func NewClient(settings InfinityConfig) (client *Client, err error) {
	tlsConfig, err := GetTLSConfigFromConfig(settings)
	if err != nil {
		return nil, err
	}
	transport := &http.Transport{
		TLSClientConfig: tlsConfig,
	}
	httpClient := &http.Client{
		Transport: transport,
		Timeout:   time.Second * time.Duration(settings.TimeoutInSeconds),
	}
	return &Client{
		Config:     settings,
		HttpClient: httpClient,
	}, err
}
