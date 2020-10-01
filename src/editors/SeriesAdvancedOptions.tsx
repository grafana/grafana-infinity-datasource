import React, { useState } from 'react';
import { defaultsDeep, set } from 'lodash';
import { Modal, Select } from '@grafana/ui';
import { InfinityQuery, DataOverride } from '../types';

interface SeriesAdvancedOptionsProps {
  query: InfinityQuery;
  onChange: (value: any) => void;
}

export const SeriesAdvancedOptions: React.FC<SeriesAdvancedOptionsProps> = ({ query, onChange }) => {
  query = defaultsDeep(query, {
    dataOverrides: [],
  });

  const [popupState, setPopupState] = useState(false);

  const DATA_OVERRIDE_OPERATORS = ['=', '<', '<=', '>', '>=', '!='].map(o => {
    return {
      label: o,
      value: o,
    };
  });

  const addDataOverride = () => {
    query.dataOverrides = query.dataOverrides || [];
    let newOverride: DataOverride = {
      values: ['${__value.index}', '10'],
      operator: '>=',
      override: 'null',
    };
    query.dataOverrides.push(newOverride);
    onChange(query);
  };
  const removeDataOverride = (index: number) => {
    query.dataOverrides = query.dataOverrides || [];
    query.dataOverrides.splice(index, 1);
    onChange(query);
  };

  const onTextChange = (value: string, field: string) => {
    set(query, field, value);
    onChange(query);
  };

  return (
    <div className="gf-form-inline">
      <div className="gf-form">
        {query.type !== 'series' ? (
          <></>
        ) : (
          <>
            <label className="gf-form-label query-keyword width-8">Advanced Options</label>
            <label
              role="button"
              onClick={() => setPopupState(!popupState)}
              title="Advanced Options"
              className="btn btn-secondary btn-small"
              style={{ marginTop: '4px', padding: '10px' }}
            >
              Advanced Options <i className="fa fa-expand fa-large btn btn-small"></i>
            </label>
            <Modal
              title={
                <div className="modal-header-title">
                  <span className="p-l-1">Advanced Options</span>
                </div>
              }
              isOpen={popupState}
              onDismiss={() => setPopupState(false)}
            >
              <div className="gf-form-inline">
                <div className="gf-form">
                  <label className="gf-form-label width-6">Data Overrides</label>
                  {query.dataOverrides && query.dataOverrides.length > 0 ? (
                    <></>
                  ) : (
                    <>
                      <label className="gf-form-label query-keyword width-20" onClick={() => addDataOverride()}>
                        Click to add Overrides
                      </label>
                    </>
                  )}
                </div>
              </div>
              {query.dataOverrides && query.dataOverrides.length > 0 ? (
                <>
                  {query.dataOverrides.map((override: DataOverride, index: number) => {
                    return (
                      <div className="gf-form-inline">
                        <div className="gf-form">
                          <label className="gf-form-label width-6">Override {index + 1}</label>
                          <input
                            type="text"
                            className="gf-form-input min-width-10 width-10"
                            value={override.values[0]}
                            onChange={e => onTextChange(e.target.value, `dataOverrides[${index}].values[0]`)}
                            placeholder="Value 1"
                          ></input>
                          <Select
                            className="width-4"
                            value={DATA_OVERRIDE_OPERATORS.find((options: any) => options.value === override.operator)}
                            defaultValue={override.operator}
                            options={DATA_OVERRIDE_OPERATORS}
                            onChange={e => onTextChange(e.value || '', `dataOverrides[${index}].operator`)}
                          ></Select>
                          <input
                            type="text"
                            className="gf-form-input min-width-10 width-10"
                            value={override.values[1]}
                            onChange={e => onTextChange(e.target.value, `dataOverrides[${index}].values[1]`)}
                            placeholder="Value 2"
                          ></input>
                          <input
                            type="text"
                            className="gf-form-input min-width-8 width-8"
                            value={override.override}
                            onChange={e => onTextChange(e.target.value, `dataOverrides[${index}].override`)}
                            placeholder="Override value"
                          ></input>
                          <span
                            className="btn btn-success btn-small"
                            style={{ margin: '5px' }}
                            onClick={() => addDataOverride()}
                          >
                            +
                          </span>
                          <span
                            className="btn btn-danger btn-small"
                            style={{ margin: '5px' }}
                            onClick={() => removeDataOverride(index)}
                          >
                            X
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <></>
              )}
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
            </Modal>
          </>
        )}
      </div>
    </div>
  );
};
