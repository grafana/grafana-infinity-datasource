import React from 'react';
import { set } from 'lodash';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import {
  SCRAP_QUERY_TYPES,
  SCRAP_QUERY_SOURCES,
  InfinityQuery,
  GlobalInfinityQuery,
  InfinityQueryType,
  InfinityQuerySources,
  EditorMode,
} from './../types';

interface TypeChooserProps {
  mode: EditorMode;
  instanceSettings: any;
  query: InfinityQuery;
  onChange: (value: any) => void;
}

export const TypeChooser: React.FC<TypeChooserProps> = ({ query, onChange, mode, instanceSettings }) => {
  const defaultType: SelectableValue<InfinityQueryType> = { value: 'json', label: 'JSON' };
  const defaultSource: SelectableValue<InfinityQuerySources> = { value: 'url', label: 'URL' };
  const defaultSourceSeries: SelectableValue<InfinityQuerySources> = { value: 'random-walk', label: 'Random Walk' };

  const onSelectChange = (selectableItem: SelectableValue, field: keyof InfinityQuery) => {
    if (field === 'type') {
      if (selectableItem.value === 'series') {
        set(query, 'source', defaultSourceSeries.value);
      } else {
        set(query, 'source', defaultSource.value);
      }
    }
    set(query, field, selectableItem.value);
    onChange(query);
  };

  let global_queries =
    instanceSettings &&
    instanceSettings.jsonData &&
    instanceSettings.jsonData.global_queries &&
    instanceSettings.jsonData.global_queries.length > 0
      ? instanceSettings.jsonData.global_queries
      : [];
  global_queries = global_queries.map((q: GlobalInfinityQuery) => {
    return {
      label: q.name,
      value: q.id,
    };
  }) as SelectableValue[];

  const getTypes = (mode: EditorMode): Array<SelectableValue<InfinityQueryType>> => {
    switch (mode) {
      case 'standard':
        return SCRAP_QUERY_TYPES;
      case 'variable':
        return SCRAP_QUERY_TYPES.filter(a => a.value !== 'series' && a.value !== 'global');
      case 'global':
        return SCRAP_QUERY_TYPES.filter(a => a.value !== 'global');
      default:
        return [];
    }
  };

  const LABEL_WIDTH = mode === 'variable' ? 10 : 8;

  return (
    <div className="gf-form-inline">
      <div className="gf-form">
        <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>Type</label>
        <Select
          className="min-width-12 width-12"
          value={SCRAP_QUERY_TYPES.find((field: SelectableValue) => field.value === query.type) || defaultType}
          options={getTypes(mode)}
          defaultValue={defaultType}
          onChange={e => onSelectChange(e, 'type')}
        ></Select>
        <label className="gf-form-label query-keyword width-6">{query.type === 'series' ? 'Scenario' : 'Source'}</label>
        {query.type === 'global' ? (
          <>
            {global_queries.length > 0 ? (
              <>
                <Select
                  options={global_queries}
                  defaultValue={global_queries[0]}
                  value={
                    global_queries.find((q: SelectableValue) => q.value === query.global_query_id) || global_queries[0]
                  }
                  onChange={e => {
                    onSelectChange(e, 'global_query_id');
                  }}
                />
              </>
            ) : (
              <label className="gf-form-label width-8">No Queries found</label>
            )}
          </>
        ) : (
          <Select
            className="min-width-12 width-12"
            value={SCRAP_QUERY_SOURCES.find((field: SelectableValue) => field.value === query.source) || defaultSource}
            options={SCRAP_QUERY_SOURCES.filter(
              (field: SelectableValue) => field.supported_types.indexOf(query.type) > -1
            )}
            defaultValue={defaultSource}
            onChange={e => onSelectChange(e, 'source')}
          ></Select>
        )}
      </div>
    </div>
  );
};
