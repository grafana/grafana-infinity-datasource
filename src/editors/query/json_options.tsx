import React, { useState } from 'react';
import { Checkbox, Drawer } from '@grafana/ui';
import { InfinityQuery } from './../../types';

interface JSONOptionsEditorProps {
  query: InfinityQuery;
  onChange: (value: any) => void;
  onRunQuery: (value: any) => void;
}

export const JSONOptionsEditor: React.FC<JSONOptionsEditorProps> = props => {
  const [popupStatus, setPopupStatus] = useState(false);
  const togglePopup = () => {
    setPopupStatus(!popupStatus);
  };
  return (
    <>
      <div style={{ padding: 'auto 15px;' }}>
        <button className="btn btn-secondary" onClick={togglePopup}>
          JSON options
        </button>
      </div>
      {popupStatus === true && (
        <Drawer title="Advanced JSON parsing options" onClose={togglePopup}>
          <div className="gf-form">
            <label className="gf-form-label query-keyword width-14">Root returns object instead array?</label>
            <Checkbox
              css={{}}
              value={props.query.json_options?.root_is_not_array}
              onChange={e => {
                props.onChange({
                  ...props.query,
                  json_options: {
                    ...(props.query.json_options || {}),
                    root_is_not_array: e.currentTarget.checked,
                  },
                });
              }}
            ></Checkbox>
          </div>
        </Drawer>
      )}
    </>
  );
};
