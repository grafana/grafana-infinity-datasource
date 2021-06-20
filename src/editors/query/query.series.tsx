import React from 'react';
import { DataLinkInput } from '@grafana/ui';
import { VariableOrigin } from '@grafana/data';
import { set, defaultsDeep } from 'lodash';
import { InfinityQuery } from '../../types';
import { SeriesAdvancedOptions } from './query.series_options';

interface ScrapperProps {
  query: InfinityQuery;
  onChange: (value: any) => void;
}

export const SeriesEditor: React.FC<ScrapperProps> = ({ query, onChange }) => {
  query = defaultsDeep(query, {
    alias: 'Random Walk',
  });
  const onInputTextChange = (value: string | number, field: keyof InfinityQuery) => {
    set(query, field, value);
    onChange(query);
  };
  return (
    <>
      <div className="gf-form-inline">
        <div className="gf-form">
          <label className="gf-form-label query-keyword width-8">Alias</label>
          <DataLinkInput
            onChange={(e) => onInputTextChange(e, `alias`)}
            suggestions={[{ label: 'Series Index', value: '__series.index', origin: VariableOrigin.Series }]}
            value={query.alias || ''}
            placeholder="Alias / Random Walk"
          />
          <label className="gf-form-label query-keyword width-6">Series Count</label>
          <input
            type="text"
            className="gf-form-input min-width-12"
            value={query.seriesCount}
            placeholder="1"
            onChange={(e) => onInputTextChange(+e.target.value, `seriesCount`)}
          ></input>
        </div>
      </div>
      <div className="gf-form-inline">
        <div className="gf-form">
          {query.source === 'expression' ? (
            <>
              <label className="gf-form-label query-keyword width-8">Expression</label>
              <DataLinkInput
                onChange={(e) => onInputTextChange(e, `expression`)}
                suggestions={[
                  { label: 'Series Index', value: '__series.index', origin: VariableOrigin.Series },
                  { label: 'Value Index', value: '__value.index', origin: VariableOrigin.Value },
                ]}
                value={query.expression || '                                             '}
                placeholder="Expression"
              />
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="gf-form-inline">
        <div className="gf-form">
          <SeriesAdvancedOptions onChange={onChange} query={query} />
        </div>
      </div>
    </>
  );
};
