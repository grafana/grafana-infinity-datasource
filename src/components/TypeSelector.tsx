import React from 'react';
import { Select, InlineFormLabel } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { InfinityQuery, SCRAP_QUERY_TYPES, EditorMode, InfinityQueryType } from '../types';

export const TypeSelector = (props: { query: InfinityQuery; onChange: (e: InfinityQuery) => void; onRunQuery: () => void; mode: EditorMode }) => {
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
    const source = type === 'series' ? 'random-walk' : 'url';
    onChange({ ...query, type, source } as InfinityQuery);
    onRunQuery();
  };
  return (
    <>
      <InlineFormLabel width={LABEL_WIDTH} className={`query-keyword`}>
        Type
      </InlineFormLabel>
      <div style={{ marginRight: '5px' }}>
        <Select width={16} options={getTypes()} onChange={(e) => onTypeChange(e.value as InfinityQueryType)} value={query.type || 'json'}></Select>
      </div>
    </>
  );
};
