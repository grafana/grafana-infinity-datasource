package infinity

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

type CustomMeta struct {
	Query                  models.Query  `json:"query"`
	Data                   any           `json:"data"`
	ResponseCodeFromServer int           `json:"responseCodeFromServer"`
	Duration               time.Duration `json:"duration"`
	Error                  string        `json:"error"`
}

func GetDummyFrame(query models.Query) *data.Frame {
	frameName := query.RefID
	if frameName == "" {
		frameName = "response"
	}
	frame := data.NewFrame(frameName)
	frame.Meta = &data.FrameMeta{
		ExecutedQueryString: "This feature is not available for this type of query yet",
		Custom: &CustomMeta{
			Query:                  query,
			Data:                   query.Data,
			ResponseCodeFromServer: 0,
			Error:                  "",
		},
	}
	return frame
}

func WrapMetaForInlineQuery(ctx context.Context, frame *data.Frame, err error, query models.Query) (*data.Frame, error) {
	_, span := tracing.DefaultTracer().Start(ctx, "WrapMetaForInlineQuery")
	defer span.End()
	if frame == nil {
		frame = data.NewFrame(query.RefID)
	}
	customMeta := &CustomMeta{Query: query, Data: query.Data, ResponseCodeFromServer: 0}
	if err != nil {
		customMeta.Error = err.Error()
		err = backend.PluginError(err)
	}
	frame.Meta = &data.FrameMeta{
		ExecutedQueryString: "This feature is not available for this type of query yet",
		Custom:              customMeta,
	}
	frame = ApplyLogMeta(ctx, frame, query)
	frame = ApplyTraceMeta(ctx, frame, query)
	return frame, err
}

func WrapMetaForRemoteQuery(ctx context.Context, settings models.InfinitySettings, frame *data.Frame, err error, query models.Query) (*data.Frame, error) {
	if frame == nil {
		frame = data.NewFrame(query.RefID)
	}
	meta := frame.Meta
	if meta == nil {
		customMeta := &CustomMeta{Query: query, Data: query.Data, ResponseCodeFromServer: 0}
		if err != nil {
			customMeta.Error = err.Error()
		}
		frame.Meta = &data.FrameMeta{Custom: customMeta}
	}
	if frame.Meta.Notices == nil {
		frame.Meta.Notices = []data.Notice{}
	}
	frame = ApplyLogMeta(ctx, frame, query)
	frame = ApplyTraceMeta(ctx, frame, query)
	frame = ApplyNotices(ctx, settings, frame, query)
	return frame, err
}

func ApplyLogMeta(ctx context.Context, frame *data.Frame, query models.Query) *data.Frame {
	_, span := tracing.DefaultTracer().Start(ctx, "ApplyLogMeta")
	defer span.End()
	if frame == nil {
		frame = data.NewFrame(query.RefID)
	}
	if frame.Meta == nil {
		frame.Meta = &data.FrameMeta{}
	}
	if query.Format == "logs" {
		doesTimeFieldExist := false
		doesBodyFieldExist := false
		for _, field := range frame.Fields {
			if field.Name == "timestamp" && (field.Type() == data.FieldTypeNullableTime || field.Type() == data.FieldTypeTime) {
				doesTimeFieldExist = true
			}
			if field.Name == "body" && (field.Type() == data.FieldTypeNullableString || field.Type() == data.FieldTypeString) {
				doesBodyFieldExist = true
			}
		}
		if doesTimeFieldExist && doesBodyFieldExist {
			frame.Meta.Type = data.FrameTypeLogLines
			frame.Meta.TypeVersion = data.FrameTypeVersion{0, 0}
		}
		frame.Meta.PreferredVisualization = data.VisTypeLogs
	}
	return frame
}

func ApplyTraceMeta(ctx context.Context, frame *data.Frame, query models.Query) *data.Frame {
	_, span := tracing.DefaultTracer().Start(ctx, "ApplyLogMeta")
	defer span.End()
	if frame == nil {
		frame = data.NewFrame(query.RefID)
	}
	if frame.Meta == nil {
		frame.Meta = &data.FrameMeta{}
	}
	if query.Format == "trace" {
		frame.Meta.PreferredVisualization = data.VisTypeTrace
	}
	return frame
}

func ApplyNotices(ctx context.Context, settings models.InfinitySettings, frame *data.Frame, query models.Query) *data.Frame {
	if frame.Meta == nil {
		frame.Meta = &data.FrameMeta{}
	}
	if frame.Meta.Notices == nil {
		frame.Meta.Notices = []data.Notice{}
	}
	if settings.UnsecuredQueryHandling == models.UnsecuredQueryHandlingWarn {
		frame.Meta.Notices = append(frame.Meta.Notices, GetSecureHeaderWarnings(query)...)
	}
	return frame
}

func GetSecureHeaderWarnings(query models.Query) []data.Notice {
	notices := []data.Notice{}
	for _, h := range query.URLOptions.Headers {
		if strings.EqualFold(h.Key, HeaderKeyAuthorization) {
			notices = append(notices, data.Notice{
				Severity: data.NoticeSeverityWarning,
				Text:     fmt.Sprintf("for security reasons, don't include headers such as %s in the query. Instead, add them in the config where possible", h.Key),
				Inspect:  data.InspectTypeData,
			})
		}
	}
	return notices
}
