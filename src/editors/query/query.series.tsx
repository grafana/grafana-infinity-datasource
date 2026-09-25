import { VariableOrigin } from '@grafana/data';
import { DataLinkInput, Modal, Combobox, Input, ComboboxOption } from '@grafana/ui';
import { defaultsDeep, set } from 'lodash';
import React, { useState } from 'react';
import { EditorRow } from '@/components/extended/EditorRow';
import { EditorField } from '@/components/extended/EditorField';
import type { InfinitySeriesQuery, DataOverride } from '@/types';

export const SeriesEditor = ({ query, onChange }: { query: InfinitySeriesQuery; onChange: (value: any) => void }) => {
  const queryClone = defaultsDeep({}, query, { alias: 'Random Walk' });
  const onInputTextChange = <T extends InfinitySeriesQuery, K extends keyof T, V extends T[K]>(value: V, field: K | 'expression') => {
    set(queryClone, field, value);
    onChange(queryClone);
  };
  return (
    <>
      <EditorRow label="Series">
        <div className="gf-form-inline">
          <EditorField label="Alias">
            <DataLinkInput
              onChange={(e) => onInputTextChange(e, `alias`)}
              suggestions={[{ label: 'Series Index', value: '__series.index', origin: VariableOrigin.Series }]}
              value={queryClone.alias || ''}
              placeholder="Alias / Random Walk"
            />
          </EditorField>
          <EditorField label="Series Count">
            <Input type="number" width={12} value={queryClone.seriesCount} placeholder="1" onChange={(e) => onInputTextChange(e.currentTarget.valueAsNumber || 1, `seriesCount`)} />
          </EditorField>
          {queryClone.source === 'expression' && (
            <EditorField label="Expression">
              <DataLinkInput
                onChange={(e) => onInputTextChange(e, `expression`)}
                suggestions={[
                  { label: 'Series Index', value: '__series.index', origin: VariableOrigin.Series },
                  { label: 'Value Index', value: '__value.index', origin: VariableOrigin.Value },
                ]}
                value={queryClone.expression || '                                             '}
                placeholder="Expression"
              />
            </EditorField>
          )}
          <EditorField label="Advanced Options">
            <SeriesAdvancedOptions onChange={onChange} query={queryClone} />
          </EditorField>
        </div>
      </EditorRow>
    </>
  );
};

// exported for testing purposes only
export const SeriesAdvancedOptions = ({ query, onChange }: { query: InfinitySeriesQuery; onChange: (value: any) => void }) => {
  const queryClone = defaultsDeep({}, query, { dataOverrides: [] });

  const [popupState, setPopupState] = useState(false);

  const DATA_OVERRIDE_OPERATORS: Array<ComboboxOption<string>> = ['=', '<', '<=', '>', '>=', '!='].map((o) => {
    return {
      label: o,
      value: o,
    };
  });

  const addDataOverride = () => {
    const queryDataOverrides = queryClone.dataOverrides || [];
    let newOverride: DataOverride = {
      values: ['${__value.index}', '10'],
      operator: '>=',
      override: 'null',
    };
    const dataOverrides = queryDataOverrides.concat(newOverride);
    onChange({ ...queryClone, dataOverrides });
  };
  const removeDataOverride = (index: number) => {
    const queryDataOverrides = queryClone.dataOverrides || [];
    const dataOverrides = queryDataOverrides.filter((_: any, i: number) => i !== index);
    onChange({ ...queryClone, dataOverrides });
  };

  const onTextChange = (value: string, field: string) => {
    set(queryClone, field, value);
    onChange(queryClone);
  };

  return (
    <div className="gf-form-inline">
      <div className="gf-form">
        {query.type !== 'series' ? (
          <></>
        ) : (
          <>
            <label role="button" onClick={() => setPopupState(!popupState)} title="Advanced Options" className="btn btn-secondary btn-small" style={{ marginTop: '4px', padding: '10px' }}>
              Advanced Options <i className="fa fa-expand fa-large btn btn-small"></i>
            </label>
            <Modal
              ariaLabel="Advanced Options"
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
                  <label className="gf-form-label width-8">Data Overrides</label>
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
                      <div className="gf-form-inline" key={index}>
                        <div className="gf-form">
                          <label className="gf-form-label width-8">Override {index + 1}</label>
                          <input
                            type="text"
                            className="gf-form-input min-width-10 width-10"
                            value={override.values[0]}
                            onChange={(e) => onTextChange(e.target.value, `dataOverrides[${index}].values[0]`)}
                            placeholder="Value 1"
                          ></input>
                          <Combobox
                            width={8}
                            value={DATA_OVERRIDE_OPERATORS.find((option) => option.value === override.operator)?.value || override.operator}
                            options={DATA_OVERRIDE_OPERATORS}
                            onChange={(e) => onTextChange((e.value || '') as string, `dataOverrides[${index}].operator`)}
                          />
                          <input
                            type="text"
                            className="gf-form-input min-width-10 width-10"
                            value={override.values[1]}
                            onChange={(e) => onTextChange(e.target.value, `dataOverrides[${index}].values[1]`)}
                            placeholder="Value 2"
                          ></input>
                          <input
                            type="text"
                            className="gf-form-input min-width-8 width-8"
                            value={override.override}
                            onChange={(e) => onTextChange(e.target.value, `dataOverrides[${index}].override`)}
                            placeholder="Override value"
                          ></input>
                          <span className="btn btn-success btn-small" style={{ margin: '5px' }} onClick={() => addDataOverride()}>
                            +
                          </span>
                          <span className="btn btn-danger btn-small" style={{ margin: '5px' }} onClick={() => removeDataOverride(index)}>
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
