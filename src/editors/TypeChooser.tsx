import React from "react";
import { set, toInteger } from 'lodash';
import { Select } from "@grafana/ui";
import { SelectableValue } from "@grafana/data";
import { SCRAP_QUERY_TYPES, SCRAP_QUERY_SOURCES, InfinityQuery } from "./../types";

interface TypeChooserProps {
    query: InfinityQuery;
    onChange: (value: any) => void;
}

export class TypeChooser extends React.PureComponent<TypeChooserProps>  {
    onSelectChange = (selectableItem: SelectableValue, field: string, props: any, format = 'string') => {
        const { query, onChange } = props;
        set(query, field, format === 'number' ? toInteger(selectableItem.value) : selectableItem.value);
        onChange(query);
    }
    render() {
        const query = this.props.query;
        return (
            <div className="gf-form-inline">
                <div className="gf-form">
                    <label className="gf-form-label query-keyword width-8">Type</label>
                    <Select
                        className="min-width-12 width-12"
                        value={
                            SCRAP_QUERY_TYPES.find((field: any) => field.value === query.type)
                            || { value: 'json', label: 'JSON' }}
                        options={SCRAP_QUERY_TYPES}
                        defaultValue={{ value: 'json', label: 'JSON' }}
                        onChange={e => this.onSelectChange(e, 'type', this.props)}
                    ></Select>
                    <label className="gf-form-label query-keyword width-5">Source</label>
                    <Select
                        className="min-width-12 width-12"
                        value={
                            SCRAP_QUERY_SOURCES.find((field: any) => field.value === query.source)
                            || { value: 'url', label: 'URL' }
                        }
                        options={SCRAP_QUERY_SOURCES}
                        defaultValue={{ value: 'url', label: 'URL' }}
                        onChange={e => this.onSelectChange(e, 'source', this.props)}
                    ></Select>
                </div>
            </div>

        )
    }
}