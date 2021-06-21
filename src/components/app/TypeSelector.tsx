import React from 'react';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { InfinityQuery, SCRAP_QUERY_TYPES, EditorMode, InfinityQueryType, InfinityQuerySources } from '../../types';
interface TypeSelectorProps {
  query: InfinityQuery;
  onChange: (e: InfinityQuery) => void;
  mode: EditorMode;
  onRunQuery: () => void;
}
export const TypeSelector = (props: TypeSelectorProps) => {
  const { query, mode, onChange, onRunQuery } = props;
  const getTypes = (): Array<SelectableValue<InfinityQueryType>> => {
    switch (mode) {
      case EditorMode.Standard:
        return SCRAP_QUERY_TYPES;
      case EditorMode.Variable:
        return SCRAP_QUERY_TYPES.filter((a) => a.value !== 'series' && a.value !== 'global');
      case EditorMode.Global:
        return SCRAP_QUERY_TYPES.filter((a) => a.value !== 'global');
      default:
        return [];
    }
  };
  const LABEL_WIDTH = mode === EditorMode.Variable ? 10 : 8;
  return (
    <>
      <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>Type</label>
      <Select
        className="min-width-8 width-8"
        options={getTypes()}
        onChange={(e) => {
          onChange({
            ...query,
            type: e.value as InfinityQueryType,
            source: e.value === InfinityQueryType.Series ? InfinityQuerySources.RandomWalk : InfinityQuerySources.URL,
          });
          onRunQuery();
        }}
        value={query.type || InfinityQueryType.JSON}
      ></Select>
    </>
  );
};
