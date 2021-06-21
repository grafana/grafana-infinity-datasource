import React, { useState } from 'react';
import { Checkbox, Drawer } from '@grafana/ui';
import { InfinityQuery } from '../../types';

interface JSONOptionsEditorProps {
  query: InfinityQuery;
  onChange: (value: any) => void;
  onRunQuery: (value: any) => void;
}

export const JSONOptionsEditor: React.FC<JSONOptionsEditorProps> = (props) => {
  const { query, onChange } = props;
  const { json_options = {} } = query;
  const [popupStatus, setPopupStatus] = useState(false);
  return (
    <>
      <div style={{ padding: 'auto 15px;' }}>
        <button className="btn btn-secondary" onClick={() => setPopupStatus(!popupStatus)}>
          JSON options
        </button>
      </div>
      {popupStatus === true && (
        <Drawer title="Advanced JSON parsing options" onClose={() => setPopupStatus(!popupStatus)}>
          <div className="gf-form">
            <label className="gf-form-label query-keyword width-14">Root returns object instead array?</label>
            <Checkbox
              css={{}}
              value={json_options.root_is_not_array}
              onChange={(e) => {
                onChange({
                  ...query,
                  json_options: {
                    ...json_options,
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
