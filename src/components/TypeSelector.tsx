import React from 'react';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { InfinityQuery, SCRAP_QUERY_TYPES, EditorMode, InfinityQueryType } from '../types';
interface TypeSelectorProps {
  query: InfinityQuery;
  onChange: (e: InfinityQuery) => void;
  mode: EditorMode;
  onRunQuery: () => void;
}
export const TypeSelector = (props: TypeSelectorProps) => {
  const { query, mode, onChange, onRunQuery } = props;
  const LABEL_WIDTH = mode === 'variable' ? 10 : 8;
  const getTypes = (): Array<SelectableValue<InfinityQueryType>> => {
    switch (mode) {
      case 'standard':
        return SCRAP_QUERY_TYPES;
      case 'variable':
        return SCRAP_QUERY_TYPES.filter((a) => a.value !== 'series' && a.value !== 'global');
      case 'global':
        return SCRAP_QUERY_TYPES.filter((a) => a.value !== 'global');
      default:
        return [];
    }
  };
  const onTypeChange = (type: InfinityQueryType) => {
    onChange({
      ...query,
      type,
      source: type === 'series' ? 'random-walk' : 'url',
    });
    onRunQuery();
  };
  return (
    <>
      <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>Type</label>
      <div className="select-wrapper">
        <Select className="min-width-8 width-8" options={getTypes()} onChange={(e) => onTypeChange(e.value as InfinityQueryType)} value={query.type || 'json'}></Select>
      </div>
    </>
  );
};
