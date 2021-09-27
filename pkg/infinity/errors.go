package infinity

import "errors"

var (
	ErrorNotImplemented            = errors.New("not implemented")
	ErrorInvalidTlsClientCertOrKey = errors.New("invalid Client cert or key")
	ErrorInvalidTlsCACert          = errors.New("invalid TLS CA certificate")
)
