import React, { PureComponent } from 'react';
import { defaultsDeep } from "lodash";
import { QueryEditorProps } from '@grafana/data';
import { Datasource } from "./datasource";
import { TypeChooser } from "./editors/TypeChooser";
import { FormatChooser } from "./editors/FormatChooser";
import { Scrapper } from "./editors/Scrapper";
import { InfinityQuery } from "./types";

type EditorProps = QueryEditorProps<Datasource, InfinityQuery>;

export class InfinityQueryEditor extends PureComponent<EditorProps> {
    render() {
        defaultsDeep(this.props.query, {
            type: 'json',
            source: 'url',
            format: 'table',
            url: '',
            root_selector: '',
            columns: []
        });
        return (
            <div>
                <TypeChooser onChange={this.props.onChange} query={this.props.query} />
                <Scrapper onChange={this.props.onChange} query={this.props.query} />
                <FormatChooser onChange={this.props.onChange} query={this.props.query} />
            </div >
        );
    }
}
