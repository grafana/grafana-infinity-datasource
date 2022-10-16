import { Button } from '@grafana/ui';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import { EditorRow } from './../../components/extended/EditorRow';
import { EditorField } from './../../components/extended/EditorField';
import { ComputedColumnsEditor } from './query.computedColumns';
import { isDataQuery } from './../../app/utils';
import { QueryColumnItem } from './../../components/QueryColumnItem';
import { UQLEditor } from './query.uql';
import { GROQEditor } from './query.groq';
import { SQLiteEditor } from './query.sqlite';
import type { InfinityColumn, InfinityQuery } from './../../types';
import { Stack } from 'components/extended/Stack';

export const QueryColumnsEditor = (props: { query: InfinityQuery; onChange: (value: any) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
  if (!isDataQuery(query) && query.type !== 'google-sheets') {
    return <></>;
  }
  const onColumnAdd = () => {
    const columns = cloneDeep(query.columns || []);
    const defaultColumn = {
      text: '',
      selector: '',
      type: 'string',
    };
    onChange({ ...query, columns: [...columns, defaultColumn] });
    onRunQuery();
  };
  const onColumnRemove = (index: number) => {
    const columns = cloneDeep(query.columns || []);
    columns.splice(index, 1);
    onChange({ ...query, columns });
    onRunQuery();
  };
  return (
    <EditorRow
      collapsible={true}
      title={() => {
        switch (query.type) {
          case 'json':
          case 'graphql':
            return `root selector, columns, computed columns`;
          default:
            return 'columns, computed columns';
        }
      }}
    >
      {(query.type === 'json' || query.type === 'csv' || query.type === 'tsv' || query.type === 'graphql' || query.type === 'xml') && query.parser === 'uql' ? (
        <UQLEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />
      ) : (query.type === 'json' || query.type === 'graphql') && query.parser === 'groq' ? (
        <GROQEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />
      ) : query.type === 'json' && query.parser === 'sqlite' ? (
        <SQLiteEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />
      ) : (
        <>
          <RootSelector {...props} />
          <Stack direction="column">
            <EditorField label="Columns" optional={true}>
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
                      <Button variant="secondary" size="sm" style={{ marginTop: '5px', marginLeft: '5px' }} onClick={() => onColumnAdd()}>
                        Add Columns
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            </EditorField>
            <ComputedColumnsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />
          </Stack>
        </>
      )}
    </EditorRow>
  );
};

const RootSelector = (props: { query: InfinityQuery; onChange: (value: any) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
  const [root_selector, setRootSelector] = useState(isDataQuery(query) ? query.root_selector || '' : '');
  if (!isDataQuery(query)) {
    return <></>;
  }
  const onRootSelectorChange = () => {
    onChange({ ...query, root_selector });
    onRunQuery();
  };
  return ['html', 'json', 'xml', 'graphql'].indexOf(props.query.type) > -1 ? (
    <EditorField label="Rows/Root" optional={true}>
      <input
        type="text"
        className="gf-form-input"
        style={{ width: '300px' }}
        value={root_selector}
        placeholder="rows/root selector (optional)"
        onChange={(e) => setRootSelector(e.currentTarget.value)}
        onBlur={onRootSelectorChange}
      ></input>
    </EditorField>
  ) : (
    <></>
  );
};
