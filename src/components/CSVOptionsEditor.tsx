import React, { useState } from 'react';
import { Checkbox, Drawer, Button, InlineFormLabel } from '@grafana/ui';
import { InfinityQuery } from '../types';

interface CSVOptionsEditorProps {
  query: InfinityQuery;
  onChange: (value: any) => void;
  onRunQuery: (value: any) => void;
}

export const CSVOptionsEditor = (props: CSVOptionsEditorProps) => {
  const [popupStatus, setPopupStatus] = useState(false);
  const togglePopup = () => {
    setPopupStatus(!popupStatus);
  };
  const onDelimiterChange = (delimiter: string) => {
    props.onChange({
      ...props.query,
      csv_options: {
        ...(props.query.csv_options || {}),
        delimiter,
      },
    });
  };
  const onSkipEmptyLinesChange = (skip_empty_lines: boolean) => {
    props.onChange({
      ...props.query,
      csv_options: {
        ...(props.query.csv_options || {}),
        skip_empty_lines,
      },
    });
  };
  const onSkipLinesWithErrorChange = (skip_lines_with_error: boolean) => {
    props.onChange({
      ...props.query,
      csv_options: {
        ...(props.query.csv_options || {}),
        skip_lines_with_error,
      },
    });
  };
  const onRelaxColumnCountChange = (relax_column_count: boolean) => {
    props.onChange({
      ...props.query,
      csv_options: {
        ...(props.query.csv_options || {}),
        relax_column_count,
      },
    });
  };
  const onColumnsChange = (columns: string) => {
    props.onChange({
      ...props.query,
      csv_options: {
        ...(props.query.csv_options || {}),
        columns,
      },
    });
  };
  const onCommentChange = (comment: string) => {
    props.onChange({
      ...props.query,
      csv_options: {
        ...(props.query.csv_options || {}),
        comment,
      },
    });
  };
  return (
    <>
      <div style={{ padding: 'auto 15px;' }}>
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
          CSV options
        </Button>
      </div>
      {popupStatus === true && (
        <Drawer title="CSV Options" onClose={togglePopup} expandable={true}>
          <div className="gf-form">
            <InlineFormLabel
              className="gf-form-label query-keyword width-8"
              tooltip="Defaults to comma. If your file is TSV then use '\t'"
            >
              Delimiter
            </InlineFormLabel>
            <input
              className="gf-form-input width-4"
              type="text"
              value={props.query.csv_options?.delimiter}
              placeholder=","
              onChange={(e) => onDelimiterChange(e.currentTarget.value)}
            ></input>
          </div>
          <div className="gf-form">
            <InlineFormLabel className="gf-form-label query-keyword width-8">Skip empty lines</InlineFormLabel>
            <Checkbox
              css={{}}
              value={props.query.csv_options?.skip_empty_lines}
              onChange={(e) => onSkipEmptyLinesChange(e.currentTarget.checked)}
            ></Checkbox>
          </div>
          <div className="gf-form">
            <InlineFormLabel className="gf-form-label query-keyword width-8">Skip lines with error</InlineFormLabel>
            <Checkbox
              css={{}}
              value={props.query.csv_options?.skip_lines_with_error}
              onChange={(e) => onSkipLinesWithErrorChange(e.currentTarget.checked)}
            ></Checkbox>
          </div>
          <div className="gf-form">
            <InlineFormLabel className="gf-form-label query-keyword width-8">Relax column count</InlineFormLabel>
            <Checkbox
              css={{}}
              value={props.query.csv_options?.relax_column_count}
              onChange={(e) => onRelaxColumnCountChange(e.currentTarget.checked)}
            ></Checkbox>
          </div>
          <div className="gf-form">
            <InlineFormLabel className="gf-form-label query-keyword width-8">Headers</InlineFormLabel>
            <input
              className="gf-form-input width-30"
              type="text"
              value={props.query.csv_options?.columns}
              placeholder="Comma separated headers"
              onChange={(e) => onColumnsChange(e.currentTarget.value)}
            ></input>
          </div>
          <div className="gf-form">
            <InlineFormLabel className="gf-form-label query-keyword width-8">Comment</InlineFormLabel>
            <input
              className="gf-form-input width-4"
              type="text"
              value={props.query.csv_options?.comment}
              placeholder="#"
              onChange={(e) => onCommentChange(e.currentTarget.value)}
            ></input>
          </div>
        </Drawer>
      )}
    </>
  );
};
