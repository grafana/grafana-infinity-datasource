import defaultsDeep from 'lodash/defaultsDeep';
import React from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { DatasourceModeEditor } from './config/DatasourceMode';
import { GlobalQueryEditor } from './config/GlobalQueryEditor';
import { DatasourceMode, InfinityDataSourceJSONOptions } from '../types';

export type Props = DataSourcePluginOptionsEditorProps<InfinityDataSourceJSONOptions>;

export const InfinityConfigEditor: React.FC<Props> = ({ options, onOptionsChange }) => {
  options.jsonData = defaultsDeep(options.jsonData, {
    datasource_mode: DatasourceMode.Basic,
    global_queries: [],
  });
  return (
    <>
      <DatasourceModeEditor options={options} onOptionsChange={onOptionsChange} />
      <GlobalQueryEditor options={options} onOptionsChange={onOptionsChange} />
    </>
  );
};
