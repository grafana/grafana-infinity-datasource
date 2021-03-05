import React, { useState } from 'react';
import { set } from 'lodash';
import { Select, Modal } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { InfinityQuery } from '../../shared/types';

interface URLOptionsProps {
  query: InfinityQuery;
  onChange: (value: any) => void;
}

export const URLOptions: React.FC<URLOptionsProps> = ({ query, onChange }) => {
  const [popupOpenStatus, setPopupOpenStatus] = useState(false);

  const URL_METHODS: SelectableValue[] = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
  ];

  const onInputTextChange = (value: string, field: string) => {
    set(query, field, value);
    onChange(query);
  };

  return (
    <div className="gf-form-inline">
      <div className="gf-form">
        {query.type === 'series' ? (
          <></>
        ) : (
          <>
            <label
              role="button"
              title="Expand for advanced query options like method, body, etc"
              className="btn btn-secondary btn-medium width-2"
              onClick={e => setPopupOpenStatus(true)}
              style={{ padding: '10px' }}
            >
              <i className="fa fa-expand fa-large btn btn-medium"></i>
            </label>
            <Modal title={'Advanced Options'} isOpen={popupOpenStatus} onDismiss={() => setPopupOpenStatus(false)}>
              <div className="gf-form-inline">
                <div className="gf-form">
                  <label className="gf-form-label query-keyword width-8">URL</label>
                  <input
                    type="text"
                    className="gf-form-input min-width-30"
                    value={query.url}
                    placeholder="https://jsonplaceholder.typicode.com/todos"
                    onChange={e => onInputTextChange(e.target.value, `url`)}
                  ></input>
                </div>
                <div className="gf-form">
                  <label className="gf-form-label query-keyword width-8">Method</label>
                  <Select
                    className="width-8 min-width-8"
                    value={URL_METHODS.find(e => e.value === (query.url_options.method || 'GET'))}
                    defaultValue={URL_METHODS.find(e => e.value === 'GET')}
                    options={URL_METHODS}
                    onChange={e => onInputTextChange(e.value || 'GET', 'url_options.method')}
                  ></Select>
                </div>
                {query.url_options.method === 'POST' ? (
                  <div className="gf-form">
                    <label className="gf-form-label query-keyword width-8">Body</label>
                    <textarea
                      rows={8}
                      className="gf-form-input min-width-30"
                      value={query.url_options.data}
                      placeholder="{
                                                query : {
                                                    # Write your query or mutation here
                                                }
                                            }"
                      onChange={e => onInputTextChange(e.target.value, `url_options.data`)}
                    ></textarea>
                  </div>
                ) : (
                  <></>
                )}
                <br />
                <br />
                <br />
                <br />
              </div>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
};
