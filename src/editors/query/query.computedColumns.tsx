import React from 'react';
import { Button } from '@grafana/ui';
import { EditorField } from './../../components/extended/EditorField';
import { ComputedColumn } from './../../components/ComputedColumn';
import type { InfinityQuery, InfinityColumn } from './../../types';

export const ComputedColumnsEditor = (props: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
  if ((query.type === 'json' || query.type === 'graphql' || query.type === 'csv' || query.type === 'tsv') && query.parser === 'backend') {
    const onComputedColumnAdd = () => {
      const columns: InfinityColumn[] = query?.computed_columns || [];
      const defaultColumn: InfinityColumn = { text: '', selector: '', type: 'string' };
      onChange({ ...query, computed_columns: [...columns, defaultColumn] });
      onRunQuery();
    };
    const onComputedColumnRemove = (index: number) => {
      const computed_columns = query?.computed_columns || [];
      computed_columns.splice(index, 1);
      onChange({ ...query, computed_columns });
      onRunQuery();
    };
    return (
      <>
        <EditorField label="Computed Columns" optional={true} tag="alpha" tooltip={'Computed columns will be computed after the columns computed'}>
          <>
            {(query.computed_columns || []).map((computed_column: InfinityColumn, index: number) => {
              return (
                <div className="gf-form-inline" key={JSON.stringify(computed_column) + index}>
                  <div className="gf-form">
                    <ComputedColumn {...props} index={index} />
                    <Button className="btn btn-danger btn-small" icon="trash-alt" variant="destructive" size="sm" style={{ margin: '5px' }} onClick={() => onComputedColumnRemove(index)} />
                  </div>
                </div>
              );
            })}
            <div className="gf-form-inline">
              <div className="gf-form">
                <div className="gf-form gf-form--grow">
                  <span className="btn btn-secondary btn-small" style={{ marginTop: '5px' }} onClick={() => onComputedColumnAdd()}>
                    Add Computed column
                  </span>
                </div>
              </div>
            </div>
          </>
        </EditorField>
      </>
    );
  }
  return <></>;
};
