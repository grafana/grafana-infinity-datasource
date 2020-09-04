import React, { PureComponent } from 'react';
import { DataSourcePluginOptionsEditorProps, DataSourceJsonData } from '@grafana/data';

interface ScrapingDataSourceOptions extends DataSourceJsonData { }
interface ConfigProps extends DataSourcePluginOptionsEditorProps<ScrapingDataSourceOptions> { }
export class ScrappingConfigEditor extends PureComponent<ConfigProps> {
    render() {
        return <div>Scraping Config Editor</div>;
    }
}
