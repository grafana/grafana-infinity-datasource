import React from 'react';
import { set } from 'lodash';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import {
  SCRAP_QUERY_RESULT_FORMATS,
  SCRAP_QUERY_TYPES,
  SCRAP_QUERY_SOURCES,
  InfinityQueryFormat,
  InfinityQuery,
  GlobalInfinityQuery,
  InfinityQueryType,
  InfinityQuerySources,
  EditorMode,
} from '../../types';
import { CSVOptionsEditor } from './csv_options';
import { JSONOptionsEditor } from './json_options';

interface TypeChooserProps {
  mode: EditorMode;
  instanceSettings: any;
  query: InfinityQuery;
  onChange: (value: any) => void;
  onRunQuery: () => void;
}

export const TypeChooser: React.FC<TypeChooserProps> = ({ query, onChange, onRunQuery, mode, instanceSettings }) => {
  const defaultFormat: SelectableValue<InfinityQueryFormat> = SCRAP_QUERY_RESULT_FORMATS[0];
  const defaultType: SelectableValue<InfinityQueryType> = { value: InfinityQueryType.JSON, label: 'JSON' };
  const defaultSource: SelectableValue<InfinityQuerySources> = { value: InfinityQuerySources.URL, label: 'URL' };
  const defaultSourceSeries: SelectableValue<InfinityQuerySources> = {
    value: InfinityQuerySources.RandomWalk,
    label: 'Random Walk',
  };

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
    onRunQuery();
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
      case EditorMode.Standard:
        return SCRAP_QUERY_TYPES;
      case EditorMode.Variable:
        return SCRAP_QUERY_TYPES.filter(a => a.value !== 'series' && a.value !== 'global');
      case EditorMode.Global:
        return SCRAP_QUERY_TYPES.filter(a => a.value !== 'global');
      default:
        return [];
    }
  };

  const LABEL_WIDTH = mode === EditorMode.Variable ? 10 : 8;

  return (
    <div className="gf-form-inline">
      <div className="gf-form">
        <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>Type</label>
        <Select
          className="min-width-8 width-8"
          value={SCRAP_QUERY_TYPES.find((field: SelectableValue) => field.value === query.type) || defaultType}
          options={getTypes(mode)}
          defaultValue={defaultType}
          onChange={e => onSelectChange(e, 'type')}
        ></Select>
        <label className={`gf-form-label query-keyword width-4`}>
          {query.type === 'series' ? 'Scenario' : 'Source'}
        </label>
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
            className="width-8"
            value={SCRAP_QUERY_SOURCES.find((field: SelectableValue) => field.value === query.source) || defaultSource}
            options={SCRAP_QUERY_SOURCES.filter(
              (field: SelectableValue) => field.supported_types.indexOf(query.type) > -1
            )}
            defaultValue={defaultSource}
            onChange={e => onSelectChange(e, 'source')}
          ></Select>
        )}
        {query.type !== InfinityQueryType.Series && mode !== EditorMode.Variable && (
          <>
            <label className={`gf-form-label query-keyword width-4`}>Format</label>
            <Select
              className="min-width-8 width-8"
              value={SCRAP_QUERY_RESULT_FORMATS.find((field: any) => field.value === query.format) || defaultFormat}
              options={SCRAP_QUERY_RESULT_FORMATS}
              defaultValue={defaultFormat}
              onChange={e => onSelectChange(e, 'format')}
            ></Select>
          </>
        )}
        {query.type === InfinityQueryType.CSV && (
          <CSVOptionsEditor query={query} onChange={onChange} onRunQuery={onRunQuery}></CSVOptionsEditor>
        )}
        {query.type === InfinityQueryType.JSON && (
          <JSONOptionsEditor query={query} onChange={onChange} onRunQuery={onRunQuery}></JSONOptionsEditor>
        )}
      </div>
    </div>
  );
};
