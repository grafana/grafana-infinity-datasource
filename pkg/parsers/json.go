package parsers

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/tidwall/gjson"
	"github.com/yesoreyeram/grafana-infinity-datasource/pkg/framer"
)

type ColumnSelector struct {
	Selector string
	Alias    string
	Type     string
}

func JsonStringToFrame(responseString string, refId string, rootSelector string, columns []ColumnSelector) (frame *data.Frame, err error) {
	if !gjson.Valid(responseString) {
		return frame, errors.New("response type not supported yet. possibly invalid/empty response received")
	}
	outString := responseString
	if rootSelector != "" {
		r := gjson.Get(string(responseString), rootSelector)
		if !r.Exists() {
			return frame, errors.New("root object doesn't exist in the response. Root selector:" + rootSelector)
		}
		outString = r.String()
	}
	outString, err = GetColumnValuesFromResponseString(outString, columns)
	if err != nil {
		return frame, err
	}
	return getFrameFromResponseString(outString, refId)
}

func GetColumnValuesFromResponseString(responseString string, columns []ColumnSelector) (string, error) {
	if len(columns) > 0 {
		outString := responseString
		result := gjson.Parse(outString)
		out := []map[string]interface{}{}
		if result.IsArray() {
			result.ForEach(func(key, value gjson.Result) bool {
				oi := map[string]interface{}{}
				for _, col := range columns {
					name := col.Alias
					if name == "" {
						name = col.Selector
					}
					oi[name] = gjson.Get(value.Raw, col.Selector).Value()
				}
				out = append(out, oi)
				return true
			})
		}
		if !result.IsArray() && result.IsObject() {
			oi := map[string]interface{}{}
			for _, col := range columns {
				name := col.Alias
				if name == "" {
					name = col.Selector
				}
				oi[name] = gjson.Get(result.Raw, col.Selector).Value()
			}
			out = append(out, oi)
		}
		a, err := json.Marshal(out)
		if err != nil {
			return "", err
		}
		return string(a), nil
	}
	return responseString, nil
}

func getFrameFromResponseString(responseString string, refId string) (frame *data.Frame, err error) {
	var out interface{}
	err = json.Unmarshal([]byte(responseString), &out)
	if err != nil {
		return frame, fmt.Errorf("error while un-marshaling response. %s", err.Error())
	}
	return getFrameFromResponseObject(out, refId)
}

func getFrameFromResponseObject(out interface{}, refId string) (frame *data.Frame, err error) {
	return framer.ToDataFrame(refId, out, framer.FramerOptions{}, "")
}

func toArray() (out []interface{}) {
	return out
}
