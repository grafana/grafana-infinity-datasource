package framer_test

import (
	"encoding/json"
	"io/ioutil"
	"strings"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/experimental"
	"github.com/stretchr/testify/require"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/framer"
)

func TestToDataFrame(t *testing.T) {
	updateGoldenText := false
	t.Run("nil", func(t *testing.T) {
		var input interface{}
		options := framer.FramerOptions{}
		gotFrame, err := framer.ToDataFrame(t.Name(), input, options, "")
		require.Nil(t, err)
		require.NotNil(t, gotFrame)
		err = experimental.CheckGoldenFrame("testdata/structs/"+strings.ReplaceAll(t.Name(), "TestToDataFrame/", "")+".golden.txt", gotFrame, updateGoldenText)
		require.Nil(t, err)
	})
	t.Run("string", func(t *testing.T) {
		input := `foo`
		options := framer.FramerOptions{}
		gotFrame, err := framer.ToDataFrame(t.Name(), input, options, input)
		require.Nil(t, err)
		require.NotNil(t, gotFrame)
		err = experimental.CheckGoldenFrame("testdata/structs/"+strings.ReplaceAll(t.Name(), "TestToDataFrame/", "")+".golden.txt", gotFrame, updateGoldenText)
		require.Nil(t, err)
	})
	t.Run("integer", func(t *testing.T) {
		input := 21
		options := framer.FramerOptions{}
		gotFrame, err := framer.ToDataFrame(t.Name(), input, options, "21")
		require.Nil(t, err)
		require.NotNil(t, gotFrame)
		err = experimental.CheckGoldenFrame("testdata/structs/"+strings.ReplaceAll(t.Name(), "TestToDataFrame/", "")+".golden.txt", gotFrame, updateGoldenText)
		require.Nil(t, err)
	})
	t.Run("float", func(t *testing.T) {
		input := 21.43
		options := framer.FramerOptions{}
		gotFrame, err := framer.ToDataFrame(t.Name(), input, options, "21.43")
		require.Nil(t, err)
		require.NotNil(t, gotFrame)
		err = experimental.CheckGoldenFrame("testdata/structs/"+strings.ReplaceAll(t.Name(), "TestToDataFrame/", "")+".golden.txt", gotFrame, updateGoldenText)
		require.Nil(t, err)
	})
	t.Run("bool", func(t *testing.T) {
		input := true
		options := framer.FramerOptions{}
		gotFrame, err := framer.ToDataFrame(t.Name(), input, options, "true")
		require.Nil(t, err)
		require.NotNil(t, gotFrame)
		err = experimental.CheckGoldenFrame("testdata/structs/"+strings.ReplaceAll(t.Name(), "TestToDataFrame/", "")+".golden.txt", gotFrame, updateGoldenText)
		require.Nil(t, err)
	})
	t.Run("object", func(t *testing.T) {
		input := `{ "name":"foo", "age": 12, "hobbies":["cricket","music"], "isPrimeUser": true, "fullname": { "first": "foo", "last":"bar" } }`
		options := framer.FramerOptions{}
		var out interface{}
		err := json.Unmarshal([]byte(input), &out)
		require.Nil(t, err)
		gotFrame, err := framer.ToDataFrame(t.Name(), out, options, input)
		require.Nil(t, err)
		require.NotNil(t, gotFrame)
		err = experimental.CheckGoldenFrame("testdata/structs/"+strings.ReplaceAll(t.Name(), "TestToDataFrame/", "")+".golden.txt", gotFrame, updateGoldenText)
		require.Nil(t, err)
	})
	t.Run("string-array", func(t *testing.T) {
		input := `["foo","bar"]`
		options := framer.FramerOptions{}
		var out interface{}
		err := json.Unmarshal([]byte(input), &out)
		require.Nil(t, err)
		gotFrame, err := framer.ToDataFrame(t.Name(), out, options, input)
		require.Nil(t, err)
		require.NotNil(t, gotFrame)
		err = experimental.CheckGoldenFrame("testdata/structs/"+strings.ReplaceAll(t.Name(), "TestToDataFrame/", "")+".golden.txt", gotFrame, updateGoldenText)
		require.Nil(t, err)
	})
	t.Run("number-array", func(t *testing.T) {
		input := `[12,14.56,0,30]`
		options := framer.FramerOptions{}
		var out interface{}
		err := json.Unmarshal([]byte(input), &out)
		require.Nil(t, err)
		gotFrame, err := framer.ToDataFrame(t.Name(), out, options, input)
		require.Nil(t, err)
		require.NotNil(t, gotFrame)
		err = experimental.CheckGoldenFrame("testdata/structs/"+strings.ReplaceAll(t.Name(), "TestToDataFrame/", "")+".golden.txt", gotFrame, updateGoldenText)
		require.Nil(t, err)
	})
	t.Run("array-inside-array", func(t *testing.T) {
		input := `[["one","two"],["three"]]`
		options := framer.FramerOptions{}
		var out interface{}
		err := json.Unmarshal([]byte(input), &out)
		require.Nil(t, err)
		gotFrame, err := framer.ToDataFrame(t.Name(), out, options, input)
		require.Nil(t, err)
		require.NotNil(t, gotFrame)
		err = experimental.CheckGoldenFrame("testdata/structs/"+strings.ReplaceAll(t.Name(), "TestToDataFrame/", "")+".golden.txt", gotFrame, updateGoldenText)
		require.Nil(t, err)
	})
	t.Run("all-null-array", func(t *testing.T) {
		input := `[null,null]`
		options := framer.FramerOptions{}
		var out interface{}
		err := json.Unmarshal([]byte(input), &out)
		require.Nil(t, err)
		gotFrame, err := framer.ToDataFrame(t.Name(), out, options, input)
		require.Nil(t, err)
		require.NotNil(t, gotFrame)
		err = experimental.CheckGoldenFrame("testdata/structs/"+strings.ReplaceAll(t.Name(), "TestToDataFrame/", "")+".golden.txt", gotFrame, updateGoldenText)
		require.Nil(t, err)
	})
}
func TestToDataFrameSlices(t *testing.T) {
	updateGoldenText := false
	files, err := ioutil.ReadDir("./testdata/slices")
	if err != nil {
		require.Nil(t, err)
	}
	for _, f := range files {
		if strings.HasSuffix(f.Name(), ".json") {
			t.Run(f.Name(), func(t *testing.T) {
				fileContent, err := ioutil.ReadFile("./testdata/slices/" + f.Name())
				require.Nil(t, err)
				options := framer.FramerOptions{}
				var out interface{}
				err = json.Unmarshal(fileContent, &out)
				require.Nil(t, err)
				gotFrame, err := framer.ToDataFrame(t.Name(), out, options, "")
				require.Nil(t, err)
				require.NotNil(t, gotFrame)
				goldenFileName := "testdata/slices/" + strings.TrimSuffix(f.Name(), ".json") + ".golden.txt"
				err = experimental.CheckGoldenFrame(goldenFileName, gotFrame, updateGoldenText)
				require.Nil(t, err)
			})
		}
	}
}
