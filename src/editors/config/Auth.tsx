import React from 'react';
import { DataSourcePluginOptionsEditorProps, onUpdateDatasourceSecureJsonDataOption } from '@grafana/data';
import { InlineFormLabel, Switch, useTheme, LegacyForms } from '@grafana/ui';
import { InfinityDataSourceJSONOptions, InfinityDataSourceSecureJSONOptions } from '../../types';

export type Props = DataSourcePluginOptionsEditorProps<InfinityDataSourceJSONOptions>;

export const AuthEditor: React.FC<Props> = (props: Props) => {
  const theme = useTheme();
  const { FormField, SecretFormField } = LegacyForms;
  const { options, onOptionsChange } = props;
  const { secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as InfinityDataSourceSecureJSONOptions;
  const onBasicAuthChange = (basicAuth: boolean) => {
    onOptionsChange({
      ...options,
      basicAuth,
    });
  };
  const onUserNameChange = (basicAuthUser: string) => {
    onOptionsChange({
      ...options,
      basicAuthUser,
    });
  };
  const onResetPassword = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        basicAuthPassword: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        basicAuthPassword: '',
      },
    });
  };
  const switchContainerStyle: React.CSSProperties = {
    padding: `0 ${theme.spacing.sm}`,
    height: `${theme.spacing.formInputHeight}px`,
    display: 'flex',
    alignItems: 'center',
  };
  return (
    <>
      <div className="gf-form">
        <InlineFormLabel width={8} tooltip="Basic Auth Enabled">
          Basic Auth
        </InlineFormLabel>
        <div style={switchContainerStyle}>
          <Switch
            css={{}}
            className="gf-form"
            value={props.options.basicAuth || false}
            onChange={(e) => onBasicAuthChange(e.currentTarget.checked)}
          />
        </div>
      </div>
      {props.options.basicAuth && (
        <div className="gf-form">
          <FormField
            label="User Name"
            placeholder="username"
            labelWidth={8}
            value={props.options.basicAuthUser || ''}
            onChange={(e) => onUserNameChange(e.currentTarget.value)}
          ></FormField>
          <SecretFormField
            labelWidth={12}
            inputWidth={10}
            required
            value={secureJsonData.basicAuthPassword || ''}
            isConfigured={(secureJsonFields && secureJsonFields.basicAuthPassword) as boolean}
            onReset={onResetPassword}
            onChange={onUpdateDatasourceSecureJsonDataOption(props, 'basicAuthPassword')}
            label="Password"
            aria-label="password"
            placeholder="password"
            tooltip="password"
          />
        </div>
      )}
    </>
  );
};
