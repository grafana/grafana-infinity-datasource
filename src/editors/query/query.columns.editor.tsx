import React, { ChangeEvent } from 'react';
import { set } from 'lodash';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import {
  ScrapColumn,
  SCRAP_QUERY_RESULT_COLUMN_FORMATS,
  InfinityQuery,
  ScrapColumnFormat,
  EditorMode,
} from '../../types';

interface QueryColumnProps {
  query: InfinityQuery;
  mode: EditorMode;
  onChange: (value: any) => void;
}

export const QueryColumnsEditor: React.FC<QueryColumnProps> = ({ query, mode, onChange }: QueryColumnProps) => {
  const defaultScrapResultFormat: SelectableValue<ScrapColumnFormat> = {
    value: ScrapColumnFormat.String,
    label: 'String',
  };

  const onColumnAdd = () => {
    const columns = [...(query.columns || [])];
    columns.push({
      text: '',
      selector: '',
      type: ScrapColumnFormat.String,
    });
    onChange({ ...query, columns });
  };
  const onColumnRemove = (index: number) => {
    const columns = [...query.columns];
    columns.splice(index, 1);
    onChange({ ...query, columns });
  };
  const onInputTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    const value = event.target.value;
    set(query, field, value);
    onChange(query);
  };
  const onSelectChange = (selectableItem: SelectableValue, field: string) => {
    set(query, field, selectableItem.value);
    onChange(query);
  };

  const LABEL_WIDTH = mode === EditorMode.Variable ? 10 : 8;

  return (
    <>
      {(query.columns || []).length === 0 ? (
        <div className="gf-form-inline">
          <div className="gf-form">
            <div className="gf-form gf-form--grow">
              <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`} title="Columns">
                Columns
              </label>
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
      ) : null}
      {query.columns.map((column: ScrapColumn, index: number) => {
        return (
          <div className="gf-form-inline">
            <div className="gf-form">
              <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`} title="Column">
                Column {index + 1}
              </label>
              <label className="gf-form-label width-8">{query.type === 'csv' ? 'Column Name' : 'Selector'}</label>
              <input
                type="text"
                className="gf-form-input min-width-8"
                value={column.selector}
                placeholder={query.type === 'csv' ? 'Column Name' : 'Selector'}
                onChange={e => onInputTextChange(e, `columns[${index}].selector`)}
              ></input>
              <label className="gf-form-label width-2">as</label>
              <input
                type="text"
                className="gf-form-input min-width-8"
                value={column.text}
                placeholder="Title"
                onChange={e => onInputTextChange(e, `columns[${index}].text`)}
              ></input>
              <Select
                className="min-width-12 width-12"
                value={
                  SCRAP_QUERY_RESULT_COLUMN_FORMATS.find((field: any) => field.value === column.type) ||
                  defaultScrapResultFormat
                }
                options={SCRAP_QUERY_RESULT_COLUMN_FORMATS}
                defaultValue={defaultScrapResultFormat}
                onChange={e => onSelectChange(e, `columns[${index}].type`)}
              ></Select>
              <button className="btn btn-success btn-small" style={{ margin: '5px' }} onClick={() => onColumnAdd()}>
                +
              </button>
              <button
                className="btn btn-danger btn-small"
                style={{ margin: '5px' }}
                onClick={() => onColumnRemove(index)}
              >
                x
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
};
