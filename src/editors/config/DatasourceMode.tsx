import defaultsDeep from 'lodash/defaultsDeep';
import React from 'react';
import {
  DataSourcePluginOptionsEditorProps,
  updateDatasourcePluginJsonDataOption,
  SelectableValue,
} from '@grafana/data';
import { DataSourceHttpSettings, Select } from '@grafana/ui';
import { SecureFieldsEditor } from '../components/SecureFieldsEditor';
import { DatasourceMode, InfinityDataSourceJSONOptions } from '../../types';

const DATASOURCE_MODES: Array<SelectableValue<DatasourceMode>> = [
  { value: DatasourceMode.Basic, label: 'Basic' },
  { value: DatasourceMode.Advanced, label: 'Advanced' },
];

const DEFAULT_DATASOURCE_MODE = DATASOURCE_MODES[0];

export type Props = DataSourcePluginOptionsEditorProps<InfinityDataSourceJSONOptions>;

export const DatasourceModeEditor: React.FC<Props> = (props: Props) => {
  const { options, onOptionsChange } = props;

  options.jsonData = defaultsDeep(options.jsonData, {
    datasource_mode: DatasourceMode.Basic,
    global_queries: [],
  });
  return (
    <>
      <div className="gf-form-inline">
        <div className="gf-form">
          <label className="gf-form-label width-10">Mode</label>
          <Select
            className="min-width-12 width-12"
            value={
              DATASOURCE_MODES.find((field: SelectableValue) => field.value === options.jsonData.datasource_mode) ||
              DEFAULT_DATASOURCE_MODE
            }
            options={DATASOURCE_MODES}
            defaultValue={DEFAULT_DATASOURCE_MODE}
            onChange={e => updateDatasourcePluginJsonDataOption(props, 'datasource_mode', e.value)}
          ></Select>
        </div>
      </div>
      <br />

      <div className="gf-form-inline">
        <div className="gf-form">
          {options.jsonData.datasource_mode === DatasourceMode.Advanced && (
            <DataSourceHttpSettings
              defaultUrl=""
              dataSourceConfig={options}
              onChange={onOptionsChange}
            ></DataSourceHttpSettings>
          )}
        </div>
        <div className="gf-form">
          <SecureFieldsEditor dataSourceConfig={props.options} onChange={props.onOptionsChange} />
        </div>
      </div>
      <div className="gf-form-inline">
        <div className="gf-form"></div>
      </div>
    </>
  );
};
