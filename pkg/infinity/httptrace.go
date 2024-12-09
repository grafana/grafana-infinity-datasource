package infinity

import (
	"crypto/tls"
	"net/http"
	"net/http/httptrace"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func reqWithHTTPTraceContext(req *http.Request) *http.Request {
	ctx := req.Context()
	logger := backend.Logger.FromContext(ctx)
	trace := &httptrace.ClientTrace{
		GetConn: func(hostPort string) {
			logger.Debug("HTTPTrace event", "event_name", "GetConn")
		},
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
			if err != nil {
				logger.Error("HTTPTrace event", "event_name", "ConnectDone", "error", err.Error())
				return
			}
			logger.Debug("HTTPTrace event", "event_name", "ConnectDone", "address", addr)
		},
		TLSHandshakeStart: func() {
			logger.Debug("HTTPTrace event", "event_name", "TLSHandshakeStart")
		},
		TLSHandshakeDone: func(cs tls.ConnectionState, err error) {
			if err != nil {
				logger.Error("HTTPTrace event", "event_name", "TLSHandshakeDone", "error", err.Error())
				return
			}
			logger.Debug("HTTPTrace event", "event_name", "TLSHandshakeDone")
		},
		GotConn: func(connInfo httptrace.GotConnInfo) {
			logger.Debug("HTTPTrace event", "event_name", "GotConn", "remote_address", connInfo.Conn.RemoteAddr().String())
		},
		GotFirstResponseByte: func() {
			logger.Debug("HTTPTrace event", "event_name", "GotFirstResponseByte")
		},
	}
	return req.WithContext(httptrace.WithClientTrace(ctx, trace))
}
