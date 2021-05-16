import React, { useState } from 'react';
import { Drawer } from '@grafana/ui';
import { InfinityQuery } from './../../types';

interface CSVOptionsEditorProps {
  query: InfinityQuery;
  onChange: (value: any) => void;
  onRunQuery: (value: any) => void;
}

export const CSVOptionsEditor: React.FC<CSVOptionsEditorProps> = props => {
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
          <div className="gf-form-inline">
            <div className="gf-form">
              <label className="gf-form-label query-keyword width-8">Delimiter</label>
              <input
                className="gf-form-input width-2"
                type="text"
                value={props.query.csv_options?.delimiter}
                placeholder=","
                onChange={e => {
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
          </div>
        </Drawer>
      )}
    </>
  );
};
