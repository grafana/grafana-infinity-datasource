import React from 'react';
import { Button } from '@grafana/ui';
import { EditorField } from './../../components/extended/EditorField';
import { ComputedColumn } from './../../components/ComputedColumn';
import type { InfinityQuery, InfinityColumn } from './../../types';

export const ComputedColumnsEditor = (props: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const { query, onChange } = props;
  if ((query.type === 'json' || query.type === 'graphql' || query.type === 'csv' || query.type === 'tsv') && query.parser === 'backend') {
    const onComputedColumnAdd = () => {
      const columns: InfinityColumn[] = query?.computed_columns || [];
      const defaultColumn: InfinityColumn = { text: '', selector: '', type: 'string' };
      onChange({ ...query, computed_columns: [...columns, defaultColumn] });
    };
    const onComputedColumnRemove = (index: number) => {
      const computed_columns = query?.computed_columns || [];
      computed_columns.splice(index, 1);
      onChange({ ...query, computed_columns });
    };
    return (
      <>
        <EditorField label="Computed Columns" optional={true} tooltip={'Computed columns will be computed after the columns computed'}>
          <>
            {(query.computed_columns || []).map((computed_column: InfinityColumn, index: number) => {
              return (
                <div className="gf-form-inline" key={JSON.stringify(computed_column) + index}>
                  <div className="gf-form">
                    <ComputedColumn {...props} index={index} />
                    <Button
                      icon="trash-alt"
                      variant="destructive"
                      fill="outline"
                      size="sm"
                      style={{ margin: '5px' }}
                      onClick={(e) => {
                        onComputedColumnRemove(index);
                        e.preventDefault();
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="gf-form-inline">
              <div className="gf-form">
                <div className="gf-form gf-form--grow">
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ marginTop: '5px' }}
                    onClick={(e) => {
                      onComputedColumnAdd();
                      e.preventDefault();
                    }}
                  >
                    Add Computed column
                  </Button>
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
