import React, { useState } from 'react';
import { Checkbox, Drawer, Button, InlineFormLabel, Input } from '@grafana/ui';
import { InfinityQuery, InfinityCSVQueryOptions } from '../types';

export const CSVOptionsEditor = (props: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const [popupStatus, setPopupStatus] = useState(false);
  const LABEL_WIDTH = 8;
  const { query, onChange, onRunQuery } = props;
  if (!(query.type === 'csv' || query.type === 'tsv')) {
    return <></>;
  }
  const togglePopup = () => setPopupStatus(!popupStatus);
  const onCSVOptionsChange = <T extends keyof InfinityCSVQueryOptions, V extends InfinityCSVQueryOptions[T]>(key: T, value: V) => {
    if (query.type === 'csv' || query.type === 'tsv') {
      onChange({ ...query, csv_options: { ...(query.csv_options || {}), [key]: value } });
    }
  };
  return (
    <>
      <div style={{ padding: 'auto 15px' }}>
        <Button
          variant="secondary"
          size="sm"
          icon="cog"
          style={{ margin: '5px' }}
          onClick={(e) => {
            togglePopup();
            e.preventDefault();
          }}
        >
          {query.type.toUpperCase()} options
        </Button>
      </div>
      {popupStatus === true && (
        <Drawer
          title={query.type.toUpperCase() + ' options'}
          onClose={() => {
            togglePopup();
            onRunQuery();
          }}
          expandable={true}
        >
          {query.type === 'csv' && (
            <div className="gf-form">
              <InlineFormLabel className="query-keyword" width={LABEL_WIDTH} tooltip="Defaults to comma. If your file is TSV then use '\t'">
                Delimiter
              </InlineFormLabel>
              <Input css={{}} width={4} value={query.csv_options?.delimiter} placeholder="," onChange={(e) => onCSVOptionsChange('delimiter', e.currentTarget.value)}></Input>
            </div>
          )}
          <div className="gf-form">
            <InlineFormLabel className="query-keyword" width={LABEL_WIDTH}>
              Skip empty lines
            </InlineFormLabel>
            <div style={{ margin: '5px' }}>
              <Checkbox
                data-testid="skip_empty_lines"
                css={{}}
                value={query.csv_options?.skip_empty_lines}
                onChange={(e) => onCSVOptionsChange('skip_empty_lines', e.currentTarget.checked)}
              ></Checkbox>
            </div>
          </div>
          <div className="gf-form">
            <InlineFormLabel className="query-keyword" width={LABEL_WIDTH}>
              Skip lines with error
            </InlineFormLabel>
            <div style={{ margin: '5px' }}>
              <Checkbox
                data-testid="skip_lines_with_error"
                css={{}}
                value={query.csv_options?.skip_lines_with_error}
                onChange={(e) => onCSVOptionsChange('skip_lines_with_error', e.currentTarget.checked)}
              ></Checkbox>
            </div>
          </div>
          <div className="gf-form">
            <InlineFormLabel className="query-keyword" width={LABEL_WIDTH}>
              Relax column count
            </InlineFormLabel>
            <div style={{ margin: '5px' }}>
              <Checkbox css={{}} value={query.csv_options?.relax_column_count} onChange={(e) => onCSVOptionsChange('relax_column_count', e.currentTarget.checked)}></Checkbox>
            </div>
          </div>
          <div className="gf-form">
            <InlineFormLabel className="query-keyword" width={LABEL_WIDTH}>
              Headers
            </InlineFormLabel>
            <Input css={{}} width={30} value={query.csv_options?.columns} placeholder="Comma separated headers" onChange={(e) => onCSVOptionsChange('columns', e.currentTarget.value)}></Input>
          </div>
          <div className="gf-form">
            <InlineFormLabel className="query-keyword" width={LABEL_WIDTH}>
              Comment
            </InlineFormLabel>
            <Input css={{}} width={4} value={query.csv_options?.comment} placeholder="#" onChange={(e) => onCSVOptionsChange('comment', e.currentTarget.value)}></Input>
          </div>
        </Drawer>
      )}
    </>
  );
};
