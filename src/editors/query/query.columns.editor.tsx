import React from 'react';
import { cloneDeep } from 'lodash';
import { Button } from '@grafana/ui';
import { InfinityColumn, InfinityQuery, EditorMode } from '../../types';
import { QueryColumnItem } from './../../components/QueryColumnItem';

interface QueryColumnProps {
  query: InfinityQuery;
  mode: EditorMode;
  onChange: (value: any) => void;
  onRunQuery: () => void;
}
export const QueryColumnsEditor = (props: QueryColumnProps) => {
  const { query, mode, onChange } = props;
  const onColumnAdd = () => {
    const columns = cloneDeep(query.columns || []);
    const defaultColumn = {
      text: '',
      selector: '',
      type: 'string',
    };
    onChange({ ...query, columns: [...columns, defaultColumn] });
  };
  const onColumnRemove = (index: number) => {
    const columns = cloneDeep(query.columns || []);
    columns.splice(index, 1);
    onChange({ ...query, columns });
  };
  const LABEL_WIDTH = mode === 'variable' ? 10 : 8;
  return (
    <>
      {query.columns.map((column: InfinityColumn, index: number) => {
        return (
          <div className="gf-form-inline" key={JSON.stringify(column) + index}>
            <div className="gf-form">
              <QueryColumnItem {...props} index={index} />
              <Button className="btn btn-danger btn-small" icon="trash-alt" variant="destructive" size="sm" style={{ margin: '5px' }} onClick={() => onColumnRemove(index)} />
            </div>
          </div>
        );
      })}
      <div className="gf-form-inline">
        <div className="gf-form">
          <div className="gf-form gf-form--grow">
            {(query.columns || []).length === 0 ? (
              <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`} title="Columns">
                Columns
              </label>
            ) : (
              <div className={`width-${LABEL_WIDTH}`} style={{ marginRight: '5px' }}></div>
            )}
          </div>
        </div>
        <div className="gf-form">
          <div className="gf-form gf-form--grow">
            <span className="btn btn-secondary btn-small" style={{ marginTop: '5px' }} onClick={() => onColumnAdd()}>
              Add Columns
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
