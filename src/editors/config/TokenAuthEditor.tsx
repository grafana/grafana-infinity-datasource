import React, { ChangeEvent } from 'react';
import { DataSourcePluginOptionsEditorProps, updateDatasourcePluginJsonDataOption } from '@grafana/data';
import { Input } from '@grafana/ui';
import { InfinityDataSourceJSONOptions, InfinityDataSourceSecureJSONOptions } from './../../types';

export type Props = DataSourcePluginOptionsEditorProps<InfinityDataSourceJSONOptions>;

export const TokenAuthEditor: React.FC<Props> = props => {
  const { options, onOptionsChange } = props;
  const onResetTokenClientSecret = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        token_client_secret: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        token_client_secret: '',
      },
    });
  };
  const onTokenClientSecretChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        token_client_secret: event.target.value,
      },
    });
  };
  const { secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as InfinityDataSourceSecureJSONOptions;
  return (
    <>
      <h3 className="page-heading">Base URL</h3>
      <div className="gf-form-inline">
        <div className="gf-form">
          <label className="gf-form-label width-10">URL</label>
          <Input
            className="width-24"
            label="URL"
            css={{}}
            value={options.jsonData.url}
            onChange={e => updateDatasourcePluginJsonDataOption(props, 'url', e.currentTarget.value)}
          />
        </div>
      </div>
      <br />
      <br />
      <h3 className="page-heading">Token Auth Settings</h3>
      <div className="gf-form-inline">
        <div className="gf-form">
          <label className="gf-form-label width-10">Token URL</label>
          <Input
            className="width-24"
            label="URL"
            css={{}}
            value={options.jsonData.token_url}
            onChange={e => updateDatasourcePluginJsonDataOption(props, 'token_url', e.currentTarget.value)}
          />
        </div>
      </div>
      <div className="gf-form-inline">
        <div className="gf-form">
          <label className="gf-form-label width-10">Client ID</label>
          <Input
            className="width-24"
            label="URL"
            css={{}}
            value={options.jsonData.token_client_id}
            onChange={e => updateDatasourcePluginJsonDataOption(props, 'token_client_id', e.currentTarget.value)}
          />
        </div>
      </div>
      <div className="gf-form-inline">
        <div className="gf-form">
          <label className="gf-form-label width-10">Resource</label>
          <Input
            className="width-24"
            label="URL"
            css={{}}
            value={options.jsonData.token_resource}
            onChange={e => updateDatasourcePluginJsonDataOption(props, 'token_resource', e.currentTarget.value)}
          />
        </div>
      </div>
      <div className="gf-form-inline">
        <div className="gf-form">
          <label className="gf-form-label width-10">Grant Type</label>
          <Input
            className="width-24"
            label="URL"
            css={{}}
            value={options.jsonData.token_grant_type}
            onChange={e => updateDatasourcePluginJsonDataOption(props, 'token_grant_type', e.currentTarget.value)}
          />
        </div>
      </div>
      <div className="gf-form-inline">
        <div className="gf-form">
          <label className="gf-form-label width-10" title="Password">
            Client Secret
          </label>
          {((secureJsonFields && secureJsonFields.token_client_secret) as boolean) ? (
            <>
              <label className="gf-form-label width-18">Configured</label>
              <span className="gf-form-button btn btn-secondary width-6" onClick={onResetTokenClientSecret}>
                Reset
              </span>
            </>
          ) : (
            <input
              type="password"
              value={secureJsonData.token_client_secret || ''}
              className="gf-form-input width-24"
              onChange={onTokenClientSecretChange}
            ></input>
          )}
        </div>
      </div>
      <br />
      <br />
      <br />
    </>
  );
};
