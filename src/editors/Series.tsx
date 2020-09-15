import React from 'react';
import { set, defaultsDeep } from 'lodash';
import { InfinityQuery } from '../types';

interface ScrapperProps {
    query: InfinityQuery;
    onChange: (value: any) => void;
}

export const SeriesEditor: React.FC<ScrapperProps> = ({ query, onChange }) => {
    query = defaultsDeep(query, {
        alias: 'Random Walk'
    });
    const onInputTextChange = (value: string | number, field: string) => {
        set(query, field, value);
        onChange(query);
    };
    return (
        <div className="gf-form-inline">
            <div className="gf-form">
                <label className="gf-form-label query-keyword width-8">Alias</label>
                <input
                    type="text"
                    className="gf-form-input min-width-12"
                    value={query.alias}
                    placeholder="Random Walk / Alias"
                    onChange={e => onInputTextChange(e.target.value, `alias`)}
                ></input>
                <label className="gf-form-label query-keyword width-6">Series Count</label>
                <input
                    type="text"
                    className="gf-form-input min-width-12"
                    value={query.seriesCount}
                    placeholder="1"
                    onChange={e => onInputTextChange(+(e.target.value), `seriesCount`)}
                ></input>
            </div>
        </div>
    )
}