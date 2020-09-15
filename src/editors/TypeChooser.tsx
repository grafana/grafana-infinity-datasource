import React from "react";
import { set } from 'lodash';
import { Select } from "@grafana/ui";
import { SelectableValue } from "@grafana/data";
import { SCRAP_QUERY_TYPES, SCRAP_QUERY_SOURCES, InfinityQuery } from "./../types";

interface TypeChooserProps {
    query: InfinityQuery;
    onChange: (value: any) => void;
}

export const TypeChooser: React.FC<TypeChooserProps> = ({ query, onChange }) => {

    const defaultType = { value: 'json', label: 'JSON' };
    const defaultSource = { value: 'url', label: 'URL' };
    const defaultSourceSeries = { value: 'random-walk', label: 'Random Walk' }

    const onSelectChange = (selectableItem: SelectableValue, field: string) => {
        if (field === 'type') {
            if (selectableItem.value === 'series') {
                set(query, 'source', defaultSourceSeries.value)
            } else {
                set(query, 'source', defaultSource.value)
            }
        }
        set(query, field, selectableItem.value);
        onChange(query);
    }

    return (
        <div className="gf-form-inline">
            <div className="gf-form">
                <label className="gf-form-label query-keyword width-8">Type</label>
                <Select
                    className="min-width-12 width-12"
                    value={SCRAP_QUERY_TYPES.find((field: any) => field.value === query.type) || defaultType}
                    options={SCRAP_QUERY_TYPES}
                    defaultValue={defaultType}
                    onChange={e => onSelectChange(e, 'type')}
                ></Select>
                <label className="gf-form-label query-keyword width-6">{query.type === 'series' ? 'Scenario' : 'Source'}</label>
                <Select
                    className="min-width-12 width-12"
                    value={SCRAP_QUERY_SOURCES.find((field: any) => field.value === query.source) || defaultSource}
                    options={SCRAP_QUERY_SOURCES.filter(field => field.supported_types.indexOf(query.type) > -1)}
                    defaultValue={defaultSource}
                    onChange={e => onSelectChange(e, 'source')}
                ></Select>
            </div>
        </div>
    )
}