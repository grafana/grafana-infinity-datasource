package infinity

import (
	"crypto/tls"
	"net/http"
	"net/http/httptrace"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

func reqWithHTTPTraceContext(req *http.Request, logger log.Logger) *http.Request {
	trace := &httptrace.ClientTrace{
		DNSStart: func(di httptrace.DNSStartInfo) {
			logger.Debug("HTTPTrace event", "event_name", "DNSStart")
		},
		DNSDone: func(dnsInfo httptrace.DNSDoneInfo) {
			logger.Debug("HTTPTrace event", "event_name", "DNSDone")
		},
		ConnectStart: func(network, addr string) {
			logger.Debug("HTTPTrace event", "event_name", "ConnectStart")
		},
		ConnectDone: func(network, addr string, err error) {
			logger.Debug("HTTPTrace event", "event_name", "ConnectDone")
		},
		GetConn: func(hostPort string) {
			logger.Debug("HTTPTrace event", "event_name", "GetConn")
		},
		GotConn: func(connInfo httptrace.GotConnInfo) {
			logger.Debug("HTTPTrace event", "event_name", "GotConn")
		},
		TLSHandshakeStart: func() {
			logger.Debug("HTTPTrace event", "event_name", "TLSHandshakeStart")
		},
		TLSHandshakeDone: func(cs tls.ConnectionState, err error) {
			logger.Debug("HTTPTrace event", "event_name", "TLSHandshakeDone")
		},
		GotFirstResponseByte: func() {
			logger.Debug("HTTPTrace event", "event_name", "GotFirstResponseByte")
		},
	}
	return req.WithContext(httptrace.WithClientTrace(req.Context(), trace))
}
