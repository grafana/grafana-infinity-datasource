package parsers

import (
	"errors"
	"strings"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/experimental"
	"github.com/stretchr/testify/require"
)

func TestColumns(t *testing.T) {
	gotString, err := GetColumnValuesFromResponseString(`[
		{ "username": "foo", "age": 1, "height" : 123,  "isPremium": true, "hobbies": ["reading","swimming"] },
		{ "username": "bar", "age": 2, "height" : 123.45,  "isPremium": false, "hobbies": ["reading","swimming"], "occupation": "student" }
	]`, []ColumnSelector{
		{Selector: "age"},
		{Selector: "occupation"},
	})
	require.Nil(t, err)
	require.NotNil(t, gotString)
	require.Equal(t, `[{"age":1,"occupation":null},{"age":2,"occupation":"student"}]`, gotString)
}

func TestJsonStringToFrame(t *testing.T) {
	updateTestData := false
	tests := []struct {
		name           string
		responseString string
		refId          string
		rootSelector   string
		columns        []ColumnSelector
		wantFrame      *data.Frame
		wantErr        error
	}{
		{
			name:           "empty string should throw error",
			responseString: "",
			wantErr:        errors.New("response type not supported yet. possibly invalid/empty response received"),
		},
		{
			name:           "invalid json should throw error",
			responseString: "{",
			wantErr:        errors.New("response type not supported yet. possibly invalid/empty response received"),
		},
		{
			name:           "valid json object should not throw error",
			responseString: "{}",
		},
		{
			name:           "valid json array should not throw error",
			responseString: "[]",
		},
		{
			name:           "valid string array should not throw error",
			responseString: `["foo", "bar"]`,
		},
		{
			name:           "valid numeric array should not throw error",
			responseString: `[123, 123.45]`,
		},
		{
			name:           "valid json object with data should not throw error",
			responseString: `{ "username": "foo", "age": 1, "height" : 123.45,  "isPremium": true, "hobbies": ["reading","swimming"] }`,
		},
		{
			name:           "valid json array with data should not throw error",
			responseString: `[{ "username": "foo", "age": 1, "height" : 123.45,  "isPremium": true, "hobbies": ["reading","swimming"] }]`,
		},
		{
			name: "valid json array with multiple rows should not throw error",
			responseString: `[
				{ "username": "foo", "age": 1, "height" : 123,  "isPremium": true, "hobbies": ["reading","swimming"] },
				{ "username": "bar", "age": 2, "height" : 123.45,  "isPremium": false, "hobbies": ["reading","swimming"], "occupation": "student" }
			]`,
		},
		{
			name: "without root data and valid json array with multiple rows should not throw error",
			responseString: `{
				"meta" : {},
				"data" : [
					{ "username": "foo", "age": 1, "height" : 123,  "isPremium": true, "hobbies": ["reading","swimming"] },
					{ "username": "bar", "age": 2, "height" : 123.45,  "isPremium": false, "hobbies": ["reading","swimming"], "occupation": "student" }
				]
			}`,
		},
		{
			name: "with root data and valid json array with multiple rows should not throw error",
			responseString: `{
				"meta" : {},
				"data" : [
					{ "username": "foo", "age": 1, "height" : 123,  "isPremium": true, "hobbies": ["reading","swimming"] },
					{ "username": "bar", "age": 2, "height" : 123.45,  "isPremium": false, "hobbies": ["reading","swimming"], "occupation": "student" }
				]
			}`,
			rootSelector: "data",
		},
		{
			name: "with root data and selectors should produce valid frame",
			responseString: `{
				"meta" : {},
				"data" : [
					{ "username": "foo", "age": 1, "height" : 123,  "isPremium": true, "hobbies": ["reading","swimming"] },
					{ "username": "bar", "age": 2, "height" : 123.45,  "isPremium": false, "hobbies": ["reading","swimming"], "occupation": "student" }
				]
			}`,
			rootSelector: "data",
			columns: []ColumnSelector{
				{Selector: "username", Alias: "user-name"},
				{Selector: "occupation"},
			},
		},
		{
			name: "with root data and selectors should produce valid frame for non array object",
			responseString: `{
				"meta" : {},
				"data" : { "username": "bar", "age": 2, "height" : 123.45,  "isPremium": false, "hobbies": ["reading","swimming"], "occupation": "student" }
			}`,
			rootSelector: "data",
			columns: []ColumnSelector{
				{Selector: "username", Alias: "user-name"},
				{Selector: "occupation"},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotFrame, err := JsonStringToFrame(tt.responseString, tt.refId, tt.rootSelector, tt.columns)
			if tt.wantErr != nil {
				require.NotNil(t, err)
				require.Equal(t, tt.wantErr, err)
				return
			}
			require.Nil(t, err)
			require.NotNil(t, gotFrame)
			goldenFileName := strings.Replace(t.Name(), "TestJsonStringToFrame/", "", 1)
			experimental.CheckGoldenJSONFrame(t, "testdata", goldenFileName, gotFrame, updateTestData)
		})
	}
}
