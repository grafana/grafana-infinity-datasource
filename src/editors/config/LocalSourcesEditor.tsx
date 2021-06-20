import React from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { Switch, InlineFormLabel, Input, Button, useTheme } from '@grafana/ui';
import { InfinityDataSourceJSONOptions } from './../../types';

export type LocalSourcesEditorProps = DataSourcePluginOptionsEditorProps<InfinityDataSourceJSONOptions>;

export const LocalSourcesEditor: React.FC<LocalSourcesEditorProps> = (props) => {
  const theme = useTheme();
  const { options, onOptionsChange } = props;
  const switchContainerStyle: React.CSSProperties = {
    padding: `0 ${theme.spacing.sm}`,
    height: `${theme.spacing.formInputHeight}px`,
    display: 'flex',
    alignItems: 'center',
  };
  const onLocalSourcesEnableChanged = (enabled: boolean) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...options.jsonData,
        local_sources_options: {
          ...options.jsonData.local_sources_options,
          enabled,
        },
      },
    });
  };
  const onPathAdded = (path = '/some-valid-path') => {
    const allowed_paths = options.jsonData.local_sources_options?.allowed_paths || [];
    allowed_paths.push(path);
    onOptionsChange({
      ...options,
      jsonData: {
        ...options.jsonData,
        local_sources_options: {
          ...options.jsonData.local_sources_options,
          enabled: true,
          allowed_paths,
        },
      },
    });
  };
  const onPathChange = (index: number, path: string) => {
    const allowed_paths = options.jsonData.local_sources_options?.allowed_paths || [];
    allowed_paths[index] = path;
    onOptionsChange({
      ...options,
      jsonData: {
        ...options.jsonData,
        local_sources_options: {
          ...options.jsonData.local_sources_options,
          enabled: true,
          allowed_paths,
        },
      },
    });
  };
  const onPathDelete = (index: number) => {
    const allowed_paths = options.jsonData.local_sources_options?.allowed_paths || [];
    allowed_paths.splice(index, 1);
    onOptionsChange({
      ...options,
      jsonData: {
        ...options.jsonData,
        local_sources_options: {
          ...options.jsonData.local_sources_options,
          enabled: true,
          allowed_paths,
        },
      },
    });
  };
  return (
    <>
      <div className="gf-form">
        <InlineFormLabel width={12} tooltip="Local sources enabled">
          Local sources enabled
        </InlineFormLabel>
        <div style={switchContainerStyle}>
          <Switch
            css={{}}
            className="gf-form"
            value={props.options.jsonData.local_sources_options?.enabled || false}
            onChange={(e) => onLocalSourcesEnableChanged(e.currentTarget.checked)}
          />
        </div>
      </div>
      {props.options.jsonData.local_sources_options?.enabled && (
        <>
          {props.options.jsonData.local_sources_options.allowed_paths?.map((path, index) => {
            return (
              <>
                <div className="gf-form">
                  <InlineFormLabel width={12} tooltip={`Valid file base path in grafana server`}>
                    Path {index + 1}
                  </InlineFormLabel>
                  <Input
                    css={{}}
                    value={path}
                    onChange={(e) => {
                      onPathChange(index, e.currentTarget.value);
                    }}
                    label={`Path ${index + 1}`}
                    placeholder="/some-valid-path"
                  />
                  <Button
                    className="width-2"
                    variant="destructive"
                    icon="trash-alt"
                    type="button"
                    onClick={() => onPathDelete(index)}
                  />
                </div>
              </>
            );
          })}
          <div className="gf-form">
            <Button variant="secondary" icon="plus" type="button" onClick={() => onPathAdded()}>
              Add Path
            </Button>
          </div>
        </>
      )}
    </>
  );
};
