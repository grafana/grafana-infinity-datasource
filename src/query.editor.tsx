import React from 'react';
import { defaultsDeep } from "lodash";
import { QueryEditorProps } from '@grafana/data';
import { Datasource } from "./datasource";
import { TypeChooser } from "./editors/TypeChooser";
import { AdvancedOptions } from "./editors/AdvancedOptions";
import { Scrapper as ScrapperOptions } from "./editors/Scrapper";
import { SeriesEditor } from "./editors/Series";
import { InfinityQuery } from "./types";

type EditorProps = QueryEditorProps<Datasource, InfinityQuery>;

export const InfinityQueryEditor: React.FC<EditorProps> = ({ query, onChange }) => {

    query = defaultsDeep(query, {
        type: 'json',
        source: 'url',
        format: 'table',
        url: '',
        root_selector: '',
        columns: []
    });

    return (
        <div>
            <TypeChooser onChange={onChange} query={query} />
            { query.type === 'series' ? <SeriesEditor onChange={onChange} query={query} /> : <ScrapperOptions onChange={onChange} query={query} />}
            <AdvancedOptions onChange={onChange} query={query} />
        </div >
    );
}
