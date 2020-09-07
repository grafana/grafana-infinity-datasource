import React, { PureComponent } from 'react';
import { DataSourcePluginOptionsEditorProps, DataSourceJsonData } from '@grafana/data';

interface UtilsDataSourceOptions extends DataSourceJsonData { }
interface ConfigProps extends DataSourcePluginOptionsEditorProps<UtilsDataSourceOptions> { }
export class UtilsConfigEditor extends PureComponent<ConfigProps> {
    render() {
        return <div>Utils Config Editor</div>;
    }
}
