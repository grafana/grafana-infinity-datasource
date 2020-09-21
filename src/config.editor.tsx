import React from 'react';
import { defaultsDeep } from 'lodash';
import { DataSourcePluginOptionsEditorProps, DataSourceJsonData, updateDatasourcePluginJsonDataOption } from '@grafana/data';
import { DataSourceHttpSettings, Select } from "@grafana/ui";

export enum DatasourceMode {
    Basic = 'basic',
    Advanced = 'advanced',
}

const DATASOURCE_MODES = [
    { value: DatasourceMode.Basic, label: "Basic" },
    { value: DatasourceMode.Advanced, label: "Advanced" }
]

const DEFAULT_DATASOURCE_MODE = DATASOURCE_MODES.find(d => d.value === DatasourceMode.Basic);

interface InfinityDataSourceJSONOptions extends DataSourceJsonData {
    datasource_mode?: DatasourceMode;
}

export type Props = DataSourcePluginOptionsEditorProps<InfinityDataSourceJSONOptions>;

export const InfinityConfigEditor: React.FC<Props> = (props: Props) => {
    const { options, onOptionsChange } = props;

    options.jsonData = defaultsDeep(options.jsonData, {
        datasource_mode: DatasourceMode.Basic
    })

    return <>
        <div className="gf-form-inline">
            <div className="gf-form">
                <label className="gf-form-label width-10">Mode</label>
                <Select
                    className="min-width-12 width-12"
                    value={DATASOURCE_MODES.find((field: any) => field.value === options.jsonData.datasource_mode) || DEFAULT_DATASOURCE_MODE}
                    options={DATASOURCE_MODES}
                    defaultValue={DEFAULT_DATASOURCE_MODE}
                    onChange={e => updateDatasourcePluginJsonDataOption(props, "datasource_mode", e.value)}
                ></Select>
            </div>
        </div>
        <br />
        <br />
        {
            options.jsonData.datasource_mode === DatasourceMode.Advanced ?
                <div className="gf-form-inline">
                    <div className="gf-form">
                        <DataSourceHttpSettings defaultUrl="" dataSourceConfig={options} onChange={onOptionsChange}>
                        </DataSourceHttpSettings>
                    </div>
                </div>
                : <></>
        }
    </>;
}
