import React, { PureComponent } from 'react';
import { DataSourcePluginOptionsEditorProps, DataSourceJsonData } from '@grafana/data';

interface InfinityDataSourceOptions extends DataSourceJsonData { }
interface ConfigProps extends DataSourcePluginOptionsEditorProps<InfinityDataSourceOptions> { }
export class InfinityConfigEditor extends PureComponent<ConfigProps> {
    render() {
        return <div>Infinity Config Editor</div>;
    }
}
