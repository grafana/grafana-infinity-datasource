import React, { useState } from 'react';
import { Button, TextArea, Stack } from '@grafana/ui';
import { EditorRow } from './../../components/extended/EditorRow';
import { EditorField } from './../../components/extended/EditorField';
import { isBackendQuery, isDataQuery } from './../../app/utils';
import { QueryColumnItem } from './../../components/QueryColumnItem';
import { JSONOptionsEditor } from '../../components/JSONOptionsEditor';
import { CSVOptionsEditor } from '../../components/CSVOptionsEditor';
import { UQLEditor } from './query.uql';
import { GROQEditor } from './query.groq';
import type { InfinityColumn, InfinityQuery } from './../../types';

export const QueryColumnsEditor = (props: { query: InfinityQuery; onChange: (value: any) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
  if (!isDataQuery(query) && query.type !== 'google-sheets') {
    return <></>;
  }
  const onColumnAdd = () => {
    let columns = [...(query.columns || [])];
    const defaultColumn = { text: '', selector: '', type: 'string' };
    onChange({ ...query, columns: [...columns, defaultColumn] });
  };
  const onColumnRemove = (index: number) => {
    let columns = [...(query.columns || [])];
    columns.splice(index, 1);
    onChange({ ...query, columns });
  };
  return (
    <>
      <EditorRow
        label={
          (query.type === 'json' || query.type === 'graphql' || query.type === 'csv' || query.type === 'tsv' || query.type === 'xml') && query.parser === 'uql'
            ? 'UQL'
            : (query.type === 'json' || query.type === 'graphql' || query.type === 'csv' || query.type === 'tsv') && query.parser === 'groq'
              ? 'GROQ'
              : 'Parsing options & Result fields'
        }
        collapsible={true}
        collapsed={false}
        title={() => {
          switch (query.type) {
            case 'json':
            case 'graphql':
              if (query.parser === 'uql') {
                return 'UQL Query';
              }
              if (query.parser === 'groq') {
                return 'GROQ Query';
              }
              return `Field types, alias and selectors`;
            default:
              return 'Field types and alias';
          }
        }}
      >
        {(query.type === 'json' || query.type === 'csv' || query.type === 'tsv' || query.type === 'graphql' || query.type === 'xml') && query.parser === 'uql' ? (
          <UQLEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />
        ) : (query.type === 'json' || query.type === 'graphql') && query.parser === 'groq' ? (
          <GROQEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />
        ) : (
          <>
            <Stack direction="column">
              <RootSelector {...props} />
              {query.type === 'json' && <JSONOptionsEditor {...props} />}
              {(query.type === 'csv' || query.type === 'tsv') && <CSVOptionsEditor {...props} />}
            </Stack>
            <EditorField label="Columns" optional={true}>
              <>
                {query.columns.map((column: InfinityColumn, index: number) => {
                  return (
                    <div className="gf-form-inline" key={JSON.stringify(column) + index}>
                      <div className="gf-form">
                        <QueryColumnItem {...props} index={index} />
                        <Button
                          className="btn btn-danger btn-small"
                          icon="trash-alt"
                          variant="destructive"
                          fill="outline"
                          size="sm"
                          style={{ margin: '5px' }}
                          onClick={(e) => {
                            onColumnRemove(index);
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
                        style={{ marginTop: '5px', marginLeft: '5px' }}
                        onClick={(e) => {
                          onColumnAdd();
                          e.preventDefault();
                        }}
                      >
                        Add Columns
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            </EditorField>
          </>
        )}
      </EditorRow>
    </>
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
      <TextArea
        width={'300px'}
        cols={50}
        rows={isBackendQuery(query) ? 7 : 2}
        value={root_selector}
        placeholder={isBackendQuery(query) ? 'JSONata / rows selector' : 'rows/root selector (optional)'}
        onChange={(e) => setRootSelector(e.currentTarget.value)}
        onBlur={onRootSelectorChange}
      />
    </EditorField>
  ) : (
    <></>
  );
};
