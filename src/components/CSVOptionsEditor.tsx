import { Checkbox, InlineFormLabel, Input } from '@grafana/ui';
import React from 'react';
import { EditorField } from './extended/EditorField';
import type { InfinityCSVQueryOptions, InfinityQuery } from './../types';

export const CSVOptionsEditor = (props: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const LABEL_WIDTH = 10;
  const { query, onChange } = props;
  if (!(query.type === 'csv' || query.type === 'tsv')) {
    return <></>;
  }
  if (query.parser === 'uql') {
    return <></>;
  }
  const onCSVOptionsChange = <T extends keyof InfinityCSVQueryOptions, V extends InfinityCSVQueryOptions[T]>(key: T, value: V) => {
    if (query.type === 'csv' || query.type === 'tsv') {
      onChange({ ...query, csv_options: { ...(query.csv_options || {}), [key]: value } });
    }
  };
  return (
    <>
      <EditorField label="Advanced Options">
        <div style={{ paddingBlockStart: '4px' }}>
          {query.type === 'csv' && (
            <div className="gf-form">
              <InlineFormLabel width={LABEL_WIDTH} tooltip="Defaults to comma. If your file is TSV then use '\t'">
                Delimiter
              </InlineFormLabel>
              <Input width={4} value={query.csv_options?.delimiter} placeholder="," onChange={(e) => onCSVOptionsChange('delimiter', e.currentTarget.value)}></Input>
            </div>
          )}
          <div className="gf-form">
            <InlineFormLabel width={LABEL_WIDTH}>Skip empty lines</InlineFormLabel>
            <div style={{ margin: '5px' }}>
              <Checkbox data-testid="skip_empty_lines" value={query.csv_options?.skip_empty_lines} onChange={(e) => onCSVOptionsChange('skip_empty_lines', e.currentTarget.checked)}></Checkbox>
            </div>
          </div>
          <div className="gf-form">
            <InlineFormLabel width={LABEL_WIDTH}>Skip lines with error</InlineFormLabel>
            <div style={{ margin: '5px' }}>
              <Checkbox
                data-testid="skip_lines_with_error"
                value={query.csv_options?.skip_lines_with_error}
                onChange={(e) => onCSVOptionsChange('skip_lines_with_error', e.currentTarget.checked)}
              ></Checkbox>
            </div>
          </div>
          <div className="gf-form">
            <InlineFormLabel width={LABEL_WIDTH}>Relax column count</InlineFormLabel>
            <div style={{ margin: '5px' }}>
              <Checkbox value={query.csv_options?.relax_column_count} onChange={(e) => onCSVOptionsChange('relax_column_count', e.currentTarget.checked)}></Checkbox>
            </div>
          </div>
          <div className="gf-form">
            <InlineFormLabel width={LABEL_WIDTH}>Headers</InlineFormLabel>
            <Input width={30} value={query.csv_options?.columns} placeholder="Comma separated headers" onChange={(e) => onCSVOptionsChange('columns', e.currentTarget.value)}></Input>
          </div>
          <div className="gf-form">
            <InlineFormLabel width={LABEL_WIDTH}>Comment</InlineFormLabel>
            <Input width={4} value={query.csv_options?.comment} placeholder="#" onChange={(e) => onCSVOptionsChange('comment', e.currentTarget.value)}></Input>
          </div>
        </div>
      </EditorField>
    </>
  );
};
