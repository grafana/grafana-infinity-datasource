package mock

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/infinity"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/models"
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
	client, _ := infinity.NewClient(models.InfinitySettings{})
	client.HttpClient.Transport = &InfinityMocker{Body: body}
	client.IsMock = true
	return client
}
