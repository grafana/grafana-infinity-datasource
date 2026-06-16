package httpclient_test

import (
	"crypto/tls"
	"errors"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/httpclient"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/stretchr/testify/assert"
)

func Test_getTLSConfigFromSettings(t *testing.T) {
	t.Run("default settings should return default client", func(t *testing.T) {
		got, err := httpclient.GetTLSConfigFromSettings(models.InfinitySettings{})
		assert.Equal(t, nil, err)
		assert.Equal(t, &tls.Config{}, got)
		assert.Equal(t, false, got.InsecureSkipVerify)
	})
	t.Run("InsecureSkipVerify settings", func(t *testing.T) {
		got, err := httpclient.GetTLSConfigFromSettings(models.InfinitySettings{
			InsecureSkipVerify: true,
		})
		assert.Equal(t, nil, err)
		assert.Equal(t, &tls.Config{
			InsecureSkipVerify: true,
		}, got)
	})
	t.Run("InsecureSkipVerify settings with Servername", func(t *testing.T) {
		got, err := httpclient.GetTLSConfigFromSettings(models.InfinitySettings{
			InsecureSkipVerify: true,
			ServerName:         "foo",
		})
		assert.Equal(t, nil, err)
		assert.Equal(t, &tls.Config{
			InsecureSkipVerify: true,
			ServerName:         "foo",
		}, got)
	})
	t.Run("invalid TLSAuthWithCACert should throw error", func(t *testing.T) {
		_, err := httpclient.GetTLSConfigFromSettings(models.InfinitySettings{
			TLSAuthWithCACert: true,
			TLSCACert:         "hello",
		})
		assert.Equal(t, errors.New("invalid TLS CA certificate"), err)
	})
	t.Run("valid TLSAuthWithCACert should not throw error", func(t *testing.T) {
		_, err := httpclient.GetTLSConfigFromSettings(models.InfinitySettings{
			TLSAuthWithCACert: true,
			TLSCACert:         mockPEMClientCACet,
		})
		assert.Equal(t, nil, err)
	})
	t.Run("empty TLSClientCert should throw error", func(t *testing.T) {
		_, err := httpclient.GetTLSConfigFromSettings(models.InfinitySettings{
			TLSClientAuth: true,
		})
		assert.Equal(t, errors.New("invalid Client cert or key"), err)
	})
	t.Run("invalid TLSClientCert should throw error", func(t *testing.T) {
		_, err := httpclient.GetTLSConfigFromSettings(models.InfinitySettings{
			TLSClientAuth: true,
			TLSClientCert: "hello",
			TLSClientKey:  "hello",
		})
		assert.Equal(t, errors.New("tls: failed to find any PEM data in certificate input"), err)
	})
	t.Run("valid TLSClientCert should not throw error", func(t *testing.T) {
		_, err := httpclient.GetTLSConfigFromSettings(models.InfinitySettings{
			TLSClientAuth: true,
			TLSClientCert: mockClientCert,
			TLSClientKey:  mockClientKey,
		})
		assert.Equal(t, nil, err)
	})
	t.Run("valid TLS settings should not throw error", func(t *testing.T) {
		got, err := httpclient.GetTLSConfigFromSettings(models.InfinitySettings{
			InsecureSkipVerify: true,
			TLSClientAuth:      true,
			TLSClientCert:      mockClientCert,
			TLSClientKey:       mockClientKey,
			TLSAuthWithCACert:  true,
			TLSCACert:          mockPEMClientCACet,
		})
		assert.Equal(t, nil, err)
		assert.Equal(t, true, got.InsecureSkipVerify)
	})
}

const (
	mockPEMClientCACet = `-----BEGIN CERTIFICATE-----
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
	mockClientCert = `-----BEGIN CERTIFICATE-----
MIID4zCCAsugAwIBAgIgH+7x+fQuPf1fUiqXgk7Cp9owHJYKT7RfrrMDnf5Nn6ow
DQYJKoZIhvcNAQEFBQAwgYExCTAHBgNVBAYTADEQMA4GA1UECgwHZXhhbXBsZTEQ
MA4GA1UECwwHZXhhbXBsZTEUMBIGA1UEAwwLZXhhbXBsZS5jb20xJDAiBgkqhkiG
9w0BCQEWFWV4YW1wbGVAbG9jYWxob3N0LmNvbTEUMBIGA1UEAwwLZXhhbXBsZS5j
b20wHhcNMjEwNTEyMjExNzE0WhcNMzEwNTEzMjExNzE0WjBrMQkwBwYDVQQGEwAx
EDAOBgNVBAoMB2V4YW1wbGUxEDAOBgNVBAsMB2V4YW1wbGUxFDASBgNVBAMMC2V4
YW1wbGUuY29tMSQwIgYJKoZIhvcNAQkBFhVleGFtcGxlQGxvY2FsaG9zdC5jb20w
ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC4p/RMDtjY4GtaX+Wi4Bhi
0TeqxRdfPcn8TivrVNk3D9LtVrO6z7+63GyDMyFNcymc7cUN4gtcyUwUzvYkmMzC
1IRDlmAhw6nFGhhZXyrouWUZNoW1eqiRe6+rQ2UYh3/X4yQ1fyBfj7W+QdjFDSt6
tpILn2R1HwJk9udt6pG00LGUESAoPu0gAbBjRF2mgT+PtrdFf+ZJbG/lGJIzRhMU
rH7SL+kVQF2l7ZsY5usK0uWl2XoPuVfAsz/es+7C49wE3s63ECU5vwFK1OEbqcBc
jbXRz6h0FJcIPMvtzs9lLokZe2UtvimN4cg3g9dRYhe4UmUBxtpg/UHNrivcCJNH
AgMBAAGjXDBaMB0GA1UdDgQWBBTDM3rROqCZPxpAKgSf9HtXLAfliTAfBgNVHSME
GDAWgBTDM3rROqCZPxpAKgSf9HtXLAfliTAYBgNVHREEETAPgg0qLmV4YW1wbGUu
Y29tMA0GCSqGSIb3DQEBBQUAA4IBAQAHIWPv/LYK3Cx2+9XSRH68hWBJZ7fYHPMz
Jx+EGwcIhGw+iVyiHpHKlv0euZgLUOhSwRakA6XQd3xyAXmccxE7Ckus2mPv31ho
tEO4/LEK3LQLCdJR0iiCbA+MhggB/UCURGOxp0Kc7H2KPFcpn6DbPqz9bKL4RYpq
7uEYT8yoAx+hTsB1ksI16LcOGnRXkU1MvJ4P4NO22tVQo9tLwXPHuYo86Hbh9pq2
nNdCWucR7xrP8agn/WckpkM63aHBln7hWiMiS/Sk8Y0F+aZDDFU+VtusHwOtYUiP
VgHrQdHpGg7AdnwqcdXBDBhm2gJn2IhpWX2cvuY9lokuXwAPbcdJ
-----END CERTIFICATE-----`
	mockClientKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAuKf0TA7Y2OBrWl/louAYYtE3qsUXXz3J/E4r61TZNw/S7Vaz
us+/utxsgzMhTXMpnO3FDeILXMlMFM72JJjMwtSEQ5ZgIcOpxRoYWV8q6LllGTaF
tXqokXuvq0NlGId/1+MkNX8gX4+1vkHYxQ0reraSC59kdR8CZPbnbeqRtNCxlBEg
KD7tIAGwY0RdpoE/j7a3RX/mSWxv5RiSM0YTFKx+0i/pFUBdpe2bGObrCtLlpdl6
D7lXwLM/3rPuwuPcBN7OtxAlOb8BStThG6nAXI210c+odBSXCDzL7c7PZS6JGXtl
Lb4pjeHIN4PXUWIXuFJlAcbaYP1Bza4r3AiTRwIDAQABAoIBACgpEydVlVD54i9K
Kwn0/ijDwv0nl3E14Y+3urKYhhOFJAVNdZJ8K4Fq/ki8npIXKWZBijl+P6Vi/GKM
LpmACAyZptiCRI8jXHGLPt91JMJvy+6jXoo9TpsxkN/JLRwcIDBmbNIbv4E5Irhp
3sjgl+O9AF95v6H/aAhocKYFvcHawMSTsGU++okI7FyDqQgaam7f+MmazpWM6DOX
cvdzIHvl3FmvApfuBZsGWPpcWcVqXrFWQiOZAvp9cgJLfesklGRSDq3I4ttG0ZYS
pslFShelazzX2ngbUA5GXpJfsGKVXWNV3kOYietJLwZ8uLJMkPDBBwjZB0vdL8Dz
AqEkxuUCgYEA7i/SfJwwR+ZVbojuABvIobguo21t5RawvsM1E714PgTR8uoFSFtr
y41Lc+3uVZqgNv621S2jQknqHrBBLdk8aPonI6UKIrxf3i1PR8akaM01ed1PwMnR
ATE2S1eqruOZb8x1/e6EO29qT6Vs+TP78OhiqvTqUfIcoiPnRELoCu0CgYEAxndE
ACTExNFL0fgUXmPo0mg2zacr0ctDTFQ/R7NO3uUVY78VmZ+kUbT9SNcNvSTnr6xD
kOwyAIfwdo+0UIW/tFSABtDDSK94JAGdr7+LEcQ/QyAmp1KDTmaFrKOkijd/9bev
FVa43+ykdNmKbmHXfvvL6tVMrPwTADLNR3yLbIMCgYEAsCp+q9t5ejRKC68LGNlz
0ui+1fEhzsaxguYuY6NHQ9ec0OV1csbrO2oN3HimRnpO9V3/LDzM+0Jf/sKt8pMx
sxMRz7NJg9d/sHwinxu0ji741mFxk02xYAhd9+unOiLsYVwACQhYlP0azD22E7r3
JH88OuVaSbGgq+uSKVKy/SECgYEAmHdJQz779yO+tqh5pWXll7a921GA5WPc6IeU
MZX7klq1CvLiOimdR7PeHRYxFMyEPL3/DheV9jh4r+yIHpARjQyZaiL40x8SEb84
D6r7wINeAkhxyXsnKpSyPsVcg15NrEwXcjI0Rrp6QNZadaAut/viVR7WD9J7Glzs
vO1eAtcCgYEAkStplP9m3IM65eg+OdMqVD4CPohTfmfL/wzailB9QzTy9SNaEvfV
JIoTknAYsX8acOy3XzTdA+mN139mLnG+Tpu1bbjcJLihtPieo5NVWBi/jZedo0Ex
l7aV0Ij7+2S+ynhQUspKZ+fu3Ng+UuMauX9RpkMsfxRyKuj4WrOMVfI=
-----END RSA PRIVATE KEY-----`
)
