import React, { useState } from 'react';
import type { InfinityQuery } from '@/types';

interface ComputedColumnProps {
  query: InfinityQuery;
  onChange: (value: any) => void;
  onRunQuery: () => void;
  index: number;
}
export const ComputedColumn = (props: ComputedColumnProps) => {
  const { query, index, onChange, onRunQuery } = props;
  const [expression, setExpression] = useState(
    (query.type === 'json' || query.type === 'graphql' || query.type === 'csv' || query.type === 'tsv') && query.parser === 'backend' ? (query.computed_columns || [])[index].selector : ''
  );
  const [alias, setAlias] = useState(
    (query.type === 'json' || query.type === 'graphql' || query.type === 'csv' || query.type === 'tsv') && query.parser === 'backend' ? (query.computed_columns || [])[index].text : ''
  );
  if ((query.type === 'json' || query.type === 'graphql' || query.type === 'csv' || query.type === 'tsv') && query.parser === 'backend') {
    const onExpressionChange = () => {
      const computedColumns = query?.computed_columns || [];
      const updatedComputedColumns = computedColumns.map((col, i) => (i === index ? { ...col, selector: expression } : col));
      onChange({ ...query, computed_columns: updatedComputedColumns });
      onRunQuery();
    };
    const onAliasChange = () => {
      const computed_columns = query?.computed_columns || [];
      const updatedComputedColumns = computed_columns.map((col, i) => (i === index ? { ...col, text: alias } : col));
      onChange({ ...query, computed_columns: updatedComputedColumns });
      onRunQuery();
    };
    return (
      <>
        <label className="gf-form-label width-6">Expression</label>
        <input
          type="text"
          className="gf-form-input min-width-8"
          value={expression}
          placeholder={'Expression'}
          onChange={(e) => setExpression(e.currentTarget.value)}
          onBlur={onExpressionChange}
        ></input>
        <label className="gf-form-label width-2">as</label>
        <input type="text" className="gf-form-input min-width-8" value={alias} placeholder="Title" onChange={(e) => setAlias(e.currentTarget.value)} onBlur={onAliasChange}></input>
      </>
    );
  }
  return <></>;
};
