package infinity_test

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"

	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestInfinityClient_GetResults(t *testing.T) {
	tests := []struct {
		name           string
		settings       models.InfinitySettings
		requestHeaders map[string]string
		query          models.Query
		wantO          any
		wantErr        bool
	}{
		{
			name:     "should return csv when no mode specified",
			settings: models.InfinitySettings{},
			query: models.Query{
				URL:  fmt.Sprintf("%s%s", mockCSVDomain, mockCSVURL),
				Type: "csv",
			},
			wantO: mockCSVDATA,
		},
		{
			name:     "should return xml when no mode specified",
			settings: models.InfinitySettings{},
			query: models.Query{
				URL:  fmt.Sprintf("%s%s", mockXMLDomain, mockXMLURL),
				Type: "xml",
			},
			wantO: mockXMLDATA,
		},
		{
			name: "should return correct csv in advanced mode",
			settings: models.InfinitySettings{
				URL: mockCSVDomain,
			},
			query: models.Query{
				URL:  mockCSVURL,
				Type: "csv",
			},
			wantO: mockCSVDATA,
		},
		{
			name:     "should return correct json",
			settings: models.InfinitySettings{},
			query: models.Query{
				URL:  fmt.Sprintf("%s%s", mockJSONDomain, mockJSONURL),
				Type: "json",
			},
			wantO: []any([]any{map[string]any{"age": 20.0, "name": "foo"}, map[string]any{"age": 25.0, "name": "bar"}}),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := &infinity.Client{
				Settings:   tt.settings,
				HttpClient: &http.Client{},
			}
			pluginContext := &backend.PluginContext{}
			gotO, statusCode, duration, err := client.GetResults(context.Background(), pluginContext, tt.query, tt.requestHeaders)
			if (err != nil) != tt.wantErr {
				t.Errorf("GetResults() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			assert.Equal(t, tt.wantO, gotO)
			assert.NotNil(t, statusCode)
			assert.NotNil(t, duration)
		})
	}
}

func TestGetQueryBody(t *testing.T) {
	tests := []struct {
		name  string
		query models.Query
		want  io.Reader
	}{
		{
			name:  "should not include body for urls without method",
			query: models.Query{URLOptions: models.URLOptions{Body: "foo"}},
		},
		{
			name:  "should not include body for GET method",
			query: models.Query{URLOptions: models.URLOptions{Method: "get", Body: "foo"}},
		},
		{
			name:  "should include body for PATCH method if provided",
			query: models.Query{URLOptions: models.URLOptions{Method: "patch", Body: "foo"}},
			want:  strings.NewReader("foo"),
		},
		{
			name: "should not include body for DELETE method if not provided",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := infinity.GetQueryBody(context.TODO(), tt.query)
			if tt.want == nil {
				require.Nil(t, got)
				return
			}
			require.NotNil(t, got)
		})
	}
}

func TestCanAllowURL(t *testing.T) {
	type testItem = struct {
		name        string
		url         string
		allowedUrls []string
		allow       bool
	}
	tests := []testItem{
		{name: "should allow if no allowed urls found by default", url: "https://foo.com", allow: true},
		{name: "should allow if url matches url in allowed list", url: "https://foo.com", allowedUrls: []string{"https://foo.com"}, allow: true},
		{name: "should allow if url matches one of the url in the allowed list", url: "https://foo.com/", allowedUrls: []string{"https://bar.com/", "https://foo.com/", "https://baz.com/"}, allow: true},
		{name: "should allow localhost", url: "localhost:3000", allowedUrls: []string{"localhost"}, allow: true},
		{name: "should not allow if the hostname doesn't match", url: "https://bar.com", allowedUrls: []string{"https://foo.com"}},
		{name: "should not allow if the case of the URL doesn't match", url: "https://FOO.com", allowedUrls: []string{"https://foo.com"}},
		{name: "should now allow if the path is not matching in the allowed list", url: "https://foo.com/b", allowedUrls: []string{"https://foo.com/a"}},
		{name: "should now allow if localhost port doesn't match", url: "localhost:3000", allowedUrls: []string{"localhost:8080"}},
	}
	// patterns found from https://portswigger.net/web-security/ssrf/url-validation-bypass-cheat-sheet
	malciousUrls := []string{
		"https://\\bar.com/",
		"https://foo.com &%40bar.com# %40bar.com/",
		"https://foo.com;.bar.com/",
		"https://foo.com:%40bar.com/",
		"https://foo.com:443:\\%40%40bar.com/",
		"https://foo.com:443\\%40bar.com/",
		"https://foo.com:anything%40bar.com/",
		"https://foo.com.%5F.bar.com/",
		"https://foo.com.-.bar.com/",
		"https://foo.com.%2C.bar.com/",
		"https://foo.com.;.bar.com/",
		"https://foo.com.%21.bar.com/",
		"https://foo.com.%27.bar.com/",
		`https://foo.com.".bar.com/`,
		"https://foo.com.%28.bar.com/",
		"https://foo.com.%29.bar.com/",
		"https://foo.com.{.bar.com/",
		"https://foo.com.}.bar.com/",
		"https://foo.com.*.bar.com/",
		"https://foo.com.&.bar.com/",
		"https://foo.com.`.bar.com/",
		"https://foo.com.+.bar.com/",
		"https://foo.com.bar.com/",
		"https://foo.com.=.bar.com/",
		"https://foo.com.%7E.bar.com/",
		"https://foo.com.%24.bar.com/",
		"https://foo.com%5B%40bar.com/",
		"https://foo.com%40bar.com/",
		"https://foo.com\\;%40bar.com/",
		"https://foo.com&anything%40bar.com/",
		"https://foo.com%2523bar.com/",
		"https://foo.combar.com/",
		"https://bar.com%09foo.com/",
		"https://bar.com%0Afoo.com/",
		"https://bar.com%0D%0Afoo.com/",
		"https://bar.com%0Dfoo.com/",
		"https://bar.com%E2%80%A8foo.com/",
		"https://bar.com%E2%80%A9foo.com/",
		"https://bar.com %40foo.com/",
		"https://bar.com &%40foo.com/",
		"https://bar.com foo.com/",
		"https://bar.com;https://foo.com/",
		"https://bar.com:\\%40%40foo.com/",
		"0://bar.com:80;http://foo.com:80/",
		"https://bar.com?foo.com/",
		"https://bar.com?%00foo.com/",
		"https://bar.com?=.foo.com/",
		"https://bar.com?=foo.com/",
		"https://bar.com?http://foo.com/",
		"https://bar.com?https://foo.com/",
		"https://bar.com../",
		"http://bar.com.foo.com/",
		"https://bar.com.foo.com/",
		"https://bar.com%EF%BC%8Efoo.com/",
		"https://bar.com%40%40foo.com/",
		"https://bar.com%40foo.com/",
		"https://bar.com/?d=foo.com/",
		"https://bar.com/.foo.com/",
		"https://bar.com///foo.com/",
		"https://bar.com/foo.com/",
		"https://bar.com\\.foo.com/",
		"https://bar.com\\%40%40foo.com/",
		"https://bar.com\foo.com/",
		"https://bar.com\anything%40foo.com/",
		"https://bar.com%EF%BC%86foo.com/",
		"https://bar.com%EF%B9%A0foo.com/",
		"https://bar.com#%40foo.com/",
		`https://bar.com#\%40foo.com/`,
		"https://bar.com#foo.com/",
		"https://bar.com#%00foo.com/",
		"https://bar.com%250d%250a%40foo.com/",
		"https://bar.com%2523%40foo.com/",
		"https://bar.com%252e%40foo.com/",
		"https://bar.com%252f%40foo.com/",
		"https://bar.com%253a443.foo.com/",
		"https://bar.com%25fffoo.com/",
		"https://bar.com+%40foo.com/",
		"https://bar.com+&%40foo.com/",
		"https://bar.com%00foo.com/",
		"http://anythingfoo.com/",
		"https://anythingfoo.com/",
		"https://foo%40bar.com %40foo.com/",
		"https://foo%40bar.com:443%40foo.com/",
		"http://localhost.bar.com/",
		"https://localhost.bar.com/",
		"http://sfoo.com/",
		"https://%09bar.com/",
		"https://%0Abar.com/",
		"%0D%0A//bar.com",
		"%0D%0A\\bar.com",
		"%40bar.com",
		"http:%40bar.com",
		"https:%40bar.com",
		"///bar.com",
		"//bar.com",
		"/\bar.com",
		"/&bsol;/bar.com",
		"/&NewLine;/bar.com",
		"/&sol;/bar.com",
		"/&Tab;/bar.com",
		"\\%09\bar.com",
		"\\%0A\bar.com",
		"\\/\\/bar.com",
		"\\/bar.com",
		"http:\\bar.com\\",
		"#bar.com",
		"http:bar.com",
		"https:bar.com",
		"%00http://bar.com",
		"%01http://bar.com",
		"%02http://bar.com",
		"%03http://bar.com",
		"%04http://bar.com",
		"%05http://bar.com",
		"%06http://bar.com",
		"%07http://bar.com",
		"%08http://bar.com",
		"%09http://bar.com",
		"%0Ahttp://bar.com",
		"%0Bhttp://bar.com",
		"%0Chttp://bar.com",
		"%0Dhttp://bar.com",
		"%0Ehttp://bar.com",
		"%0Fhttp://bar.com",
		"%10http://bar.com",
		"%11http://bar.com",
		"%12http://bar.com",
		"%13http://bar.com",
		"%14http://bar.com",
		"%15http://bar.com",
		"%16http://bar.com",
		"%17http://bar.com",
		"%18http://bar.com",
		"%19http://bar.com",
		"%1Ahttp://bar.com",
		"%1Bhttp://bar.com",
		"%1Chttp://bar.com",
		"%1Dhttp://bar.com",
		"%1Ehttp://bar.com",
		"%1Fhttp://bar.com",
		" http://bar.com",
		"h%09ttp://bar.com",
		"h%0Attp://bar.com",
		"h%0Dttp://bar.com",
		"http%09://bar.com",
		"http%0A://bar.com",
		"http%0D://bar.com",
		"%09http%09://bar.com",
		"%0Ahttp%0A://bar.com",
		"%0Dhttp%0D://bar.com",
		"http:/\bar.com",
		"http:/\\bar.com",
		"http:\\bar.com",
		"http:\bar.com",
		"http:/bar.com",
		"http:/0/bar.com",
		"https://%E2%80%8Bbar.com/",
		"https://%E2%81%A0bar.com/",
		"https://%C2%ADbar.com/",
		"https://%5B::%5D/",
		"https://%5B::1%5D/",
		"https://%5B::ffff:0.0.0.0%5D/",
		"https://%5B::ffff:0000:0000%5D/",
		"https://%5B::ffff:7f00:1%5D/",
		"https://%5B::%EF%AC%80%EF%AC%80:7f00:1%5D/",
		"https://%5B0:0:0:0:0:ffff:127.0.0.1%5D/",
		"https://%5B0:0:0:0:0:ffff:1%E3%89%97.0.0.1%5D/",
		"https://%5B0:0:0:0:0:ffff:%E2%91%AB7.0.0.1%5D/",
		"https://%5B0:0:0:0:0:%EF%AC%80%EF%AC%80:127.0.0.1%5D/",
		"https://%5B0000::1%5D/",
		"https://%5B0000:0000:0000:0000:0000:0000:0000:0000%5D/",
		"https://%5B0000:0000:0000:0000:0000:0000:0000:0001%5D/",
		"https://%400/",
		"https://\\l\\o\\c\\a\\l\\h\\o\\s\\t/",
		"https://foo.com.local/",
		"https://foo.com.localhost/",
		"https://0/",
		"0:80",
		"https://0.0.0.0/",
		"https://0000.0000.0000.0000/",
		"https://00000177.00000000.00000000.00000001/",
		"https://0177.0000.0000.0001/",
		"https://017700000001/",
		"https://0%E2%91%B0700000001/",
		"https://0x00000000/",
		"https://0x100000000/",
		"https://0x17f000001/",
		"https://0x17f000002/",
		"https://0x7F.0.0000.00000001/",
		"https://0x7F.0.0000.0001/",
		"https://0x7f.0x00.0x00.0x01/",
		"https://0x7f.0x00.0x00.0x02/",
		"https://0x7F.1/",
		"https://0x7f000001/",
		"https://0x7f000002/",
		"https://127.0.0.1/",
		"https://1%E3%89%97.0.0.1/",
		"https://%E2%91%AB7.0.0.1/",
		"https://127.0.0.2/",
		"https://1%E3%89%97.0.0.2/",
		"https://%E2%91%AB7.0.0.2/",
		"https://127.000000000000000.1/",
		"https://127.1/",
		"https://2130706433/",
		"https://21307064%E3%89%9D/",
		"https://2130706%E3%8A%B83/",
		"https://21%E3%89%9A706433/",
		"https://2%E2%91%AC0706433/",
		"https://%E3%89%9130706433/",
		"https://%E3%89%91%E3%89%9A%E2%91%A6%E2%93%AA%E2%91%A5%E2%91%A3%E3%89%9D/",
		"https://45080379393/",
		"https://localhost/",
		"https://%C2%ADlocalhost/",
		"https://%CD%8Flocalhost/",
		"https://%E1%A0%8Blocalhost/",
		"https://%E1%A0%8Clocalhost/",
		"https://%E1%A0%8Dlocalhost/",
		"https://%E1%A0%8Elocalhost/",
		"https://%E1%A0%8Flocalhost/",
		"https://%E2%80%8Blocalhost/",
		"https://%E2%81%A0localhost/",
		"https://%E2%81%A4localhost/",
		"https://localho%EF%AC%86/",
		"https://lo%E3%8E%88host/",
		"https://localho%EF%AC%85/",
		"https://fooxcom/",
	}
	for _, v := range malciousUrls {
		tests = append(tests, testItem{url: v, allowedUrls: []string{"https://foo.com"}})
	}
	for _, tt := range tests {
		testName := tt.name
		if testName == "" {
			testName = tt.url
		}
		t.Run(testName, func(t *testing.T) {
			got := infinity.CanAllowURL(tt.url, tt.allowedUrls)
			assert.Equal(t, tt.allow, got)
		})
	}
}

const (
	mockCSVDomain = "https://gist.githubusercontent.com"
	mockCSVURL    = "/yesoreyeram/64a46b02f0bf87cb527d6270dd84ea47/raw/32ae9b1a4a0183dceb3596226b818c8f428193af/sample-with-quotes.csv"
	mockCSVDATA   = `"country","city"
"india","delhi"
"england","london"
"australia","sydney, canberra"`
	mockXMLDomain = "https://gist.githubusercontent.com"
	mockXMLURL    = "/yesoreyeram/655a362eed0f51be24e16d3f1127a31d/raw/0cdc6302b7c6a2dec69606d9471b56c843863054/simple.xml"
	mockXMLDATA   = `<?xml version="1.0" encoding="UTF-8"?>
<CATALOG><CD><TITLE>Empire Burlesque</TITLE></CD><CD><TITLE>Hide your heart</TITLE></CD></CATALOG>`
	mockJSONDomain = "https://gist.githubusercontent.com"
	mockJSONURL    = "/yesoreyeram/655a362eed0f51be24e16d3f1127a31d/raw/7b5dac1fe0a5d5ce47c9251117f73ade363b7ca8/users.json"
)
