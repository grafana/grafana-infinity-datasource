import React, { PureComponent } from 'react';
import { QueryEditorProps, DataQuery } from '@grafana/data';
import { Datasource } from "./datasource";

interface ScrapQuery extends DataQuery { }
type EditorProps = QueryEditorProps<Datasource, ScrapQuery>;
export class ScrapingQueryEditor extends PureComponent<EditorProps> {
    render() {
        return <div>Scraping Query Editor</div>;
    }
}