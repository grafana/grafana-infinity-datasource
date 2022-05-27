import React, { useState } from 'react';
import { cloneDeep } from 'lodash';
import { Button } from '@grafana/ui';
import { QueryColumnItem } from './../../components/QueryColumnItem';
import { isDataQuery } from './../../app/utils';
import { InfinityColumn, InfinityQuery, EditorMode } from '../../types';

export const QueryColumnsEditor = (props: { query: InfinityQuery; mode: EditorMode; onChange: (value: any) => void; onRunQuery: () => void }) => {
  const { query, mode, onChange, onRunQuery } = props;
  const LABEL_WIDTH = mode === 'variable' ? 10 : 8;
  const [root_selector, setRootSelector] = useState(isDataQuery(query) ? query.root_selector || '' : '');
  if (!isDataQuery(query)) {
    return <></>;
  }
  const canShowRootSelector = ['html', 'json', 'json-backend', 'xml', 'graphql'].indexOf(props.query.type) > -1;
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
  const onRootSelectorChange = () => {
    onChange({ ...query, root_selector });
    onRunQuery();
  };
  return (
    <>
      {canShowRootSelector && (
        <div className="gf-form">
          <label className={`gf-form-label query-keyword width-${LABEL_WIDTH}`}>Rows / Root</label>
          <input
            type="text"
            className="gf-form-input"
            style={{ width: '594px' }}
            value={root_selector}
            placeholder=""
            onChange={(e) => setRootSelector(e.currentTarget.value)}
            onBlur={onRootSelectorChange}
          ></input>
        </div>
      )}
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
                Fields / Columns
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
