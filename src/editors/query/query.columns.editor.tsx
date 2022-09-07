import { Button } from '@grafana/ui';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import { EditorRow } from './../../components/extended/EditorRow';
import { EditorField } from './../../components/extended/EditorField';
import { isDataQuery } from './../../app/utils';
import { QueryColumnItem } from './../../components/QueryColumnItem';
import type { EditorMode, InfinityColumn, InfinityQuery } from './../../types';

export const QueryColumnsEditor = (props: { query: InfinityQuery; mode: EditorMode; onChange: (value: any) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
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
      <EditorRow>
        {canShowRootSelector && (
          <EditorField label="Rows/Root">
            <input
              type="text"
              className="gf-form-input"
              style={{ width: '300px' }}
              value={root_selector}
              placeholder=""
              onChange={(e) => setRootSelector(e.currentTarget.value)}
              onBlur={onRootSelectorChange}
            ></input>
          </EditorField>
        )}
        <EditorField label="Columns">
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
                  <span className="btn btn-secondary btn-small" style={{ marginTop: '5px' }} onClick={() => onColumnAdd()}>
                    Add Columns
                  </span>
                </div>
              </div>
            </div>
          </>
        </EditorField>
      </EditorRow>
    </>
  );
};
