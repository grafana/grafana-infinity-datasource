import React, { useState } from 'react';
import { Checkbox, Drawer } from '@grafana/ui';
import { InfinityQuery } from '../../../types';

interface CSVOptionsEditorProps {
  query: InfinityQuery;
  onChange: (value: any) => void;
  onRunQuery: (value: any) => void;
}

export const CSVOptionsEditor: React.FC<CSVOptionsEditorProps> = (props) => {
  const [popupStatus, setPopupStatus] = useState(false);
  const togglePopup = () => {
    setPopupStatus(!popupStatus);
  };
  return (
    <>
      <div style={{ padding: 'auto 15px;' }}>
        <button className="btn btn-secondary" onClick={togglePopup}>
          CSV options
        </button>
      </div>
      {popupStatus === true && (
        <Drawer title="CSV Options" onClose={togglePopup}>
          <div className="gf-form">
            <label className="gf-form-label query-keyword width-8">Delimiter</label>
            <input
              className="gf-form-input width-4"
              type="text"
              value={props.query.csv_options?.delimiter}
              placeholder=","
              onChange={(e) => {
                props.onChange({
                  ...props.query,
                  csv_options: {
                    ...(props.query.csv_options || {}),
                    delimiter: e.currentTarget.value,
                  },
                });
              }}
            ></input>
          </div>
          <div className="gf-form">
            <label className="gf-form-label query-keyword width-8">Skip empty lines</label>
            <Checkbox
              css={{}}
              value={props.query.csv_options?.skip_empty_lines}
              onChange={(e) => {
                props.onChange({
                  ...props.query,
                  csv_options: {
                    ...(props.query.csv_options || {}),
                    skip_empty_lines: e.currentTarget.checked,
                  },
                });
              }}
            ></Checkbox>
          </div>
          <div className="gf-form">
            <label className="gf-form-label query-keyword width-8">Skip lines with error</label>
            <Checkbox
              css={{}}
              value={props.query.csv_options?.skip_lines_with_error}
              onChange={(e) => {
                props.onChange({
                  ...props.query,
                  csv_options: {
                    ...(props.query.csv_options || {}),
                    skip_lines_with_error: e.currentTarget.checked,
                  },
                });
              }}
            ></Checkbox>
          </div>
          <div className="gf-form">
            <label className="gf-form-label query-keyword width-8">Relax column count</label>
            <Checkbox
              css={{}}
              value={props.query.csv_options?.relax_column_count}
              onChange={(e) => {
                props.onChange({
                  ...props.query,
                  csv_options: {
                    ...(props.query.csv_options || {}),
                    relax_column_count: e.currentTarget.checked,
                  },
                });
              }}
            ></Checkbox>
          </div>
          <div className="gf-form">
            <label className="gf-form-label query-keyword width-8">Headers</label>
            <input
              className="gf-form-input width-30"
              type="text"
              value={props.query.csv_options?.columns}
              placeholder="Comma separated headers"
              onChange={(e) => {
                props.onChange({
                  ...props.query,
                  csv_options: {
                    ...(props.query.csv_options || {}),
                    columns: e.currentTarget.value,
                  },
                });
              }}
            ></input>
          </div>
          <div className="gf-form">
            <label className="gf-form-label query-keyword width-8">Comment</label>
            <input
              className="gf-form-input width-4"
              type="text"
              value={props.query.csv_options?.comment}
              placeholder="#"
              onChange={(e) => {
                props.onChange({
                  ...props.query,
                  csv_options: {
                    ...(props.query.csv_options || {}),
                    comment: e.currentTarget.value,
                  },
                });
              }}
            ></input>
          </div>
        </Drawer>
      )}
    </>
  );
};
